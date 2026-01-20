import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value, options))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // SCENARIO A: /admin/login Route
    if (path === '/admin/login') {
        if (user) {
            // User is logged in. Check if they are an admin.
            const { data: adminData } = await supabase
                .from('admins')
                .select('id')
                .eq('id', user.id)
                .single()

            // If they are an admin, they shouldn't be on the login page -> Redirect to Dashboard
            if (adminData) {
                return NextResponse.redirect(new URL('/admin', request.url))
            }
            // If verified user but NOT admin? Maybe let them see login to switch accounts, 
            // or show "Unauthorized". For now, redirecting to home or showing login is fine.
            // Let's let them stay on login to sign out if they want.
        }
        // If NO user, ALLOW access to login page
        return response
    }

    // SCENARIO B: Protected /admin Routes (excluding login)
    if (path.startsWith('/admin')) {
        // 1. Check if user exists
        if (!user) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }

        // 2. Check if user is actually an admin
        const { data: adminData } = await supabase
            .from('admins')
            .select('id')
            .eq('id', user.id)
            .single()

        if (!adminData) {
            // User is logged in but is NOT an admin.
            // Redirect to login page (where they can logout or see error)
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }

        // If user is admin, allow access
        return response
    }

    // SCENARIO C: Public Routes (/)
    // Allow everything else
    return response
}
