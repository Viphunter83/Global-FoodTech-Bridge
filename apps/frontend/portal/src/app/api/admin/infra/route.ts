import { fetchInfrastructureStatus } from '@/lib/railway';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-server';

// Uses the account-wide RAILWAY_TOKEN, so it is restricted to admins
export const GET = withAuth(async (_request: NextRequest) => {
    try {
        const data = await fetchInfrastructureStatus();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Failed to proxy infra status:', error);
        return NextResponse.json({ error: 'Failed to fetch infrastructure status' }, { status: 500 });
    }
}, 'admin');
