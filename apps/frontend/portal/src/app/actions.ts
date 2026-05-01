'use server';

import { revalidatePath } from 'next/cache';

export async function refreshAdminData() {
    // Revalidate everything under admin to ensure all components see new data
    revalidatePath('/[locale]/admin', 'layout');
}
