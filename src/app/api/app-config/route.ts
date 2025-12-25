import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'public', 'app-data.json')

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Config not found' }, { status: 404 })
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8')
        return NextResponse.json(JSON.parse(fileContent))
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
