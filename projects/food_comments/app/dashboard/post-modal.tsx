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
                    className="fixed inset-0 z-50 flex items-center justify-center modal-overlay animate-fade-in p-4 pb-10 sm:p-0"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="modal-content animate-slide-up p-6 relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all"
                        >
                            <X size={18} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
                                <Sparkles size={26} className="text-gray-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">食事を記録</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                23:00に辛口評価が届きます
                            </p>
                        </div>

                        <UploadForm onSuccess={handleSuccess} />
                    </div>
                </div>
            )}
        </>
    )
}
