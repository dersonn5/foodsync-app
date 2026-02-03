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

    // 1. Obtém o usuário (sem travar a request)
    const { data: { user } } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // === ZONA DE PROTEÇÃO DE ROTAS (A LÓGICA CRÍTICA) ===

    // REGRA 1: Se for a página de Login do Admin (/admin/login)
    if (path === '/admin/login') {
        // Se já estiver logado, manda pro painel. Se não, DEIXA ENTRAR.
        if (user) {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
        return response // <--- OBRIGATÓRIO: Deixa carregar a página de login!
    }

    // REGRA 2: Se for qualquer outra página dentro de /admin (Dashboard, etc)
    if (path.startsWith('/admin')) {
        // Se NÃO tiver usuário, chuta para o login do admin
        if (!user) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    // REGRA 3: Se for a página do CEO (/ceo)
    if (path.startsWith('/ceo')) {
        // Se NÃO tiver usuário, chuta para o login do admin
        if (!user) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    // REGRA 4: O resto do site (/) é público ou tratado pelo Client Component.
    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
