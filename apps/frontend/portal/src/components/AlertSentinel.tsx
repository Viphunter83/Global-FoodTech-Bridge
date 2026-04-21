'use client';

import { useAlertSentinel } from "@/hooks/useAlertSentinel";

export function AlertSentinel() {
    useAlertSentinel();
    return null; // This component is logic-only
}
