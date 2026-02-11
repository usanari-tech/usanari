import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardHeaderClient from './header'

export default async function DashboardHeaderWrapper() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    // 必要なデータだけ抽出して渡す（シリアライズ可能なオブジェクトにする）
    const userData = {
        email: user.email,
        user_metadata: user.user_metadata
    }

    return <DashboardHeaderClient user={userData} />
}
