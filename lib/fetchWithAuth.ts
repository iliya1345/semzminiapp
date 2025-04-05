// lib/fetchWithAuth.ts
import { createSupabaseClient } from '@/utils/supaBase'

export const fetchWithAuth = async (
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> => {

  const supabase = createSupabaseClient();
    
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const token = session?.access_token

  if (!token) {
    console.log('No Supabase session found')

    throw new Error('No Supabase session found')
  }

  const authHeaders = {
    ...init.headers,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  return fetch(input, {
    ...init,
    headers: authHeaders,
  })
}
