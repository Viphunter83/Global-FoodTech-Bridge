'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-guard';

export async function refreshMonitoringData(locale: string) {
    // Server actions are callable directly over HTTP, so they need their own check
    await requireAdmin();
    console.log(`[GFTB-ACTION] Revalidating monitoring data for locale: ${locale}`);
    revalidatePath(`/${locale}/admin/monitoring`);
}
