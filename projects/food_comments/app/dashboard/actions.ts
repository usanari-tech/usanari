'use server'

import { createClient } from '@/lib/supabase/server'
import { getJSTDateString, getJSTDayRange } from '@/lib/timezone'

// 今日の未評価投稿を取得
export type TodayMealLog = {
    id: string
    image_path: string
    memo?: string
    created_at: string
}

export async function getTodayMealLogs(): Promise<TodayMealLog[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const today = getJSTDateString()
    const { start } = getJSTDayRange(today)

    const { data: meals, error } = await supabase
        .from('meal_logs')
        .select('id, image_path, memo, created_at')
        .eq('user_id', user.id)
        .eq('processed', false)
        .gte('created_at', start)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching today meals:', error)
        return []
    }

    return meals || []
}

// 過去のレポートを取得（食事単位の分析結果付き）
export type MealAnalysis = {
    menu_name: string
    calories: number
    pfc: { p: number; f: number; c: number }
    comment: string
    image_path?: string
    memo?: string
    created_at?: string
}

export type PastReport = {
    id: string
    report_date: string
    score: number
    ai_comment: string
    total_calories?: number
    total_pfc?: { p: number; f: number; c: number }
    meals: MealAnalysis[]
}

export async function getPastReports(): Promise<PastReport[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // 1. レポートと紐づく食事データをJOINで一括取得（N+1クエリ解消）
    const { data: reports, error } = await supabase
        .from('daily_reports')
        .select(`
            id, 
            report_date, 
            score, 
            ai_comment, 
            nutritional_summary,
            meal_logs (image_path, memo, analysis, created_at)
        `)
        .eq('user_id', user.id)
        .order('report_date', { ascending: false })
        .limit(10)

    if (error || !reports) {
        console.error('Error fetching reports:', error)
        return []
    }

    const result: PastReport[] = []

    for (const report of reports) {
        const mealLogs = report.meal_logs as any[] | null

        // 2. meal_logsのanalysisから食事データを構築
        const meals: MealAnalysis[] = []

        if (mealLogs && mealLogs.length > 0) {
            // 作成日時でソート (JOINで順序保証がない場合の対策)
            const sortedLogs = [...mealLogs].sort((a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )

            for (const log of sortedLogs) {
                if (log.analysis) {
                    meals.push({
                        menu_name: log.analysis.menu_name || '不明',
                        calories: log.analysis.calories || 0,
                        pfc: log.analysis.pfc || { p: 0, f: 0, c: 0 },
                        comment: log.analysis.comment || '',
                        image_path: log.image_path,
                        memo: log.memo,
                        created_at: log.created_at
                    })
                }
            }
        }

        // フォールバック: 古い形式のnutritional_summaryからmeals配列を取得（JOINで取得できなかった過去データ用）
        if (meals.length === 0 && report.nutritional_summary?.meals) {
            const legacyMeals = report.nutritional_summary.meals as any[]
            legacyMeals.forEach((m: any, i: number) => {
                meals.push({
                    menu_name: m.menu_name || '不明',
                    calories: m.calories || 0,
                    pfc: m.pfc || { p: 0, f: 0, c: 0 },
                    comment: m.comment || '',
                    image_path: undefined,
                    memo: undefined,
                    created_at: undefined
                })
            })
        }

        result.push({
            id: report.id,
            report_date: report.report_date,
            score: report.score,
            ai_comment: report.ai_comment,
            total_calories: report.nutritional_summary?.total_calories,
            total_pfc: report.nutritional_summary?.total_nutrition || report.nutritional_summary?.total_pfc,
            meals
        })
    }

    return result
}

// 日付範囲でレポートを取得（週間/月間ビュー用）
export type ReportSummary = {
    id: string
    report_date: string
    score: number
    ai_comment: string
    total_calories: number
    total_pfc: { p: number; f: number; c: number }
    meal_count: number
    meals: {
        menu_name: string
        calories: number
        pfc: { p: number; f: number; c: number }
        comment: string
        image_path?: string
    }[]
}

export async function getReportsByDateRange(
    startDate: string,
    endDate: string
): Promise<ReportSummary[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: reports, error } = await supabase
        .from('daily_reports')
        .select('id, report_date, score, ai_comment, nutritional_summary')
        .eq('user_id', user.id)
        .gte('report_date', startDate)
        .lte('report_date', endDate)
        .order('report_date', { ascending: true })

    if (error || !reports) return []

    // meal_logsからimage_pathを取得（日付範囲で一括取得）
    const { data: allMealLogs } = await supabase
        .from('meal_logs')
        .select('report_id, image_path, created_at')
        .eq('user_id', user.id)
        .gte('created_at', `${startDate}T00:00:00+09:00`)
        .lte('created_at', `${endDate}T23:59:59+09:00`)
        .order('created_at', { ascending: true })

    // report_id別にグループ化
    const imagesByReportId = new Map<string, string[]>()
    // 日付別にグループ化（report_idがないデータ用フォールバック）
    const imagesByDate = new Map<string, string[]>()

    if (allMealLogs) {
        for (const log of allMealLogs) {
            if (!log.image_path) continue

            // report_idがあればそちらで紐付け
            if (log.report_id) {
                const arr = imagesByReportId.get(log.report_id) || []
                arr.push(log.image_path)
                imagesByReportId.set(log.report_id, arr)
            }

            // 日付ベースでも紐付け（フォールバック用）
            const jstDate = new Date(new Date(log.created_at).getTime() + 9 * 60 * 60 * 1000)
            const dateKey = jstDate.toISOString().split('T')[0]
            const arr = imagesByDate.get(dateKey) || []
            arr.push(log.image_path)
            imagesByDate.set(dateKey, arr)
        }
    }

    return reports.map(r => {
        const rawMeals = r.nutritional_summary?.meals || []
        const hasImages = rawMeals.some((m: any) => m.image_path)

        // フォールバック: report_id → 日付
        const fallbackImages = imagesByReportId.get(r.id) || imagesByDate.get(r.report_date) || []

        const meals = rawMeals.map((m: any, i: number) => ({
            menu_name: m.menu_name || '不明',
            calories: m.calories || 0,
            pfc: m.pfc || { p: 0, f: 0, c: 0 },
            comment: m.comment || '',
            image_path: m.image_path || (!hasImages ? fallbackImages[i] : undefined),
        }))

        return {
            id: r.id,
            report_date: r.report_date,
            score: r.score || 0,
            ai_comment: r.ai_comment || '',
            total_calories: r.nutritional_summary?.total_calories || 0,
            total_pfc: {
                p: r.nutritional_summary?.total_pfc?.p || 0,
                f: r.nutritional_summary?.total_pfc?.f || 0,
                c: r.nutritional_summary?.total_pfc?.c || 0,
            },
            meal_count: meals.length,
            meals,
        }
    })
}
