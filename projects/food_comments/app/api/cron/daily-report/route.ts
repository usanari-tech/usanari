import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { utcToJSTDateString } from '@/lib/timezone'

// CloudflareのCron等で必要な場合は、wrangler.toml側で制御します
// Vercel依存の設定は削除・無効化
// export const maxDuration = 60
// export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    // セキュリティチェック
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        const { searchParams } = new URL(request.url)
        if (searchParams.get('key') !== process.env.CRON_SECRET) {
            return new NextResponse('Unauthorized', { status: 401 })
        }
    }

    try {
        const supabase = createAdminClient()
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" })

        // 1. 未処理のmeal_logsを取得
        const { data: logs, error: logsError } = await supabase
            .from('meal_logs')
            .select('id, user_id, image_path, memo, created_at')
            .eq('processed', false)
            .order('created_at', { ascending: true })

        if (logsError) throw logsError
        if (!logs || logs.length === 0) {
            return NextResponse.json({ message: 'No unprocessed logs found' })
        }

        // 2. ユーザーごと × JST日付ごとにグループ化
        const userDateLogs: { [key: string]: typeof logs } = {}
        logs.forEach(log => {
            const jstDate = utcToJSTDateString(log.created_at)
            const groupKey = `${log.user_id}__${jstDate}`
            if (!userDateLogs[groupKey]) userDateLogs[groupKey] = []
            userDateLogs[groupKey].push(log)
        })

        // ペルソナの定義
        const personas = [
            {
                role: "30歳の辛口お姉さん",
                prompt: "あなたは30歳の辛口お姉さん。栄養学に詳しく、弟や妹のような相手に対して厳しくも愛のある指導をします。口調は「〜でしょ」「〜なさい」「何考えてるの？」など、きつめだけど根底に優しさがある感じ。"
            },
            {
                role: "熱血マッスルトレーナー",
                prompt: "あなたは熱血のフィットネストレーナーです。「筋肉が喜んでるぞ！」「バルクアップ！」など体育会系で暑苦しく、とにかくポジティブでハイテンションな口調で指導してください。"
            },
            {
                role: "オタク気質のデータサイエンティスト",
                prompt: "あなたは栄養データを分析するオタク気質のデータサイエンティストです。口調は「〜というエビデンスがあります」「ふむ、興味深いマクロ栄養素ですね」など、理屈っぽく専門用語を多用しますが、健康を真剣に考えています。"
            },
            {
                role: "優しいおばあちゃん",
                prompt: "あなたは田舎に住む優しいおばあちゃんです。「たくさんお食べ」「無理しちゃだめだよ」「栄養つけてね」など、とにかく甘やかしつつ、野菜不足などは優しく指摘する温かいトーンで指導してください。"
            },
            {
                role: "ツンデレメイド",
                prompt: "あなたはユーザーに仕えるツンデレのメイドです。「べ、別にご主人様の健康なんて気にしてないんだから！」「もう、こんな食事してたら倒れちゃいますよ！」など、怒りつつも心配している様子を出してください。"
            }
        ];

        const results = []

        // 3. ユーザー×日付ごとに処理
        for (const groupKey of Object.keys(userDateLogs)) {
            const [userId, reportDate] = groupKey.split('__')
            const meals = userDateLogs[groupKey]
            const promptParts: any[] = []

            // ペルソナをランダムに選択
            const currentPersona = personas[Math.floor(Math.random() * personas.length)]

            // プロンプト構築
            promptParts.push(
                currentPersona.prompt,
                "ユーザーが投稿したメモ（例：「野菜抜き」「大盛り」など）があれば、その情報も必ず考慮してコメントしてください。",
                "メモのみで画像がない場合もありますが、その際はメモ内容の文字情報だけから推定してコメントしてください。",
                "",
                "## 出力形式",
                "以下のJSON形式のみで出力してください。Markdownのコードブロックは不要です。",
                "",
                `食事は${meals.length}件あります。必ず${meals.length}件分のmeals配列を返してください。`,
                "",
                JSON.stringify({
                    meals: [
                        {
                            menu_name: "料理名（例：カツ丼）",
                            calories: 500,
                            pfc: { p: 20, f: 25, c: 60 },
                            comment: "この料理に対する辛口コメント（50字程度、メモの内容も踏まえて）"
                        }
                    ],
                    daily_summary: {
                        total_calories: 1500,
                        total_pfc: { p: 80, f: 60, c: 150 },
                        score: 65,
                        roast: `1日の総評（200字以上）。${currentPersona.role}になりきった言葉で。`
                    }
                }, null, 2),
                "",
                "## 食事画像とメモ"
            )

            // 各食事の画像を追加
            for (let i = 0; i < meals.length; i++) {
                const meal = meals[i]
                promptParts.push(`\n--- 食事 ${i + 1} ---`)

                if (meal.image_path) {
                    const { data: imageBlob, error: downloadError } = await supabase.storage
                        .from('meal_photos')
                        .download(meal.image_path)

                    if (!downloadError && imageBlob) {
                        const arrayBuffer = await imageBlob.arrayBuffer()
                        const base64Data = Buffer.from(arrayBuffer).toString('base64')

                        promptParts.push({
                            inlineData: {
                                data: base64Data,
                                mimeType: imageBlob.type || 'image/webp'
                            }
                        })
                    } else if (downloadError) {
                        console.error(`画像ダウンロード失敗 ${meal.image_path}:`, downloadError)
                    }
                } else {
                    promptParts.push("(画像なし)")
                }

                if (meal.memo) {
                    promptParts.push(`メモ: ${meal.memo}`)
                }
            }

            // Gemini API呼び出し
            try {
                const result = await model.generateContent(promptParts)
                const response = result.response
                let text = response.text()

                // JSONを抽出（堅牢なパース）
                text = text.replace(/```json/g, '').replace(/```/g, '').trim()

                let aiData: any
                try {
                    aiData = JSON.parse(text)
                } catch (parseErr) {
                    console.error(`JSON parse failed for ${userId}:`, text.substring(0, 200))
                    // パース失敗 - 処理済みにはせず、次回再試行
                    results.push({ userId, reportDate, status: 'parse_error', error: 'AI response was not valid JSON' })
                    continue
                }

                // mealsの件数チェック
                if (!aiData.meals || !Array.isArray(aiData.meals)) {
                    console.error(`Invalid meals format for ${userId}`)
                    results.push({ userId, reportDate, status: 'format_error', error: 'AI response missing meals array' })
                    continue
                }

                // mealsの件数チェック。ここで不一致の場合はエラーでブロックし、processed = true にさせない
                if (aiData.meals.length !== meals.length) {
                    console.error(`Meal count mismatch for ${userId}: Input ${meals.length} vs Output ${aiData.meals.length}`)
                    results.push({ userId, reportDate, status: 'count_mismatch_error', error: 'AI output meal count did not match input' })
                    continue
                }

                // AIのmeals分析にimage_pathをマージ
                const mealsWithImages = aiData.meals.map((m: any, i: number) => ({
                    ...m,
                    image_path: meals[i]?.image_path || null,
                }))

                // daily_reportを保存（食事投稿日ベースの日付を使用）
                const { data: reportData, error: reportError } = await supabase
                    .from('daily_reports')
                    .upsert({
                        user_id: userId,
                        report_date: reportDate,
                        nutritional_summary: {
                            total_calories: aiData.daily_summary?.total_calories,
                            total_pfc: aiData.daily_summary?.total_pfc,
                            meals: mealsWithImages
                        },
                        ai_comment: aiData.daily_summary?.roast,
                        score: aiData.daily_summary?.score
                    }, {
                        onConflict: 'user_id,report_date'
                    })
                    .select('id')
                    .single()

                if (reportError) {
                    console.error(`Failed to save report for ${userId}:`, reportError)
                    results.push({ userId, reportDate, status: 'error', error: reportError.message })
                    continue
                }


                const reportId = reportData?.id

                if (!reportId) {
                    throw new Error(`Report ID could not be retrieved for ${userId}`)
                }

                if (!reportId) {
                    throw new Error(`Report ID could not be retrieved for ${userId}`)
                }

                // 各meal_logのanalysis + report_idを更新
                for (let i = 0; i < meals.length; i++) {
                    const mealId = meals[i].id
                    const mealAnalysis = aiData.meals?.[i] || null

                    await supabase
                        .from('meal_logs')
                        .update({
                            analysis: mealAnalysis,
                            processed: true,
                            ...(reportId ? { report_id: reportId } : {})
                        })
                        .eq('id', mealId)
                }

                results.push({ userId, reportDate, status: 'success', mealsProcessed: meals.length })

            } catch (err: any) {
                console.error(`Error processing user ${userId}:`, err)
                results.push({ userId, reportDate, status: 'error', error: err.message })
            }
        }

        return NextResponse.json({ processed: results })

    } catch (error: any) {
        console.error('Batch Job Error:', error)
        return new NextResponse(`Error: ${error.message}`, { status: 500 })
    }
}
