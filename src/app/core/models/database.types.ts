export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'doctor';
          avatar_url: string | null;
          specialty: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: 'admin' | 'doctor';
          avatar_url?: string | null;
          specialty?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'admin' | 'doctor';
          avatar_url?: string | null;
          specialty?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          color: string;
          icon: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          description?: string;
          color?: string;
          icon?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          color?: string;
          icon?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      diseases: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          name: string;
          code: string;
          description: string;
          severity: 'mild' | 'moderate' | 'severe';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          name: string;
          code?: string;
          description?: string;
          severity?: 'mild' | 'moderate' | 'severe';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          name?: string;
          code?: string;
          description?: string;
          severity?: 'mild' | 'moderate' | 'severe';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "diseases_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      treatments: {
        Row: {
          id: string;
          user_id: string;
          disease_id: string | null;
          name: string;
          regimen: string;
          duration: string;
          clinical_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          disease_id?: string | null;
          name: string;
          regimen?: string;
          duration?: string;
          clinical_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          disease_id?: string | null;
          name?: string;
          regimen?: string;
          duration?: string;
          clinical_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "treatments_disease_id_fkey";
            columns: ["disease_id"];
            isOneToOne: false;
            referencedRelation: "diseases";
            referencedColumns: ["id"];
          }
        ];
      };
      recommendations: {
        Row: {
          id: string;
          user_id: string;
          treatment_id: string | null;
          type: 'general' | 'diet' | 'alarm_sign' | 'indication';
          title: string;
          description: string;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          treatment_id?: string | null;
          type: 'general' | 'diet' | 'alarm_sign' | 'indication';
          title: string;
          description?: string;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          treatment_id?: string | null;
          type?: 'general' | 'diet' | 'alarm_sign' | 'indication';
          title?: string;
          description?: string;
          order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recommendations_treatment_id_fkey";
            columns: ["treatment_id"];
            isOneToOne: false;
            referencedRelation: "treatments";
            referencedColumns: ["id"];
          }
        ];
      };
      clinical_notes: {
        Row: {
          id: string;
          user_id: string;
          treatment_id: string | null;
          disease_id: string | null;
          patient_reference: string | null;
          title: string;
          content: string;
          note_type: 'clinical' | 'dosage' | 'interaction' | 'observation' | 'alarm';
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          treatment_id?: string | null;
          disease_id?: string | null;
          patient_reference?: string | null;
          title: string;
          content: string;
          note_type?: 'clinical' | 'dosage' | 'interaction' | 'observation' | 'alarm';
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          treatment_id?: string | null;
          disease_id?: string | null;
          patient_reference?: string | null;
          title?: string;
          content?: string;
          note_type?: 'clinical' | 'dosage' | 'interaction' | 'observation' | 'alarm';
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clinical_notes_treatment_id_fkey";
            columns: ["treatment_id"];
            isOneToOne: false;
            referencedRelation: "treatments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_notes_disease_id_fkey";
            columns: ["disease_id"];
            isOneToOne: false;
            referencedRelation: "diseases";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      admin_users_view: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'doctor';
          avatar_url: string | null;
          specialty: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      get_current_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      admin_get_users: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'doctor';
          avatar_url: string | null;
          specialty: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        }[];
      };
      admin_set_user_role: {
        Args: {
          target_user_id: string;
          new_role: string;
        };
        Returns: void;
      };
      admin_toggle_user_status: {
        Args: {
          target_user_id: string;
          new_status: boolean;
        };
        Returns: void;
      };
      admin_delete_user: {
        Args: {
          target_user_id: string;
        };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
