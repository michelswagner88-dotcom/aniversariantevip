export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      aniversariantes: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          cpf: string
          created_at: string | null
          data_nascimento: string
          deleted_at: string | null
          estado: string | null
          id: string
          latitude: number | null
          logradouro: string | null
          longitude: number | null
          numero: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf: string
          created_at?: string | null
          data_nascimento: string
          deleted_at?: string | null
          estado?: string | null
          id: string
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          numero?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string
          created_at?: string | null
          data_nascimento?: string
          deleted_at?: string | null
          estado?: string | null
          id?: string
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          numero?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cupom_rate_limit: {
        Row: {
          aniversariante_id: string
          contador_semanal: number
          estabelecimento_id: string
          id: string
          semana_referencia: string
          ultima_emissao: string
        }
        Insert: {
          aniversariante_id: string
          contador_semanal?: number
          estabelecimento_id: string
          id?: string
          semana_referencia?: string
          ultima_emissao?: string
        }
        Update: {
          aniversariante_id?: string
          contador_semanal?: number
          estabelecimento_id?: string
          id?: string
          semana_referencia?: string
          ultima_emissao?: string
        }
        Relationships: [
          {
            foreignKeyName: "cupom_rate_limit_aniversariante_id_fkey"
            columns: ["aniversariante_id"]
            isOneToOne: false
            referencedRelation: "aniversariantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cupom_rate_limit_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      cupons: {
        Row: {
          aniversariante_id: string
          codigo: string
          created_at: string
          data_emissao: string
          data_uso: string | null
          data_validade: string | null
          deleted_at: string | null
          estabelecimento_id: string
          id: string
          usado: boolean
        }
        Insert: {
          aniversariante_id: string
          codigo: string
          created_at?: string
          data_emissao?: string
          data_uso?: string | null
          data_validade?: string | null
          deleted_at?: string | null
          estabelecimento_id: string
          id?: string
          usado?: boolean
        }
        Update: {
          aniversariante_id?: string
          codigo?: string
          created_at?: string
          data_emissao?: string
          data_uso?: string | null
          data_validade?: string | null
          deleted_at?: string | null
          estabelecimento_id?: string
          id?: string
          usado?: boolean
        }
        Relationships: []
      }
      email_analytics: {
        Row: {
          click_count: number | null
          clicked_at: string | null
          created_at: string | null
          email_address: string
          email_type: string
          id: string
          ip_address: string | null
          opened_at: string | null
          sent_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          click_count?: number | null
          clicked_at?: string | null
          created_at?: string | null
          email_address: string
          email_type: string
          id?: string
          ip_address?: string | null
          opened_at?: string | null
          sent_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          click_count?: number | null
          clicked_at?: string | null
          created_at?: string | null
          email_address?: string
          email_type?: string
          id?: string
          ip_address?: string | null
          opened_at?: string | null
          sent_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "affiliate_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "email_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      estabelecimento_analytics: {
        Row: {
          data_evento: string
          estabelecimento_id: string
          id: string
          metadata: Json | null
          tipo_evento: string
          user_id: string | null
        }
        Insert: {
          data_evento?: string
          estabelecimento_id: string
          id?: string
          metadata?: Json | null
          tipo_evento: string
          user_id?: string | null
        }
        Update: {
          data_evento?: string
          estabelecimento_id?: string
          id?: string
          metadata?: Json | null
          tipo_evento?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estabelecimento_analytics_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      estabelecimentos: {
        Row: {
          ativo: boolean
          bairro: string | null
          categoria: string[] | null
          cep: string | null
          cidade: string | null
          cnpj: string
          complemento: string | null
          created_at: string | null
          deleted_at: string | null
          descricao_beneficio: string | null
          endereco: string | null
          estado: string | null
          horario_funcionamento: string | null
          id: string
          instagram: string | null
          latitude: number | null
          link_cardapio: string | null
          logo_url: string | null
          logradouro: string | null
          longitude: number | null
          nome_fantasia: string | null
          numero: string | null
          periodo_validade_beneficio: string | null
          plan_status: string | null
          razao_social: string
          referred_by_user_id: string | null
          regras_utilizacao: string | null
          site: string | null
          stripe_customer_id: string | null
          telefone: string | null
          tem_conta_acesso: boolean | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean
          bairro?: string | null
          categoria?: string[] | null
          cep?: string | null
          cidade?: string | null
          cnpj: string
          complemento?: string | null
          created_at?: string | null
          deleted_at?: string | null
          descricao_beneficio?: string | null
          endereco?: string | null
          estado?: string | null
          horario_funcionamento?: string | null
          id?: string
          instagram?: string | null
          latitude?: number | null
          link_cardapio?: string | null
          logo_url?: string | null
          logradouro?: string | null
          longitude?: number | null
          nome_fantasia?: string | null
          numero?: string | null
          periodo_validade_beneficio?: string | null
          plan_status?: string | null
          razao_social: string
          referred_by_user_id?: string | null
          regras_utilizacao?: string | null
          site?: string | null
          stripe_customer_id?: string | null
          telefone?: string | null
          tem_conta_acesso?: boolean | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean
          bairro?: string | null
          categoria?: string[] | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string
          complemento?: string | null
          created_at?: string | null
          deleted_at?: string | null
          descricao_beneficio?: string | null
          endereco?: string | null
          estado?: string | null
          horario_funcionamento?: string | null
          id?: string
          instagram?: string | null
          latitude?: number | null
          link_cardapio?: string | null
          logo_url?: string | null
          logradouro?: string | null
          longitude?: number | null
          nome_fantasia?: string | null
          numero?: string | null
          periodo_validade_beneficio?: string | null
          plan_status?: string | null
          razao_social?: string
          referred_by_user_id?: string | null
          regras_utilizacao?: string | null
          site?: string | null
          stripe_customer_id?: string | null
          telefone?: string | null
          tem_conta_acesso?: boolean | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estabelecimentos_referred_by_user_id_fkey"
            columns: ["referred_by_user_id"]
            isOneToOne: false
            referencedRelation: "affiliate_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "estabelecimentos_referred_by_user_id_fkey"
            columns: ["referred_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favoritos: {
        Row: {
          created_at: string
          estabelecimento_id: string
          id: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          estabelecimento_id: string
          id?: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          estabelecimento_id?: string
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_estabelecimento_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          email: string
          id: string
          nome: string | null
          stripe_account_id: string | null
          stripe_onboarding_completed: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          email: string
          id: string
          nome?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_completed?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          id?: string
          nome?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_completed?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          commission_amount: number | null
          created_at: string | null
          establishment_id: string
          hold_release_date: string | null
          id: string
          referrer_id: string
          status: string | null
          stripe_transfer_id: string | null
          updated_at: string | null
        }
        Insert: {
          commission_amount?: number | null
          created_at?: string | null
          establishment_id: string
          hold_release_date?: string | null
          id?: string
          referrer_id: string
          status?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          commission_amount?: number | null
          created_at?: string | null
          establishment_id?: string
          hold_release_date?: string | null
          id?: string
          referrer_id?: string
          status?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "affiliate_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      affiliate_stats: {
        Row: {
          active_establishments: number | null
          email: string | null
          pending_commission: number | null
          stripe_account_id: string | null
          total_earned: number | null
          total_establishments: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      emit_coupon: {
        Args: { p_aniversariante_id: string; p_estabelecimento_id: string }
        Returns: {
          codigo: string
          cupom_id: string
          data_emissao: string
          data_validade: string
          error_message: string
        }[]
      }
      emit_coupon_secure: {
        Args: { p_aniversariante_id: string; p_estabelecimento_id: string }
        Returns: {
          codigo: string
          cupom_id: string
          data_emissao: string
          data_validade: string
          error_message: string
        }[]
      }
      generate_unique_coupon_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      use_coupon: {
        Args: { p_codigo: string; p_estabelecimento_id: string }
        Returns: {
          cupom_data: Json
          message: string
          success: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "colaborador" | "aniversariante" | "estabelecimento"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "colaborador", "aniversariante", "estabelecimento"],
    },
  },
} as const
