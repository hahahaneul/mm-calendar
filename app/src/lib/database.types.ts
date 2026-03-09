export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: string;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          email?: string;
          role?: string;
          color?: string;
        };
        Update: {
          name?: string;
          email?: string;
          role?: string;
          color?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          color: string;
          order: number;
          subcategories: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          order?: number;
          subcategories?: string[];
        };
        Update: {
          name?: string;
          color?: string;
          order?: number;
          subcategories?: string[];
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          project_id: string;
          tags: string[];
          owner_name: string;
          owner_id: string | null;
          status: string;
          start_at: string;
          end_at: string;
          all_day: boolean;
          color: string | null;
          subcategory: string | null;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          project_id: string;
          tags?: string[];
          owner_name?: string;
          owner_id?: string | null;
          status?: string;
          start_at: string;
          end_at: string;
          all_day?: boolean;
          color?: string | null;
          subcategory?: string | null;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          title?: string;
          description?: string;
          project_id?: string;
          tags?: string[];
          owner_name?: string;
          owner_id?: string | null;
          status?: string;
          start_at?: string;
          end_at?: string;
          all_day?: boolean;
          color?: string | null;
          subcategory?: string | null;
          updated_at?: string;
          updated_by?: string;
        };
      };
      todos: {
        Row: {
          id: string;
          member_id: string;
          date_key: string;
          title: string;
          completed: boolean;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          date_key: string;
          title: string;
          completed?: boolean;
          order?: number;
        };
        Update: {
          title?: string;
          completed?: boolean;
          order?: number;
        };
      };
      tags: {
        Row: {
          id: string;
          label: string;
          color: string;
        };
        Insert: {
          id?: string;
          label: string;
          color?: string;
        };
        Update: {
          label?: string;
          color?: string;
        };
      };
      webhooks: {
        Row: {
          id: string;
          endpoint: string;
          events: string[];
          status: string;
          last_delivered_at: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          endpoint: string;
          events?: string[];
          status?: string;
          created_by?: string | null;
        };
        Update: {
          endpoint?: string;
          events?: string[];
          status?: string;
          last_delivered_at?: string | null;
        };
      };
    };
  };
}
