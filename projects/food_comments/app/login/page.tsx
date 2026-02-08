import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signInWithGoogle } from '../auth/actions'

export default async function Login({
    searchParams,
}: {
    searchParams: { message: string }
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user) {
        return redirect('/dashboard')
    }

    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
            <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
                <label className="text-md" htmlFor="email">
                    Googleアカウントでログイン
                </label>
                <button
                    className="bg-red-700 hover:bg-red-800 text-white rounded-md px-4 py-2 text-foreground mb-2 flex items-center justify-center gap-2 transition-colors"
                    formAction={signInWithGoogle}
                >
                    <svg className="h-4 w-4" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                    Googleでログイン
                </button>
                {searchParams?.message && (
                    <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
                        {searchParams.message}
                    </p>
                )}
            </form>
        </div>
    )
}
