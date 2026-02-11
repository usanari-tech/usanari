import { createClient } from '@/lib/supabase/server'
import { LogOut, ChefHat } from 'lucide-react'
import PostModal from './post-modal'
import { signOut } from '../auth/actions'
import { redirect } from 'next/navigation'

export default async function DashboardHeader() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // ヘッダー内でのリダイレクトは避けたほうがいいが、未ログインなら表示しようがない
    if (!user) return redirect('/login')

    return (
        <header className="sticky top-0 z-50 glass border-b border-gray-200/50">
            <nav className="max-w-lg mx-auto flex justify-between items-center px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-md">
                        <ChefHat size={18} className="text-white" />
                    </div>
                    <h1 className="font-bold text-lg text-gray-900">Food Comments</h1>
                </div>
                <div className="flex items-center gap-3">
                    <PostModal />
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-bold text-gray-600 shadow-inner">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <form action={signOut}>
                            <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="ログアウト">
                                <LogOut size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </nav>
        </header>
    )
}
