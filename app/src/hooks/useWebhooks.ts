import { useState, useEffect, useCallback } from 'react';
import type { WebhookSubscription } from '../types';
import { supabase } from '../lib/supabase';
import { dbWebhookToWebhook } from '../lib/mappers';

export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);

  // Fetch on mount
  useEffect(() => {
    supabase.from('webhooks').select('*').then(({ data }) => {
      if (data) setWebhooks(data.map(dbWebhookToWebhook));
    });
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('realtime-webhooks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'webhooks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setWebhooks((prev) => {
            if (prev.some((w) => w.id === (payload.new as any).id)) return prev;
            return [...prev, dbWebhookToWebhook(payload.new as any)];
          });
        } else if (payload.eventType === 'UPDATE') {
          setWebhooks((prev) =>
            prev.map((w) => (w.id === (payload.new as any).id ? dbWebhookToWebhook(payload.new as any) : w))
          );
        } else if (payload.eventType === 'DELETE') {
          setWebhooks((prev) => prev.filter((w) => w.id !== (payload.old as any).id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const addWebhook = useCallback(async (endpoint: string, events: string[]) => {
    const id = crypto.randomUUID();
    const wh: WebhookSubscription = {
      id,
      endpoint,
      events,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setWebhooks((prev) => [...prev, wh]);
    await supabase.from('webhooks').insert({ id, endpoint, events, status: 'active' });
  }, []);

  const updateWebhookStatus = useCallback(
    async (id: string, status: WebhookSubscription['status']) => {
      setWebhooks((prev) =>
        prev.map((wh) => (wh.id === id ? { ...wh, status } : wh))
      );
      await supabase.from('webhooks').update({ status }).eq('id', id);
    },
    []
  );

  const updateWebhookEvents = useCallback(async (id: string, events: string[]) => {
    setWebhooks((prev) =>
      prev.map((wh) => (wh.id === id ? { ...wh, events } : wh))
    );
    await supabase.from('webhooks').update({ events }).eq('id', id);
  }, []);

  const deleteWebhook = useCallback(async (id: string) => {
    setWebhooks((prev) => prev.filter((wh) => wh.id !== id));
    await supabase.from('webhooks').delete().eq('id', id);
  }, []);

  return {
    webhooks,
    addWebhook,
    updateWebhookStatus,
    updateWebhookEvents,
    deleteWebhook,
  };
}
