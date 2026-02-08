import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

export const createClient = async () => {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // Handle when called from Server Component
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // Handle when called from Server Component
                    }
                },
            },
        }
    )
}

// Cached function to get current user - avoids multiple auth calls
export const getCurrentUser = cache(async () => {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return null
    }

    return user
})

// Get user ID or throw error
export const requireUserId = async () => {
    const user = await getCurrentUser()
    if (!user) {
        throw new Error('Not authenticated')
    }
    return user.id
}
