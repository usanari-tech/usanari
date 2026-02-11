import { createClient } from '@/lib/supabase/server'
import { LogOut } from 'lucide-react'
import PostModal from './post-modal'
import { signOut } from '../auth/actions'
import { redirect } from 'next/navigation'

export default async function DashboardHeader() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // ヘッダー内でのリダイレクトは避けたほうがいいが、未ログインなら表示しようがない
    if (!user) return redirect('/login')

    const avatarUrl = user.user_metadata?.avatar_url

    return (
        <header className="sticky top-0 z-50 glass border-b border-gray-200/50">
            <nav className="max-w-lg mx-auto flex justify-between items-center px-4 py-2">
                <div className="flex items-center gap-2">
                    <img src="/icon.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-sm" />
                    <h1 className="font-bold text-base text-gray-900 tracking-tight">辛口献立簿</h1>
                </div>
                <div className="flex items-center gap-3">
                    <PostModal />
                    <div className="w-px h-6 bg-gray-200" />
                    <div className="flex items-center gap-2">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="User"
                                className="w-8 h-8 rounded-full border border-gray-100 shadow-sm object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600 shadow-inner">
                                {user.email?.[0].toUpperCase()}
                            </div>
                        )}
                        <form action={signOut}>
                            <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="ログアウト">
                                <LogOut size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </nav>
        </header>
    )
}
