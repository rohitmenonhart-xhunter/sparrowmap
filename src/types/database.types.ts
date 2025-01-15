export interface Database {
  public: {
    Tables: {
      sparrows: {
        Row: {
          id: string
          latitude: number
          longitude: number
          count: number
          gender: string
          nest: boolean
          juveniles: boolean
          image_url: string
          created_at: string
          user_email: string
          status: 'pending' | 'approved'
        }
        Insert: {
          id?: string
          latitude: number
          longitude: number
          count: number
          gender: string
          nest: boolean
          juveniles: boolean
          image_url?: string
          created_at?: string
          user_email: string
          status?: 'pending' | 'approved'
        }
        Update: {
          id?: string
          latitude?: number
          longitude?: number
          count?: number
          gender?: string
          nest?: boolean
          juveniles?: boolean
          image_url?: string
          created_at?: string
          user_email?: string
          status?: 'pending' | 'approved'
        }
      }
    }
  }
} 