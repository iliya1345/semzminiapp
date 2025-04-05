// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserFromRequest } from './lib/verifySupabaseAuth'

export async function middleware(req: NextRequest) {
  // Only run auth check on API routes
  if (req.nextUrl.pathname.startsWith('/api')) {
    if(req.nextUrl.pathname.startsWith('/api/login')){
      return NextResponse.next()
    }
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token || !getUserFromRequest(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  return NextResponse.next()
}

// Limit the middleware to API routes
export const config = {
  matcher: ['/api/:path*'],
}
