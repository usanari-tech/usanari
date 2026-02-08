'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'
import { Upload, X, Loader2 } from 'lucide-react'

export default function UploadForm() {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [memo, setMemo] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const originalFile = e.target.files[0]

            // Preview immediately
            const objectUrl = URL.createObjectURL(originalFile)
            setPreview(objectUrl)
            setFile(originalFile)
            setMessage(null)
        }
    }

    const clearFile = () => {
        setFile(null)
        setPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setLoading(true)
        setMessage(null)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error('User not found')

            // Compress image
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
                fileType: 'image/webp'
            }

            const compressedFile = await imageCompression(file, options)

            // Upload to Storage
            const fileExt = 'webp'
            const fileName = `${user.id}/${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('meal_photos')
                .upload(fileName, compressedFile)

            if (uploadError) throw uploadError

            // Insert record
            const { error: dbError } = await supabase
                .from('meal_logs')
                .insert({
                    user_id: user.id,
                    image_path: fileName,
                    memo: memo,
                })

            if (dbError) throw dbError

            // Reset form
            clearFile()
            setMemo('')
            setMessage({ type: 'success', text: '投稿しました！深夜に罵倒されます。' })

        } catch (error: any) {
            console.error('Upload error:', error)
            setMessage({ type: 'error', text: `エラーが発生しました: ${error.message}` })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
            <h3 className="text-lg font-bold mb-4">食事を記録する</h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Image Preview / Selection */}
                <div className="relative w-full aspect-video bg-zinc-800 rounded-md flex items-center justify-center overflow-hidden border border-zinc-700 border-dashed hover:border-zinc-500 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}>

                    {preview ? (
                        <>
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                                className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white hover:bg-black/80"
                            >
                                <X size={20} />
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center text-zinc-400">
                            <Upload size={32} className="mb-2" />
                            <span className="text-sm">写真をアップロード</span>
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {/* Memo Input */}
                <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="メモ (例: ラーメン大盛り、野菜抜き)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-900 resize-none h-20"
                />

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!file || loading}
                    className="w-full bg-red-700 hover:bg-red-800 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold py-2 rounded-md transition-colors flex items-center justify-center"
                >
                    {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : '投稿する'}
                </button>

                {message && (
                    <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        {message.text}
                    </div>
                )}
            </form>
        </div>
    )
}
