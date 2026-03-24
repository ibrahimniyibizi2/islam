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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      approvals: {
        Row: {
          approval_type: Database["public"]["Enums"]["approval_type"]
          created_at: string
          id: string
          name: string
          notes: string | null
          priority: Database["public"]["Enums"]["approval_priority"]
          related_entity_id: string | null
          requestor_id: string | null
          requestor_name: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["approval_status"]
        }
        Insert: {
          approval_type: Database["public"]["Enums"]["approval_type"]
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["approval_priority"]
          related_entity_id?: string | null
          requestor_id?: string | null
          requestor_name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Update: {
          approval_type?: Database["public"]["Enums"]["approval_type"]
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["approval_priority"]
          related_entity_id?: string | null
          requestor_id?: string | null
          requestor_name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Relationships: [
          {
            foreignKeyName: "approvals_requestor_id_fkey"
            columns: ["requestor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          id: string
          issue_date: string
          user_id: string
        }
        Insert: {
          id?: string
          issue_date?: string
          user_id: string
        }
        Update: {
          id?: string
          issue_date?: string
          user_id?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          donation_type: string | null
          donor_name: string | null
          id: string
          is_anonymous: boolean | null
          mosque_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          donation_type?: string | null
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean | null
          mosque_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          donation_type?: string | null
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean | null
          mosque_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "masjid_admin_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "my_masjid"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          actual_attendees: number | null
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string | null
          event_date: string
          event_time: string | null
          event_type: string
          expected_attendees: number | null
          id: string
          location: string | null
          mosque_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_attendees?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          event_time?: string | null
          event_type?: string
          expected_attendees?: number | null
          id?: string
          location?: string | null
          mosque_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_attendees?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          expected_attendees?: number | null
          id?: string
          location?: string | null
          mosque_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "masjid_admin_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "my_masjid"
            referencedColumns: ["id"]
          },
        ]
      }
      hajj_umrah_applications: {
        Row: {
          additional_notes: string | null
          covid_vaccination_status: string | null
          created_at: string | null
          email: string
          emergency_contact_name: string
          emergency_contact_phone: string
          family_count: number | null
          family_members_detail: string | null
          full_name: string
          id: string
          last_visit_year: string | null
          meningitis_vaccinated: boolean | null
          nationality: string
          package_preference: string
          package_price: string | null
          passport_number: string
          performed_before: boolean | null
          phone: string
          preferred_date: string
          service_type: string
          status: string
          updated_at: string | null
          user_id: string | null
          yellow_fever_vaccinated: boolean | null
        }
        Insert: {
          additional_notes?: string | null
          covid_vaccination_status?: string | null
          created_at?: string | null
          email: string
          emergency_contact_name: string
          emergency_contact_phone: string
          family_count?: number | null
          family_members_detail?: string | null
          full_name: string
          id?: string
          last_visit_year?: string | null
          meningitis_vaccinated?: boolean | null
          nationality: string
          package_preference: string
          package_price?: string | null
          passport_number: string
          performed_before?: boolean | null
          phone: string
          preferred_date: string
          service_type: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
          yellow_fever_vaccinated?: boolean | null
        }
        Update: {
          additional_notes?: string | null
          covid_vaccination_status?: string | null
          created_at?: string | null
          email?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          family_count?: number | null
          family_members_detail?: string | null
          full_name?: string
          id?: string
          last_visit_year?: string | null
          meningitis_vaccinated?: boolean | null
          nationality?: string
          package_preference?: string
          package_price?: string | null
          passport_number?: string
          performed_before?: boolean | null
          phone?: string
          preferred_date?: string
          service_type?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
          yellow_fever_vaccinated?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "hajj_umrah_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      imam_earnings: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          imam_id: string
          nikah_application_id: string | null
          paid_at: string | null
          service_type: string
          status: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          imam_id: string
          nikah_application_id?: string | null
          paid_at?: string | null
          service_type?: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          imam_id?: string
          nikah_application_id?: string | null
          paid_at?: string | null
          service_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "imam_earnings_imam_id_fkey"
            columns: ["imam_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imam_earnings_nikah_application_id_fkey"
            columns: ["nikah_application_id"]
            isOneToOne: false
            referencedRelation: "nikah_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imam_earnings_nikah_application_id_fkey"
            columns: ["nikah_application_id"]
            isOneToOne: false
            referencedRelation: "nikah_payment_status"
            referencedColumns: ["id"]
          },
        ]
      }
      imam_schedule: {
        Row: {
          created_at: string
          description: string | null
          end_time: string | null
          event_date: string
          event_time: string
          event_type: string
          id: string
          imam_id: string
          location: string | null
          mosque_id: string | null
          nikah_application_id: string | null
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date: string
          event_time: string
          event_type: string
          id?: string
          imam_id: string
          location?: string | null
          mosque_id?: string | null
          nikah_application_id?: string | null
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_time?: string
          event_type?: string
          id?: string
          imam_id?: string
          location?: string | null
          mosque_id?: string | null
          nikah_application_id?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "imam_schedule_imam_id_fkey"
            columns: ["imam_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imam_schedule_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "masjid_admin_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imam_schedule_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imam_schedule_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "my_masjid"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imam_schedule_nikah_application_id_fkey"
            columns: ["nikah_application_id"]
            isOneToOne: false
            referencedRelation: "nikah_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imam_schedule_nikah_application_id_fkey"
            columns: ["nikah_application_id"]
            isOneToOne: false
            referencedRelation: "nikah_payment_status"
            referencedColumns: ["id"]
          },
        ]
      }
      imams: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          mosque_id: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id: string
          is_active?: boolean | null
          mosque_id?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          mosque_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "imams_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "masjids"
            referencedColumns: ["id"]
          },
        ]
      }
      khutbas: {
        Row: {
          content: string | null
          created_at: string
          file_url: string | null
          id: string
          imam_id: string
          khutba_date: string
          mosque_id: string | null
          title: string
          views: number
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          imam_id: string
          khutba_date?: string
          mosque_id?: string | null
          title: string
          views?: number
        }
        Update: {
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          imam_id?: string
          khutba_date?: string
          mosque_id?: string | null
          title?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "khutbas_imam_id_fkey"
            columns: ["imam_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khutbas_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "masjid_admin_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khutbas_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khutbas_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "my_masjid"
            referencedColumns: ["id"]
          },
        ]
      }
      masjids: {
        Row: {
          city: string
          created_at: string | null
          district: string
          id: string
          name: string
        }
        Insert: {
          city: string
          created_at?: string | null
          district: string
          id: string
          name: string
        }
        Update: {
          city?: string
          created_at?: string | null
          district?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      mosque_imams: {
        Row: {
          id: string
          imam_id: string
          is_verified: boolean
          joined_at: string
          mosque_id: string
          nikah_count: number
          role: string
        }
        Insert: {
          id?: string
          imam_id: string
          is_verified?: boolean
          joined_at?: string
          mosque_id: string
          nikah_count?: number
          role?: string
        }
        Update: {
          id?: string
          imam_id?: string
          is_verified?: boolean
          joined_at?: string
          mosque_id?: string
          nikah_count?: number
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "mosque_imams_imam_id_fkey"
            columns: ["imam_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mosque_imams_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "masjid_admin_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mosque_imams_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mosque_imams_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "my_masjid"
            referencedColumns: ["id"]
          },
        ]
      }
      mosques: {
        Row: {
          address: string | null
          admin_id: string | null
          asr_time: string | null
          created_at: string
          description: string | null
          dhuhr_time: string | null
          district: string | null
          email: string | null
          fajr_time: string | null
          id: string
          image_url: string | null
          isha_time: string | null
          maghrib_time: string | null
          name: string
          phone: string | null
          province: string | null
          registration_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          admin_id?: string | null
          asr_time?: string | null
          created_at?: string
          description?: string | null
          dhuhr_time?: string | null
          district?: string | null
          email?: string | null
          fajr_time?: string | null
          id?: string
          image_url?: string | null
          isha_time?: string | null
          maghrib_time?: string | null
          name: string
          phone?: string | null
          province?: string | null
          registration_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          admin_id?: string | null
          asr_time?: string | null
          created_at?: string
          description?: string | null
          dhuhr_time?: string | null
          district?: string | null
          email?: string | null
          fajr_time?: string | null
          id?: string
          image_url?: string | null
          isha_time?: string | null
          maghrib_time?: string | null
          name?: string
          phone?: string | null
          province?: string | null
          registration_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mosques_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nikah_applications: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          base_price: number | null
          biometric_verified_at: string | null
          biometric_verified_by: string | null
          bride_address: string | null
          bride_biometric_photo_url: string | null
          bride_biometric_verified: boolean | null
          bride_consent_letter_url: string | null
          bride_email: string | null
          bride_father_name: string | null
          bride_hida_certificate_url: string | null
          bride_id_document_url: string | null
          bride_marital_status: string | null
          bride_mother_name: string | null
          bride_name: string
          bride_national_id: string | null
          bride_phone: string | null
          bride_photo_url: string | null
          bride_plaginent_certificate_url: string | null
          bride_signature_url: string | null
          certificate_issued_at: string | null
          certificate_number: string | null
          certificate_url: string | null
          confirmed_date: string | null
          confirmed_location: string | null
          confirmed_time: string | null
          created_at: string
          custom_venue_address: string | null
          death_certificate_url: string | null
          deposit_amount: number | null
          deposit_status: string | null
          divorce_decree_url: string | null
          due_date: string | null
          female_witness1_name: string | null
          female_witness1_phone: string | null
          female_witness2_name: string | null
          female_witness2_phone: string | null
          groom_address: string | null
          groom_biometric_photo_url: string | null
          groom_biometric_verified: boolean | null
          groom_email: string | null
          groom_father_name: string | null
          groom_hida_certificate_url: string | null
          groom_id_document_url: string | null
          groom_marital_status: string | null
          groom_mother_name: string | null
          groom_name: string | null
          groom_national_id: string | null
          groom_phone: string | null
          groom_photo_url: string | null
          groom_signature_url: string | null
          id: string
          imam_id: string | null
          imam_response: string | null
          imam_response_at: string | null
          imam_signature_url: string | null
          is_late_payment: boolean | null
          late_fee: number | null
          mahr_amount: number | null
          mahr_description: string | null
          male_witness_name: string | null
          male_witness_phone: string | null
          masjid_response: string | null
          masjid_response_at: string | null
          mosque_id: string | null
          payment_confirmed_at: string | null
          payment_date: string | null
          payment_method: string | null
          payment_provider: string | null
          payment_provider_reference: string | null
          payment_reference: string | null
          payment_status: string | null
          preferred_date: string | null
          preferred_imam: string | null
          preferred_masjid: string | null
          preferred_time: string | null
          qadhi_id: string | null
          qadhi_status: string | null
          reference_number: string | null
          sent_to_imam_masjid_at: string | null
          service_price: number | null
          service_tier: string | null
          special_requests: string | null
          status: string
          total_amount: number | null
          updated_at: string
          user_id: string
          validated_at: string | null
          validation_notes: string | null
          venue_type: string | null
          wali_id_document_url: string | null
          wali_name: string | null
          wali_national_id: string | null
          wali_phone: string | null
          wali_relation: string | null
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number | null
          base_price?: number | null
          biometric_verified_at?: string | null
          biometric_verified_by?: string | null
          bride_address?: string | null
          bride_biometric_photo_url?: string | null
          bride_biometric_verified?: boolean | null
          bride_consent_letter_url?: string | null
          bride_email?: string | null
          bride_father_name?: string | null
          bride_hida_certificate_url?: string | null
          bride_id_document_url?: string | null
          bride_marital_status?: string | null
          bride_mother_name?: string | null
          bride_name: string
          bride_national_id?: string | null
          bride_phone?: string | null
          bride_photo_url?: string | null
          bride_plaginent_certificate_url?: string | null
          bride_signature_url?: string | null
          certificate_issued_at?: string | null
          certificate_number?: string | null
          certificate_url?: string | null
          confirmed_date?: string | null
          confirmed_location?: string | null
          confirmed_time?: string | null
          created_at?: string
          custom_venue_address?: string | null
          death_certificate_url?: string | null
          deposit_amount?: number | null
          deposit_status?: string | null
          divorce_decree_url?: string | null
          due_date?: string | null
          female_witness1_name?: string | null
          female_witness1_phone?: string | null
          female_witness2_name?: string | null
          female_witness2_phone?: string | null
          groom_address?: string | null
          groom_biometric_photo_url?: string | null
          groom_biometric_verified?: boolean | null
          groom_email?: string | null
          groom_father_name?: string | null
          groom_hida_certificate_url?: string | null
          groom_id_document_url?: string | null
          groom_marital_status?: string | null
          groom_mother_name?: string | null
          groom_name?: string | null
          groom_national_id?: string | null
          groom_phone?: string | null
          groom_photo_url?: string | null
          groom_signature_url?: string | null
          id?: string
          imam_id?: string | null
          imam_response?: string | null
          imam_response_at?: string | null
          imam_signature_url?: string | null
          is_late_payment?: boolean | null
          late_fee?: number | null
          mahr_amount?: number | null
          mahr_description?: string | null
          male_witness_name?: string | null
          male_witness_phone?: string | null
          masjid_response?: string | null
          masjid_response_at?: string | null
          mosque_id?: string | null
          payment_confirmed_at?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_provider_reference?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          preferred_date?: string | null
          preferred_imam?: string | null
          preferred_masjid?: string | null
          preferred_time?: string | null
          qadhi_id?: string | null
          qadhi_status?: string | null
          reference_number?: string | null
          sent_to_imam_masjid_at?: string | null
          service_price?: number | null
          service_tier?: string | null
          special_requests?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id: string
          validated_at?: string | null
          validation_notes?: string | null
          venue_type?: string | null
          wali_id_document_url?: string | null
          wali_name?: string | null
          wali_national_id?: string | null
          wali_phone?: string | null
          wali_relation?: string | null
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number | null
          base_price?: number | null
          biometric_verified_at?: string | null
          biometric_verified_by?: string | null
          bride_address?: string | null
          bride_biometric_photo_url?: string | null
          bride_biometric_verified?: boolean | null
          bride_consent_letter_url?: string | null
          bride_email?: string | null
          bride_father_name?: string | null
          bride_hida_certificate_url?: string | null
          bride_id_document_url?: string | null
          bride_marital_status?: string | null
          bride_mother_name?: string | null
          bride_name?: string
          bride_national_id?: string | null
          bride_phone?: string | null
          bride_photo_url?: string | null
          bride_plaginent_certificate_url?: string | null
          bride_signature_url?: string | null
          certificate_issued_at?: string | null
          certificate_number?: string | null
          certificate_url?: string | null
          confirmed_date?: string | null
          confirmed_location?: string | null
          confirmed_time?: string | null
          created_at?: string
          custom_venue_address?: string | null
          death_certificate_url?: string | null
          deposit_amount?: number | null
          deposit_status?: string | null
          divorce_decree_url?: string | null
          due_date?: string | null
          female_witness1_name?: string | null
          female_witness1_phone?: string | null
          female_witness2_name?: string | null
          female_witness2_phone?: string | null
          groom_address?: string | null
          groom_biometric_photo_url?: string | null
          groom_biometric_verified?: boolean | null
          groom_email?: string | null
          groom_father_name?: string | null
          groom_hida_certificate_url?: string | null
          groom_id_document_url?: string | null
          groom_marital_status?: string | null
          groom_mother_name?: string | null
          groom_name?: string | null
          groom_national_id?: string | null
          groom_phone?: string | null
          groom_photo_url?: string | null
          groom_signature_url?: string | null
          id?: string
          imam_id?: string | null
          imam_response?: string | null
          imam_response_at?: string | null
          imam_signature_url?: string | null
          is_late_payment?: boolean | null
          late_fee?: number | null
          mahr_amount?: number | null
          mahr_description?: string | null
          male_witness_name?: string | null
          male_witness_phone?: string | null
          masjid_response?: string | null
          masjid_response_at?: string | null
          mosque_id?: string | null
          payment_confirmed_at?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_provider_reference?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          preferred_date?: string | null
          preferred_imam?: string | null
          preferred_masjid?: string | null
          preferred_time?: string | null
          qadhi_id?: string | null
          qadhi_status?: string | null
          reference_number?: string | null
          sent_to_imam_masjid_at?: string | null
          service_price?: number | null
          service_tier?: string | null
          special_requests?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string
          validated_at?: string | null
          validation_notes?: string | null
          venue_type?: string | null
          wali_id_document_url?: string | null
          wali_name?: string | null
          wali_national_id?: string | null
          wali_phone?: string | null
          wali_relation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nikah_applications_biometric_verified_by_fkey"
            columns: ["biometric_verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nikah_applications_imam_id_fkey"
            columns: ["imam_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nikah_applications_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "masjid_admin_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nikah_applications_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nikah_applications_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "my_masjid"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nikah_applications_qadhi_id_fkey"
            columns: ["qadhi_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nikah_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          nikah_application_id: string
          notification_type: string
          recipient_id: string | null
          recipient_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          nikah_application_id: string
          notification_type: string
          recipient_id?: string | null
          recipient_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          nikah_application_id?: string
          notification_type?: string
          recipient_id?: string | null
          recipient_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "nikah_notifications_nikah_application_id_fkey"
            columns: ["nikah_application_id"]
            isOneToOne: false
            referencedRelation: "nikah_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nikah_notifications_nikah_application_id_fkey"
            columns: ["nikah_application_id"]
            isOneToOne: false
            referencedRelation: "nikah_payment_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nikah_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          is_masjid_admin: boolean | null
          last_password_change: string | null
          masjid_id: string | null
          phone: string | null
          role: string | null
          temp_password: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          is_masjid_admin?: boolean | null
          last_password_change?: string | null
          masjid_id?: string | null
          phone?: string | null
          role?: string | null
          temp_password?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_masjid_admin?: boolean | null
          last_password_change?: string | null
          masjid_id?: string | null
          phone?: string | null
          role?: string | null
          temp_password?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_masjid_id_fkey"
            columns: ["masjid_id"]
            isOneToOne: false
            referencedRelation: "masjid_admin_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_masjid_id_fkey"
            columns: ["masjid_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_masjid_id_fkey"
            columns: ["masjid_id"]
            isOneToOne: false
            referencedRelation: "my_masjid"
            referencedColumns: ["id"]
          },
        ]
      }
      qadhi_cases: {
        Row: {
          case_number: string
          case_type: Database["public"]["Enums"]["case_type"]
          created_at: string
          description: string | null
          filed_date: string
          id: string
          parties: string
          priority: Database["public"]["Enums"]["case_priority"]
          qadhi_id: string | null
          resolved_date: string | null
          status: Database["public"]["Enums"]["case_status"]
          updated_at: string
        }
        Insert: {
          case_number: string
          case_type: Database["public"]["Enums"]["case_type"]
          created_at?: string
          description?: string | null
          filed_date?: string
          id?: string
          parties: string
          priority?: Database["public"]["Enums"]["case_priority"]
          qadhi_id?: string | null
          resolved_date?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
        }
        Update: {
          case_number?: string
          case_type?: Database["public"]["Enums"]["case_type"]
          created_at?: string
          description?: string | null
          filed_date?: string
          id?: string
          parties?: string
          priority?: Database["public"]["Enums"]["case_priority"]
          qadhi_id?: string | null
          resolved_date?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qadhi_cases_qadhi_id_fkey"
            columns: ["qadhi_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      qadhi_rulings: {
        Row: {
          case_id: string | null
          created_at: string
          full_ruling: string | null
          id: string
          issued_date: string
          nikah_application_id: string | null
          parties: string
          qadhi_id: string
          ruling_number: string
          ruling_type: Database["public"]["Enums"]["ruling_type"]
          summary: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          full_ruling?: string | null
          id?: string
          issued_date?: string
          nikah_application_id?: string | null
          parties: string
          qadhi_id: string
          ruling_number: string
          ruling_type: Database["public"]["Enums"]["ruling_type"]
          summary: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          full_ruling?: string | null
          id?: string
          issued_date?: string
          nikah_application_id?: string | null
          parties?: string
          qadhi_id?: string
          ruling_number?: string
          ruling_type?: Database["public"]["Enums"]["ruling_type"]
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "qadhi_rulings_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "qadhi_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qadhi_rulings_nikah_application_id_fkey"
            columns: ["nikah_application_id"]
            isOneToOne: false
            referencedRelation: "nikah_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qadhi_rulings_nikah_application_id_fkey"
            columns: ["nikah_application_id"]
            isOneToOne: false
            referencedRelation: "nikah_payment_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qadhi_rulings_qadhi_id_fkey"
            columns: ["qadhi_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shahada_applications: {
        Row: {
          address: string | null
          created_at: string | null
          date_of_birth: string | null
          declaration_text: string
          email: string | null
          full_name: string
          id: string
          national_id: string | null
          phone: string | null
          preferred_date: string | null
          previous_religion: string | null
          special_requests: string | null
          status: string
          updated_at: string | null
          user_id: string | null
          witness1_id: string | null
          witness1_name: string
          witness1_phone: string | null
          witness2_id: string | null
          witness2_name: string
          witness2_phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          declaration_text?: string
          email?: string | null
          full_name: string
          id?: string
          national_id?: string | null
          phone?: string | null
          preferred_date?: string | null
          previous_religion?: string | null
          special_requests?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          witness1_id?: string | null
          witness1_name: string
          witness1_phone?: string | null
          witness2_id?: string | null
          witness2_name: string
          witness2_phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          declaration_text?: string
          email?: string | null
          full_name?: string
          id?: string
          national_id?: string | null
          phone?: string | null
          preferred_date?: string | null
          previous_religion?: string | null
          special_requests?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          witness1_id?: string | null
          witness1_name?: string
          witness1_phone?: string | null
          witness2_id?: string | null
          witness2_name?: string
          witness2_phone?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          from_name: string | null
          from_user_id: string | null
          id: string
          status: string
          to_entity: string | null
          to_mosque_id: string | null
          transaction_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_name?: string | null
          from_user_id?: string | null
          id?: string
          status?: string
          to_entity?: string | null
          to_mosque_id?: string | null
          transaction_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_name?: string | null
          from_user_id?: string | null
          id?: string
          status?: string
          to_entity?: string | null
          to_mosque_id?: string | null
          transaction_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_mosque_id_fkey"
            columns: ["to_mosque_id"]
            isOneToOne: false
            referencedRelation: "masjid_admin_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_mosque_id_fkey"
            columns: ["to_mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_mosque_id_fkey"
            columns: ["to_mosque_id"]
            isOneToOne: false
            referencedRelation: "my_masjid"
            referencedColumns: ["id"]
          },
        ]
      }
      user_services: {
        Row: {
          created_at: string
          id: string
          service_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          service_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          service_type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      masjid_admin_view: {
        Row: {
          address: string | null
          admin_email: string | null
          admin_name: string | null
          admin_phone: string | null
          created_at: string | null
          district: string | null
          id: string | null
          name: string | null
          phone: string | null
          registration_id: string | null
          status: string | null
        }
        Relationships: []
      }
      my_masjid: {
        Row: {
          address: string | null
          admin_email: string | null
          admin_id: string | null
          admin_name: string | null
          admin_phone: string | null
          asr_time: string | null
          created_at: string | null
          description: string | null
          dhuhr_time: string | null
          district: string | null
          email: string | null
          fajr_time: string | null
          id: string | null
          image_url: string | null
          isha_time: string | null
          maghrib_time: string | null
          name: string | null
          phone: string | null
          province: string | null
          registration_id: string | null
          status: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mosques_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nikah_payment_status: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          base_price: number | null
          due_date: string | null
          id: string | null
          is_late_payment: boolean | null
          late_fee: number | null
          payment_date: string | null
          payment_method: string | null
          payment_provider: string | null
          payment_reference: string | null
          payment_status: string | null
          payment_status_description: string | null
          payment_status_display: string | null
          reference_number: string | null
          user_id: string | null
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number | null
          base_price?: number | null
          due_date?: string | null
          id?: string | null
          is_late_payment?: boolean | null
          late_fee?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          payment_status_description?: never
          payment_status_display?: never
          reference_number?: string | null
          user_id?: string | null
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number | null
          base_price?: number | null
          due_date?: string | null
          id?: string | null
          is_late_payment?: boolean | null
          late_fee?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          payment_status_description?: never
          payment_status_display?: never
          reference_number?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      auto_accept_nikah_responses: { Args: never; Returns: undefined }
      calculate_amount_due: {
        Args: { p_application_id: string }
        Returns: number
      }
      create_masjid_with_admin: {
        Args: {
          address: string
          admin_email: string
          admin_full_name: string
          admin_phone: string
          district: string
          masjid_name: string
          phone: string
          registration_id: string
        }
        Returns: Json
      }
      generate_payment_reference: { Args: never; Returns: string }
      get_masjid_admin_details: { Args: { masjid_id: string }; Returns: Json }
      get_payment_instructions: {
        Args: { p_application_id: string }
        Returns: Json
      }
      is_owner: {
        Args: { path_segment: string; user_id: string }
        Returns: boolean
      }
      list_masjid_admins: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          last_sign_in: string
          masjid_id: string
          masjid_name: string
          needs_password_reset: boolean
          phone: string
        }[]
      }
      record_payment: {
        Args: {
          p_amount_paid: number
          p_application_id: string
          p_payment_method: string
          p_payment_provider: string
          p_provider_reference: string
        }
        Returns: Json
      }
      reset_masjid_admin_password: {
        Args: { admin_email: string }
        Returns: Json
      }
      user_has_role: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      application_status: "pending" | "approved" | "rejected" | "in_review"
      approval_priority: "low" | "medium" | "high"
      approval_status: "pending" | "approved" | "rejected"
      approval_type:
        | "mosque_registration"
        | "imam_verification"
        | "ong_registration"
        | "masjid_admin"
        | "service_provider"
      case_priority: "low" | "medium" | "high"
      case_status: "pending" | "under_review" | "resolved" | "dismissed"
      case_type:
        | "dispute_resolution"
        | "sharia_compliance"
        | "document_verification"
        | "inheritance"
      ruling_type:
        | "dispute_resolution"
        | "nikah_validation"
        | "sharia_compliance"
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
      application_status: ["pending", "approved", "rejected", "in_review"],
      approval_priority: ["low", "medium", "high"],
      approval_status: ["pending", "approved", "rejected"],
      approval_type: [
        "mosque_registration",
        "imam_verification",
        "ong_registration",
        "masjid_admin",
        "service_provider",
      ],
      case_priority: ["low", "medium", "high"],
      case_status: ["pending", "under_review", "resolved", "dismissed"],
      case_type: [
        "dispute_resolution",
        "sharia_compliance",
        "document_verification",
        "inheritance",
      ],
      ruling_type: [
        "dispute_resolution",
        "nikah_validation",
        "sharia_compliance",
      ],
    },
  },
} as const
