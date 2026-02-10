'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteMealLog(mealId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // 1. meal_logを取得して画像パスとprocessed状態を確認
    const { data: meal, error: fetchError } = await supabase
        .from('meal_logs')
        .select('image_path, processed, user_id')
        .eq('id', mealId)
        .single()

    if (fetchError || !meal) {
        return { success: false, error: 'Meal not found' }
    }

    // 自分の投稿かつ未処理のみ削除可能
    if (meal.user_id !== user.id) {
        return { success: false, error: 'Unauthorized' }
    }

    if (meal.processed) {
        return { success: false, error: '評価済みの投稿は削除できません' }
    }

    // 2. ストレージから画像を削除
    if (meal.image_path) {
        await supabase.storage
            .from('meal_photos')
            .remove([meal.image_path])
    }

    // 3. DBからmeal_logを削除
    const { data: deleteData, error: deleteError } = await supabase
        .from('meal_logs')
        .delete()
        .eq('id', mealId)
        .select()

    if (deleteError) {
        return { success: false, error: deleteError.message }
    }

    if (!deleteData || deleteData.length === 0) {
        return { success: false, error: '削除に失敗しました（権限がないか、既に削除されています）' }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
