import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request, { params }: { params: { filename: string } }) {
    const filename = params.filename;

    // Basic security check to prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
        return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const directoryPath = process.env.MD_SOURCE_DIR || path.join(process.cwd(), '../');
    const filePath = path.join(directoryPath, filename);

    try {
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        return NextResponse.json({ content });
    } catch (error) {
        console.error("Error reading file:", error);
        return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
    }
}
