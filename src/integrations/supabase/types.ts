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
      agenda_events: {
        Row: {
          created_at: string
          description: string | null
          establishment_id: string
          event_date: string
          event_time: string | null
          id: string
          post_id: string
          reservation_link: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          establishment_id: string
          event_date: string
          event_time?: string | null
          id?: string
          post_id: string
          reservation_link?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          establishment_id?: string
          event_date?: string
          event_time?: string | null
          id?: string
          post_id?: string
          reservation_link?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_events_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_events_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "public_estabelecimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_events_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
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
          bairro: string
          cep: string
          cidade: string
          complemento: string | null
          cpf: string
          created_at: string | null
          data_nascimento: string
          deleted_at: string | null
          estado: string
          id: string
          latitude: number | null
          logradouro: string
          longitude: number | null
          numero: string | null
          telefone: string
          updated_at: string | null
        }
        Insert: {
          bairro: string
          cep: string
          cidade: string
          complemento?: string | null
          cpf: string
          created_at?: string | null
          data_nascimento: string
          deleted_at?: string | null
          estado: string
          id: string
          latitude?: number | null
          logradouro: string
          longitude?: number | null
          numero?: string | null
          telefone: string
          updated_at?: string | null
        }
        Update: {
          bairro?: string
          cep?: string
          cidade?: string
          complemento?: string | null
          cpf?: string
          created_at?: string | null
          data_nascimento?: string
          deleted_at?: string | null
          estado?: string
          id?: string
          latitude?: number | null
          logradouro?: string
          longitude?: number | null
          numero?: string | null
          telefone?: string
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
          {
            foreignKeyName: "cupom_rate_limit_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "public_estabelecimentos"
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
          {
            foreignKeyName: "estabelecimento_analytics_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "public_estabelecimentos"
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
          endereco_formatado: string | null
          estado: string | null
          galeria_fotos: string[] | null
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
          slug: string | null
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
          endereco_formatado?: string | null
          estado?: string | null
          galeria_fotos?: string[] | null
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
          slug?: string | null
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
          endereco_formatado?: string | null
          estado?: string | null
          galeria_fotos?: string[] | null
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
          slug?: string | null
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
          {
            foreignKeyName: "favoritos_estabelecimento_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "public_estabelecimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      flash_promos: {
        Row: {
          cidade: string
          claims_count: number | null
          created_at: string
          description: string
          estabelecimento_id: string
          estado: string
          expires_at: string
          id: string
          status: string
          title: string
          views_count: number | null
        }
        Insert: {
          cidade: string
          claims_count?: number | null
          created_at?: string
          description: string
          estabelecimento_id: string
          estado: string
          expires_at: string
          id?: string
          status?: string
          title: string
          views_count?: number | null
        }
        Update: {
          cidade?: string
          claims_count?: number | null
          created_at?: string
          description?: string
          estabelecimento_id?: string
          estado?: string
          expires_at?: string
          id?: string
          status?: string
          title?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flash_promos_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flash_promos_estabelecimento_id_fkey"
            columns: ["estabelecimento_id"]
            isOneToOne: false
            referencedRelation: "public_estabelecimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      followers: {
        Row: {
          created_at: string | null
          establishment_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          establishment_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          establishment_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "public_estabelecimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_logs: {
        Row: {
          app_name: string
          created_at: string
          establishment_id: string
          id: string
          user_id: string | null
        }
        Insert: {
          app_name: string
          created_at?: string
          establishment_id: string
          id?: string
          user_id?: string | null
        }
        Update: {
          app_name?: string
          created_at?: string
          establishment_id?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "navigation_logs_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_logs_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "public_estabelecimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      post_interactions: {
        Row: {
          comment_text: string | null
          created_at: string
          id: string
          post_id: string
          type: string
          user_id: string
        }
        Insert: {
          comment_text?: string | null
          created_at?: string
          id?: string
          post_id: string
          type: string
          user_id: string
        }
        Update: {
          comment_text?: string | null
          created_at?: string
          id?: string
          post_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_shares: {
        Row: {
          id: string
          platform: string | null
          post_id: string
          shared_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          platform?: string | null
          post_id: string
          shared_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          platform?: string | null
          post_id?: string
          shared_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_views: {
        Row: {
          id: string
          post_id: string
          session_id: string | null
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          post_id: string
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          caption: string | null
          created_at: string | null
          establishment_id: string
          id: string
          image_url: string
          shares_count: number | null
          type: Database["public"]["Enums"]["post_type"]
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          establishment_id: string
          id?: string
          image_url: string
          shares_count?: number | null
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          establishment_id?: string
          id?: string
          image_url?: string
          shares_count?: number | null
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "public_estabelecimentos"
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
      rate_limits: {
        Row: {
          count: number
          created_at: string
          id: string
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          key: string
          window_start?: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          key?: string
          window_start?: string
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
            foreignKeyName: "referrals_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "public_estabelecimentos"
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
      search_analytics: {
        Row: {
          id: string
          metadata: Json | null
          nearest_available_city: string | null
          nearest_distance_km: number | null
          results_found: number
          search_term: string
          searched_at: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          user_lat: number | null
          user_lng: number | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          nearest_available_city?: string | null
          nearest_distance_km?: number | null
          results_found?: number
          search_term: string
          searched_at?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_lat?: number | null
          user_lng?: number | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          nearest_available_city?: string | null
          nearest_distance_km?: number | null
          results_found?: number
          search_term?: string
          searched_at?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_lat?: number | null
          user_lng?: number | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          created_at: string | null
          establishment_id: string
          expires_at: string | null
          id: string
          media_url: string
        }
        Insert: {
          created_at?: string | null
          establishment_id: string
          expires_at?: string | null
          id?: string
          media_url: string
        }
        Update: {
          created_at?: string | null
          establishment_id?: string
          expires_at?: string | null
          id?: string
          media_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "estabelecimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "public_estabelecimentos"
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
          pending_commission: number | null
          total_earned: number | null
          total_establishments: number | null
          user_id: string | null
        }
        Relationships: []
      }
      expansion_insights: {
        Row: {
          avg_distance_to_nearest: number | null
          avg_latitude: number | null
          avg_longitude: number | null
          last_searched_at: string | null
          most_common_nearest_city: string | null
          search_term: string | null
          total_searches: number | null
          unique_users: number | null
          zero_results_count: number | null
        }
        Relationships: []
      }
      public_estabelecimentos: {
        Row: {
          ativo: boolean | null
          bairro: string | null
          categoria: string[] | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          created_at: string | null
          descricao_beneficio: string | null
          endereco: string | null
          estado: string | null
          galeria_fotos: string[] | null
          horario_funcionamento: string | null
          id: string | null
          instagram: string | null
          latitude: number | null
          link_cardapio: string | null
          logo_url: string | null
          logradouro: string | null
          longitude: number | null
          nome_fantasia: string | null
          numero: string | null
          periodo_validade_beneficio: string | null
          razao_social: string | null
          regras_utilizacao: string | null
          site: string | null
          slug: string | null
          telefone: string | null
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean | null
          bairro?: string | null
          categoria?: string[] | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          descricao_beneficio?: string | null
          endereco?: string | null
          estado?: string | null
          galeria_fotos?: string[] | null
          horario_funcionamento?: string | null
          id?: string | null
          instagram?: string | null
          latitude?: number | null
          link_cardapio?: string | null
          logo_url?: string | null
          logradouro?: string | null
          longitude?: number | null
          nome_fantasia?: string | null
          numero?: string | null
          periodo_validade_beneficio?: string | null
          razao_social?: string | null
          regras_utilizacao?: string | null
          site?: string | null
          slug?: string | null
          telefone?: string | null
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean | null
          bairro?: string | null
          categoria?: string[] | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          descricao_beneficio?: string | null
          endereco?: string | null
          estado?: string | null
          galeria_fotos?: string[] | null
          horario_funcionamento?: string | null
          id?: string | null
          instagram?: string | null
          latitude?: number | null
          link_cardapio?: string | null
          logo_url?: string | null
          logradouro?: string | null
          longitude?: number | null
          nome_fantasia?: string | null
          numero?: string | null
          periodo_validade_beneficio?: string | null
          razao_social?: string | null
          regras_utilizacao?: string | null
          site?: string | null
          slug?: string | null
          telefone?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_minutes: number }
        Returns: {
          allowed: boolean
          remaining: number
        }[]
      }
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
      generate_city_slug: { Args: { cidade: string }; Returns: string }
      generate_slug: { Args: { nome: string }; Returns: string }
      generate_unique_coupon_code: { Args: never; Returns: string }
      get_birthday_forecast: {
        Args: { p_cidade: string; p_estado: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      upsert_establishment_bulk: { Args: { p_data: Json }; Returns: Json }
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
      post_type: "photo" | "promo" | "agenda"
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
      post_type: ["photo", "promo", "agenda"],
    },
  },
} as const
