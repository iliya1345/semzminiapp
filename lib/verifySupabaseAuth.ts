// lib/verifySupabaseAuth.ts
import {createSupabaseAdmin} from '../app/api/supaBaseAdmin'
import { NextApiRequest } from 'next'

export async function getUserFromRequest(token:any) {
    const supabase = createSupabaseAdmin();

    if (!token) return null
  
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null
  
    return user
  }