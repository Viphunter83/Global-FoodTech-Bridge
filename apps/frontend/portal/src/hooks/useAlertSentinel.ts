'use client';

import { useEffect, useRef } from 'react';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { toast } from 'sonner';
import { getAlerts, getBatchDetails } from '@/lib/api';
import { useTranslations } from 'next-intl';

export function useAlertSentinel() {
    const { addNotification } = useNotifications();
    const t = useTranslations();
    const checkedAlerts = useRef<Set<string>>(new Set());
    const checkedServiceStatuses = useRef<Record<string, string>>({});

    useEffect(() => {
        const checkSystem = async () => {
            if (document.hidden) return; // Save resources if tab is background

            // 1. Check Batch Alerts (IoT/Compliance)
            const stored = localStorage.getItem('recent_batches');
            if (stored) {
                try {
                    const ids = JSON.parse(stored);
                    if (Array.isArray(ids)) {
                        for (const id of ids) {
                            const batchAlerts = await getAlerts(id);
                            if (batchAlerts && batchAlerts.length > 0) {
                                for (const alert of batchAlerts) {
                                    if (!checkedAlerts.current.has(alert.id)) {
                                        checkedAlerts.current.add(alert.id);
                                        
                                        // Trigger Toast
                                        toast.error(t('Compliance.violation_title'), {
                                            description: `${alert.message}`,
                                            duration: 10000,
                                        });

                                        // Store in global notification center
                                        addNotification({
                                            title: t('Compliance.violation_title'),
                                            message: alert.message,
                                            type: 'error',
                                            link: `/dashboard`
                                        });
                                    }
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error('Sentinel failed to check batch alerts', e);
                }
            }

            // 2. Check Infrastructure (Railway Proxy)
            try {
                const res = await fetch('/api/admin/infra');
                if (res.ok) {
                    const infra = await res.json();
                    infra.forEach((project: any) => {
                        project.services.forEach((service: any) => {
                            const prevStatus = checkedServiceStatuses.current[service.id];
                            const currentStatus = service.status.toUpperCase();

                            if (prevStatus && prevStatus !== currentStatus) {
                                if (currentStatus === 'CRASHED' || currentStatus === 'FAILED') {
                                    const infraAlertTitle = t('Notifications.infra_alert');
                                    const infraAlertDesc = t('Notifications.infra_service_changed', { name: service.name, status: currentStatus });

                                    toast.warning(infraAlertTitle, {
                                        description: infraAlertDesc,
                                    });

                                    addNotification({
                                        title: infraAlertTitle,
                                        message: infraAlertDesc,
                                        type: 'warning',
                                        link: '/admin/monitoring'
                                    });
                                }
                            }
                            checkedServiceStatuses.current[service.id] = currentStatus;
                        });
                    });
                }
            } catch (e) {
                console.error('Sentinel failed to check infra status via proxy', e);
            }
        };

        // Run immediately then poll
        checkSystem();
        const interval = setInterval(checkSystem, 30000); // 30s poll

        return () => clearInterval(interval);
    }, [addNotification, t]);
}
