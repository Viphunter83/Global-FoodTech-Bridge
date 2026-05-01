import { fetchInfrastructureStatus } from '@/lib/railway';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const data = await fetchInfrastructureStatus();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Failed to proxy infra status:', error);
        return NextResponse.json({ error: 'Failed to fetch infrastructure status' }, { status: 500 });
    }
}
