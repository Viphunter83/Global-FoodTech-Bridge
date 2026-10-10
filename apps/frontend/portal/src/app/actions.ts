'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-guard';

export async function refreshAdminData() {
    await requireAdmin();
    // Revalidate everything under admin to ensure all components see new data
    revalidatePath('/[locale]/admin', 'layout');
}
