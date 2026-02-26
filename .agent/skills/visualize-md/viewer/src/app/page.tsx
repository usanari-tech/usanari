"use client";

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import FileSidebar from '@/components/FileSidebar';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Loader2 } from 'lucide-react';

// Simple fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    // Fetch content of selected file
    const { data: fileData, error: fileError, isLoading: fileLoading } = useSWR(
        selectedFile ? `/api/files/${selectedFile}` : null,
        fetcher,
        {
            refreshInterval: 2000, // Poll every 2 seconds for content updates
        }
    );

    return (
        <div className="flex h-screen bg-white">
            <FileSidebar
                selectedFile={selectedFile}
                onSelectFile={setSelectedFile}
            />
            <main className="flex-1 h-screen overflow-y-auto bg-white p-8">
                {selectedFile ? (
                    <>
                        {fileLoading && !fileData && (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <Loader2 className="animate-spin mr-2" /> Loading...
                            </div>
                        )}
                        {fileError && (
                            <div className="flex items-center justify-center h-full text-red-500">
                                Failed to load file content.
                            </div>
                        )}
                        {fileData && (
                            <div className="max-w-3xl mx-auto">
                                <h1 className="text-xl font-bold mb-6 text-gray-800 pb-4 border-b border-gray-100">{selectedFile}</h1>
                                <MarkdownRenderer content={fileData.content} />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        Select a file to view.
                    </div>
                )}
            </main>
        </div>
    );
}
