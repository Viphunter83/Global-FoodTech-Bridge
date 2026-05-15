'use server';

import { revalidatePath } from 'next/cache';

export async function refreshMonitoringData(locale: string) {
    console.log(`[GFTB-ACTION] Revalidating monitoring data for locale: ${locale}`);
    revalidatePath(`/${locale}/admin/monitoring`);
}
