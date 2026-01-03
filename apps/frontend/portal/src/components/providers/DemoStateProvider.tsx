'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { STORAGE_KEY } from '@/lib/constants';
import { BlockchainStatus } from '@/lib/api';

// Map of batchId -> Status
type DemoStateMap = Record<string, BlockchainStatus>;

interface DemoStateContextType {
    // Returns the custom client-side state for a batch, or undefined if not modified
    getBatchState: (batchId: string) => BlockchainStatus | undefined;
    updateBatchState: (batchId: string, updates: Partial<BlockchainStatus>) => void;
    // Clears state for a specific batch
    resetBatchState: (batchId: string) => void;
    // Clears ALL demo data
    clearAllDemoData: () => void;
    isInitialized: boolean;
}

const DemoStateContext = createContext<DemoStateContextType | undefined>(undefined);

export function DemoStateProvider({ children }: { children: ReactNode }) {
    const [stateMap, setStateMap] = useState<DemoStateMap>({});
    const [isInitialized, setIsInitialized] = useState(false);

    // Initial Load
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Simple validation: check if it looks like a map or old single object
                // If it has 'verified' key directly, it's the old format -> migrate or discard
                if (parsed.verified !== undefined) {
                    console.warn('Migrating old demo state format to map...');
                    // We don't know the ID of the old state, so we just discard it to be safe 
                    // or we could try to keep it if we knew the ID. Discarding is safer to fix bugs.
                    setStateMap({});
                } else {
                    setStateMap(parsed);
                }
            }
        } catch (e) {
            console.error('Failed to load demo state:', e);
        } finally {
            setIsInitialized(true);
        }
    }, []);

    const saveToStorage = (map: DemoStateMap) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
        } catch (e) {
            console.error('Failed to persist demo state:', e);
        }
    };

    const getBatchState = useCallback((batchId: string) => {
        return stateMap[batchId];
    }, [stateMap]);

    const updateBatchState = useCallback((batchId: string, updates: Partial<BlockchainStatus>) => {
        setStateMap(prev => {
            const current = prev[batchId] || {};
            // If it's a new entry, we might need default values? 
            // Usually updates are merging into existing, OR creating new valid state.
            // Consumers (BlockchainControls) provide full updates usually or we merge.

            const newStateEntry = { ...current, ...updates } as BlockchainStatus;

            const newMap = { ...prev, [batchId]: newStateEntry };
            saveToStorage(newMap);
            return newMap;
        });
    }, []);

    const resetBatchState = useCallback((batchId: string) => {
        setStateMap(prev => {
            const { [batchId]: _, ...rest } = prev;
            saveToStorage(rest);
            return rest;
        });
    }, []);

    const clearAllDemoData = useCallback(() => {
        setStateMap({});
        localStorage.removeItem(STORAGE_KEY);
        // Force reload to clear any lingering artifacts if needed, but react state update should handle it
        window.location.reload();
    }, []);

    return (
        <DemoStateContext.Provider value={{ getBatchState, updateBatchState, resetBatchState, clearAllDemoData, isInitialized }}>
            {children}
        </DemoStateContext.Provider>
    );
}

export function useDemoState() {
    const context = useContext(DemoStateContext);
    if (context === undefined) {
        throw new Error('useDemoState must be used within a DemoStateProvider');
    }
    return context;
}
