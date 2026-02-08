import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '../auth/actions'
import UploadForm from './upload-form'
import ReportView from './report-view'

export default async function Dashboard() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    return (
        <div className="flex-1 w-full flex flex-col gap-20 items-center">
            <div className="w-full">
                <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                    <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
                        <div className="font-bold">Food Comments</div>
                        <div className="flex gap-4 items-center">
                            <span>{user.email}</span>
                            <form action={signOut}>
                                <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
                                    ログアウト
                                </button>
                            </form>
                        </div>
                    </div>
                </nav>
            </div>

            <div className="animate-in flex-1 flex flex-col gap-20 max-w-4xl px-3 w-full items-center">
                <main className="flex-1 flex flex-col gap-6 items-center w-full">
                    <h2 className="font-bold text-4xl mb-4">Dashboard</h2>
                    <ReportView />
                    <UploadForm />
                </main>
            </div>
        </div>
    )
}
