import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
];

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verify caller is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: '인증이 필요합니다.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify caller identity
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: authError } = await anonClient.auth.getUser();
    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: '인증에 실패했습니다.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 2. Check caller is admin
    const { data: callerProfile } = await anonClient
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single();

    if (callerProfile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: '관리자 권한이 필요합니다.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 3. Parse request body
    const { name, email, role } = await req.json();
    if (!email) {
      return new Response(
        JSON.stringify({ error: '이메일을 입력하세요.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 4. Invite user via admin API
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: inviteData, error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(email, {
        data: { name, role },
        redirectTo: `${req.headers.get('origin') || supabaseUrl}`,
      });

    if (inviteError) {
      return new Response(
        JSON.stringify({ error: inviteError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const newUserId = inviteData.user.id;
    const displayName = name || email.split('@')[0];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const memberRole = role || 'member';

    // 5. Wait for handle_new_user trigger to create profile, then update it
    let profileUpdated = false;
    for (let i = 0; i < 5; i++) {
      const { error: updateError } = await adminClient
        .from('profiles')
        .update({ name: displayName, role: memberRole, color })
        .eq('id', newUserId);

      if (!updateError) {
        profileUpdated = true;
        break;
      }
      // Trigger might not have fired yet, wait and retry
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // If trigger didn't fire, insert the profile directly
    if (!profileUpdated) {
      await adminClient.from('profiles').upsert({
        id: newUserId,
        name: displayName,
        email,
        role: memberRole,
        color,
      });
    }

    // 6. Return the new member
    return new Response(
      JSON.stringify({
        id: newUserId,
        name: displayName,
        email,
        role: memberRole,
        color,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || '알 수 없는 오류가 발생했습니다.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
