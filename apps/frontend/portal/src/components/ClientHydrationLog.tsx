'use client';

import { useEffect } from 'react';

/**
 * A silent component that just logs to the console when hydrated.
 * This helps us confirm that the client-side JavaScript is actually running.
 */
export function ClientHydrationLog() {
    useEffect(() => {
        console.log("%c [GFTB-HYDRATION] Client-side React has successfully initialized.", "color: #3b82f6; font-weight: bold; font-size: 14px;");
        
        // Log additional info
        console.log("[GFTB-HYDRATION] Pathname:", window.location.pathname);
        console.log("[GFTB-HYDRATION] UserAgent:", navigator.userAgent);
    }, []);

    return null;
}
