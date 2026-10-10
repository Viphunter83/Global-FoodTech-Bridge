import { cache } from 'react';
import { getBatchDetails } from './api';

/**
 * Per-request memoization for server components: generateMetadata and the page
 * both need the batch, and uncached (no-store) fetches are not deduplicated by Next.
 */
export const getBatchDetailsCached = cache((id: string) => getBatchDetails(id));
