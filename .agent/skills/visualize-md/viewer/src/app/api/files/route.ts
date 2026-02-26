import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    const directoryPath = process.env.MD_SOURCE_DIR || path.join(process.cwd(), '../'); // Use env var or default


    try {
        const files = fs.readdirSync(directoryPath);
        const mdFiles = files.filter(file => file.endsWith('.md')).map(file => {
            const filePath = path.join(directoryPath, file);
            const stats = fs.statSync(filePath);
            return {
                name: file,
                lastModified: stats.mtime,
            };
        });

        // Sort by last modified date (descending)
        mdFiles.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

        return NextResponse.json(mdFiles);
    } catch (error) {
        console.error("Error reading directory:", error);
        return NextResponse.json({ error: 'Failed to read directory' }, { status: 500 });
    }
}
