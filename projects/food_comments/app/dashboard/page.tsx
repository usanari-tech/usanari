import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '../auth/actions'
import PostModal from './post-modal'
import TodayMealCard from './today-meal-card'
import ImageWithZoom from './image-with-zoom'
import HistoryView from './history-view'
import { getTodayMealLogs, getPastReports, getReportsByDateRange, type PastReport, type MealAnalysis, type ReportSummary } from './actions'
import { getJSTDateString } from '@/lib/timezone'
import { LogOut, Clock, ChefHat, Flame } from 'lucide-react'

export default async function Dashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // 今週の月曜日を算出
    const today = getJSTDateString()
    const todayDate = new Date(today + 'T00:00:00Z')
    const dayOfWeek = todayDate.getUTCDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(todayDate)
    monday.setUTCDate(todayDate.getUTCDate() + mondayOffset)
    const sunday = new Date(monday)
    sunday.setUTCDate(monday.getUTCDate() + 6)
    const weekStart = monday.toISOString().split('T')[0]
    const weekEnd = sunday.toISOString().split('T')[0]

    // 今月の範囲
    const monthStart = today.substring(0, 7) + '-01'
    const monthEnd = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth() + 1, 0)).toISOString().split('T')[0]

    const [todayMeals, reports, weeklyReports, monthlyReports] = await Promise.all([
        getTodayMealLogs(),
        getPastReports(),
        getReportsByDateRange(weekStart, weekEnd),
        getReportsByDateRange(monthStart, monthEnd),
    ])

    const latestReport = reports[0]
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    // 食事カードコンポーネント
    const MealCard = ({ meal, index }: { meal: MealAnalysis; index: number }) => {
        const time = meal.created_at
            ? new Date(meal.created_at).toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Tokyo'
            })
            : null

        return (
            <div
                className="card p-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
            >
                <div className="flex gap-4">
                    {meal.image_path && (
                        <ImageWithZoom
                            src={`${supabaseUrl}/storage/v1/object/public/meal_photos/${meal.image_path}`}
                            alt={meal.menu_name}
                            className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden shadow-sm"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900 text-base">{meal.menu_name}</h4>
                            {time && (
                                <span className="text-xs text-gray-400">{time}</span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                            <span className="nutrition-pill">
                                <Flame size={12} className="text-orange-500" />
                                {meal.calories} kcal
                            </span>
                            <span className="nutrition-pill">P {meal.pfc?.p}g</span>
                            <span className="nutrition-pill">F {meal.pfc?.f}g</span>
                            <span className="nutrition-pill">C {meal.pfc?.c}g</span>
                        </div>
                        {meal.memo && (
                            <p className="text-xs text-gray-500 italic">📝 {meal.memo}</p>
                        )}
                    </div>
                </div>
                {meal.comment && (
                    <div className="comment-box mt-3">
                        <p className="text-sm text-gray-600 leading-relaxed">{meal.comment}</p>
                    </div>
                )}
            </div>
        )
    }

    // スコア表示コンポーネント
    const ScoreDisplay = ({ score }: { score: number }) => {
        const colorClass = score < 50 ? 'score-low' : score < 80 ? 'score-mid' : 'score-good'
        return (
            <div className="flex items-center gap-2">
                <div className={`text-3xl font-black ${colorClass}`}>{score}</div>
                <div className="text-sm text-gray-400 font-medium">/ 100</div>
            </div>
        )
    }

    // レポートカードコンポーネント
    const ReportCard = ({ report, isLatest = false }: { report: PastReport; isLatest?: boolean }) => (
        <div className={`card overflow-hidden ${isLatest ? 'animate-slide-up' : ''}`}>
            {/* ヘッダー */}
            <div className="px-5 py-4 border-b border-gray-100/80 flex justify-between items-center bg-gradient-to-r from-gray-50/50 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-gray-900">{report.report_date}</div>
                    {isLatest && <span className="badge-accent">新着</span>}
                </div>
                <ScoreDisplay score={report.score} />
            </div>

            <div className="p-5 space-y-4">
                {/* 合計カロリー */}
                {report.total_calories && (
                    <div className="flex items-center justify-between py-3 px-4 bg-gray-50/80 rounded-xl">
                        <span className="text-sm text-gray-500 font-medium">本日の摂取量</span>
                        <span className="text-lg font-bold text-gray-800">
                            {report.total_calories.toLocaleString()} <span className="text-sm font-normal text-gray-400">kcal</span>
                        </span>
                    </div>
                )}

                {/* 食事カード一覧 */}
                {report.meals.length > 0 ? (
                    <div className="space-y-3">
                        {report.meals.map((meal, i) => (
                            <MealCard key={i} meal={meal} index={i} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state py-8">
                        <div className="empty-state-icon">🍽️</div>
                        <p className="text-gray-400">食事データがありません</p>
                    </div>
                )}

                {/* 辛口コメント */}
                {report.ai_comment && (
                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-sm">
                                <Flame size={16} className="text-white" />
                            </div>
                            <span className="font-bold text-gray-800">辛口コメント</span>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-100">
                            <p className="text-gray-700 text-sm leading-relaxed">{report.ai_comment}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* ヘッダー */}
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

            <main className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-6">

                {/* 今日のサマリー */}
                {todayMeals.length > 0 && (
                    <div className="card p-4 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                                    <Clock size={20} className="text-indigo-500" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">今日 {todayMeals.length}件</div>
                                    <div className="text-xs text-gray-400">投稿済み</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-500">23:00</div>
                                <div className="text-xs text-gray-400">評価予定</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 今日の投稿（未評価） */}
                {todayMeals.length > 0 && (
                    <section className="animate-fade-in">
                        <h2 className="section-title flex items-center gap-2">
                            <span>📸</span> 今日の投稿
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {todayMeals.map((meal) => (
                                <TodayMealCard
                                    key={meal.id}
                                    meal={meal}
                                    supabaseUrl={supabaseUrl!}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* 直近のレポート */}
                {latestReport ? (
                    <section>
                        <h2 className="section-title flex items-center gap-2">
                            <span>🔥</span> 最新のレポート
                        </h2>
                        <ReportCard report={latestReport} isLatest={true} />
                    </section>
                ) : todayMeals.length === 0 && (
                    <div className="card empty-state animate-fade-in">
                        <div className="empty-state-icon">🍽️</div>
                        <p className="text-gray-600 font-medium mb-1">まだレポートがありません</p>
                        <p className="text-sm text-gray-400">
                            右上の「＋」ボタンから<br />食事を記録してください
                        </p>
                    </div>
                )}

                {/* 週間/月間ビュー */}
                <HistoryView
                    weeklyReports={weeklyReports}
                    monthlyReports={monthlyReports}
                    supabaseUrl={supabaseUrl!}
                />
            </main>
        </div>
    )
}
