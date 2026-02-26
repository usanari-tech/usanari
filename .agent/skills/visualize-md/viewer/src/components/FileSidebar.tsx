"use client";

import React from 'react';
import useSWR from 'swr';
import { FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn utility exists from create-next-app or manually created if not

// Simple fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface FileSidebarProps {
    selectedFile: string | null;
    onSelectFile: (filename: string) => void;
}

interface FileData {
    name: string;
    lastModified: string;
}

const FileSidebar: React.FC<FileSidebarProps> = ({ selectedFile, onSelectFile }) => {
    const { data: files, error, isLoading } = useSWR<FileData[]>('/api/files', fetcher, {
        refreshInterval: 5000, // Poll every 5 seconds for new files
    });

    if (isLoading) {
        return (
            <div className="w-64 h-screen border-r bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-64 h-screen border-r bg-red-50 p-4 text-red-500 text-sm">
                Failed to load files.
            </div>
        );
    }

    return (
        <aside className="w-64 h-screen border-r bg-gray-50 overflow-y-auto flex-shrink-0">
            <div className="p-4 border-b bg-white sticky top-0 z-10">
                <h2 className="font-semibold text-gray-700">Documents</h2>
            </div>
            <nav className="p-2 space-y-1">
                {files?.map((file) => (
                    <button
                        key={file.name}
                        onClick={() => onSelectFile(file.name)}
                        className={cn(
                            "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                            selectedFile === file.name
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        <FileText className="w-4 h-4" />
                        <span className="truncate">{file.name}</span>
                    </button>
                ))}
                {files?.length === 0 && (
                    <div className="text-gray-400 text-xs text-center py-8">
                        No markdown files found.
                    </div>
                )}
            </nav>
        </aside>
    );
};

export default FileSidebar;
