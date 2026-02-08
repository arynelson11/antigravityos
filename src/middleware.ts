import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes - redirect to login if not authenticated
    const isProtectedRoute = request.nextUrl.pathname === '/' ||
        request.nextUrl.pathname.startsWith('/cards') ||
        request.nextUrl.pathname.startsWith('/tasks') ||
        request.nextUrl.pathname.startsWith('/calendar') ||
        request.nextUrl.pathname.startsWith('/settings') ||
        request.nextUrl.pathname.startsWith('/transactions')

    if (isProtectedRoute && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect authenticated users away from login
    if (request.nextUrl.pathname === '/login' && user) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}

export const config = {
    matcher: [
        '/',
        '/login',
        '/cards/:path*',
        '/tasks/:path*',
        '/calendar/:path*',
        '/settings/:path*',
        '/transactions/:path*',
    ],
}
