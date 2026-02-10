'use client'

import { useState } from 'react'
import { Plus, X, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import UploadForm from './upload-form'

export default function PostModal() {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    const handleSuccess = () => {
        setTimeout(() => {
            setIsOpen(false)
            router.refresh()
        }, 1500)
    }

    // 背景スクロールロック
    useState(() => {
        if (typeof window !== 'undefined') {
            document.body.style.overflow = isOpen ? 'hidden' : 'unset'
            return () => { document.body.style.overflow = 'unset' }
        }
    })

    // isOpenが変わるたびに実行
    if (typeof window !== 'undefined') {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fab"
                title="食事を記録"
            >
                <Plus size={24} strokeWidth={2.5} />
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setIsOpen(false)}
                >
                    <div className="min-h-screen px-4 py-8 flex items-center justify-center">
                        <div
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative animate-slide-up mx-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all z-10"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
                                    <Sparkles size={28} className="text-gray-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">食事を記録</h2>
                                <p className="text-sm text-gray-500 mt-2">
                                    写真をアップロードしてください<br />
                                    <span className="text-xs text-gray-400">（23:00に辛口評価が届きます）</span>
                                </p>
                            </div>

                            <UploadForm onSuccess={handleSuccess} />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
