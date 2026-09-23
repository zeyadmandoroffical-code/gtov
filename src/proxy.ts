import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const LOCALES = ['ar', 'en']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const first = pathname.split('/')[1] || ''

  // Public site: every path lives under /ar or /en.
  if (first !== 'admin') {
    if (LOCALES.includes(first)) return NextResponse.next()
    const prefersEn = /^en\b/i.test(request.headers.get('accept-language') || '')
    const url = request.nextUrl.clone()
    url.pathname = `/${prefersEn ? 'en' : 'ar'}${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(url)
  }

  // Admin: refresh the Supabase session cookie and require a logged-in user.
  let response = NextResponse.next({ request })
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!sbUrl || !sbKey) return response

  const supabase = createServerClient(sbUrl, sbKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list, headers) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers || {}).forEach(([k, v]) => response.headers.set(k, v))
      },
    },
  })
  const { data } = await supabase.auth.getUser()
  const isLogin = pathname.startsWith('/admin/login')
  if (!data.user && !isLogin) return NextResponse.redirect(new URL('/admin/login', request.url))
  if (data.user && isLogin) return NextResponse.redirect(new URL('/admin', request.url))
  return response
}

export const config = {
  // everything except Next internals, API routes and files with an extension
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
