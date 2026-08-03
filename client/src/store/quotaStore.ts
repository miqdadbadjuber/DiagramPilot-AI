"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuotaState {
  totalQuota: number;
  remainingQuota: number;
  usedQuota: number;
  lastResetDate: string; // YYYY-MM-DD
  
  // Actions
  consumeQuota: () => boolean;
  checkAndResetQuota: () => void;
}

export const useQuotaStore = create<QuotaState>()(
  persist(
    (set, get) => ({
      totalQuota: 100,
      remainingQuota: 100,
      usedQuota: 0,
      lastResetDate: new Date().toLocaleDateString('en-CA'), // current date in YYYY-MM-DD
      
      consumeQuota: () => {
        get().checkAndResetQuota();
        const { remainingQuota, usedQuota } = get();
        
        if (remainingQuota > 0) {
          set({
            remainingQuota: remainingQuota - 1,
            usedQuota: usedQuota + 1,
          });
          return true; // Successfully consumed
        }
        return false; // Quota empty
      },
      
      checkAndResetQuota: () => {
        const today = new Date().toLocaleDateString('en-CA');
        const { lastResetDate, totalQuota } = get();
        
        // If the date has changed, reset the quota
        if (lastResetDate !== today) {
          set({
            remainingQuota: totalQuota,
            usedQuota: 0,
            lastResetDate: today,
          });
        }
      }
    }),
    {
      name: 'diagramPilotQuota',
    }
  )
);
