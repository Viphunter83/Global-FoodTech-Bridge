'use server';

import { revalidatePath } from 'next/cache';

export async function refreshAdminData() {
    revalidatePath('/[locale]/admin/dashboard', 'page');
    revalidatePath('/[locale]/admin/demo', 'page');
    revalidatePath('/[locale]/admin/operations', 'page');
}
