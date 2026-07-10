import { useMizan } from '../data/store';
import type { WaterProject } from '../data/types';

export interface Aggregates {
  totalProduction: number;
  totalMetered: number;
  totalLoss: number;
  lossPct: number;
  avgTariff: number;
  tariffVariance: number;
  totalSubscribers: number;
  totalHouseholds: number;
  avgVerified: number;
  avgCollected: number;
  highRiskCount: number;
  medRiskCount: number;
  stableCount: number;
  openWorkOrders: number;
  unacknowledgedDirectives: number;
}

export function useFilteredProjects(directorateId: string | 'all', projectId: string | 'all'): WaterProject[] {
  const { projects } = useMizan();
  return projects.filter((p) => {
    if (projectId !== 'all') return p.id === projectId;
    if (directorateId !== 'all') return p.directorateId === directorateId;
    return true;
  });
}

export function computeAggregates(projects: WaterProject[]): Aggregates {
  const n = projects.length || 1;
  const totalProduction = projects.reduce((s, p) => s + p.productionM3, 0);
  const totalMetered = projects.reduce((s, p) => s + p.meteredConsumptionM3, 0);
  const totalLoss = totalProduction - totalMetered;
  const tariffs = projects.map((p) => p.tariffPerM3);
  const avgTariff = tariffs.reduce((s, t) => s + t, 0) / n;
  const tariffVariance = Math.sqrt(tariffs.reduce((s, t) => s + (t - avgTariff) ** 2, 0) / n);
  return {
    totalProduction,
    totalMetered,
    totalLoss,
    lossPct: totalProduction ? (totalLoss / totalProduction) * 100 : 0,
    avgTariff,
    tariffVariance,
    totalSubscribers: projects.reduce((s, p) => s + p.subscribersCount, 0),
    totalHouseholds: projects.reduce((s, p) => s + p.households, 0),
    avgVerified: projects.reduce((s, p) => s + p.verifiedReadingsPct, 0) / n,
    avgCollected: projects.reduce((s, p) => s + p.collectedPct, 0) / n,
    highRiskCount: projects.filter((p) => p.conflictGrade === 'high').length,
    medRiskCount: projects.filter((p) => p.conflictGrade === 'med').length,
    stableCount: projects.filter((p) => p.conflictGrade === 'stable').length,
    openWorkOrders: 0,
    unacknowledgedDirectives: 0,
  };
}
