import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const PROTECTED = ['/favourites', '/shopping-list', '/meal-planner']

export default auth((req) => {
  const isProtected = PROTECTED.some((p) => req.nextUrl.pathname.startsWith(p))
  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
