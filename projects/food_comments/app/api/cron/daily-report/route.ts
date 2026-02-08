import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Allow Vercel Cron to run for up to 60 seconds (max for Hobby plan functions)
export const maxDuration = 60

export async function GET(request: Request) {
    // Simple security check (Authorization header)
    // In production, Vercel Cron sends this header
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // For local testing, we might want to skip this or use a simple query param
        const { searchParams } = new URL(request.url)
        if (searchParams.get('key') !== process.env.CRON_SECRET) {
            return new NextResponse('Unauthorized', { status: 401 })
        }
    }

    try {
        const supabase = createAdminClient()
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        // 1. Fetch unprocessed meal logs
        const { data: logs, error: logsError } = await supabase
            .from('meal_logs')
            .select('id, user_id, image_path, memo, created_at')
            .eq('processed', false)
            .order('created_at', { ascending: true })

        if (logsError) throw logsError
        if (!logs || logs.length === 0) {
            return NextResponse.json({ message: 'No unprocessed logs found' })
        }

        // 2. Group logs by user
        const userLogs: { [key: string]: typeof logs } = {}
        logs.forEach(log => {
            if (!userLogs[log.user_id]) userLogs[log.user_id] = []
            userLogs[log.user_id].push(log)
        })

        const results = []

        // 3. Process per user
        for (const userId of Object.keys(userLogs)) {
            const meals = userLogs[userId]
            const promptParts = []

            promptParts.push("あなたはドSで口の悪い管理栄養士です。ユーザーの昨日の食事内容を見て、辛辣な罵倒とともに栄養指導をしてください。甘えは一切許しません。")
            promptParts.push("出力は以下のJSON形式のみで行ってください。Markdownのコードブロックは不要です。")
            promptParts.push(JSON.stringify({
                summary: "1日の食事の栄養バランス要約（真面目に）",
                roast: "辛辣な罵倒メッセージ（200文字程度、人格を否定する勢いで）",
                score: "0〜100の点数（整数）"
            }))

            promptParts.push("\n== 食事内容 ==")

            for (const meal of meals) {
                promptParts.push(`\n[時間: ${new Date(meal.created_at).toLocaleString('ja-JP')}]`)
                if (meal.memo) promptParts.push(`メモ: ${meal.memo}`)

                // Download image from Supabase Storage
                const { data: imageBlob, error: downloadError } = await supabase.storage
                    .from('meal_photos')
                    .download(meal.image_path)

                if (!downloadError && imageBlob) {
                    // Convert Blob to Base64 for Gemini
                    const arrayBuffer = await imageBlob.arrayBuffer()
                    const base64Data = Buffer.from(arrayBuffer).toString('base64')

                    promptParts.push({
                        inlineData: {
                            data: base64Data,
                            mimeType: imageBlob.type || 'image/webp'
                        }
                    })
                }
            }

            // Call Gemini API
            try {
                const result = await model.generateContent(promptParts)
                const response = result.response
                let text = response.text()

                // Clean up markdown code blocks if present
                text = text.replace(/```json/g, '').replace(/```/g, '').trim()

                const aiData = JSON.parse(text)

                // Save Daily Report
                const { error: reportError } = await supabase
                    .from('daily_reports')
                    .insert({
                        user_id: userId,
                        nutritional_summary: { text: aiData.summary },
                        ai_comment: aiData.roast,
                        score: aiData.score,
                        report_date: new Date().toISOString().split('T')[0] // Today's report
                    })

                if (reportError) {
                    console.error(`Failed to save report for ${userId}:`, reportError)
                    results.push({ userId, status: 'error', error: reportError, step: 'save_report' })
                    continue
                }

                // Mark logs as processed
                const logIds = meals.map(m => m.id)
                await supabase
                    .from('meal_logs')
                    .update({ processed: true })
                    .in('id', logIds)

                results.push({ userId, status: 'success' })

            } catch (err) {
                console.error(`Error processing user ${userId}:`, err)
                results.push({ userId, status: 'error', error: err })
            }
        }

        return NextResponse.json({ processed: results })

    } catch (error: any) {
        console.error('Batch Job Error:', error)
        return new NextResponse(`Error: ${error.message}`, { status: 500 })
    }
}
