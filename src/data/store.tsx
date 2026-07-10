import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ACCOUNTS,
  DIRECTORATES,
  SEED_PROJECTS,
  recomputeProject,
  seedBilling,
  seedDirectives,
  seedReadings,
  seedSubscribers,
  seedWorkOrders,
  type BillingLog,
  type Directive,
  type Directorate,
  type Reading,
  type Role,
  type Subscriber,
  type SyncStatus,
  type UserAccount,
  type WaterProject,
  type WorkOrder,
} from './types';

const LS_KEY = 'mizan_state_v2';
const LS_SESSION = 'mizan_session_v1';

interface PersistShape {
  projects: WaterProject[];
  subscribers: Subscriber[];
  readings: Reading[];
  billing: BillingLog[];
  directives: Directive[];
  workOrders: WorkOrder[];
}

function loadState(): PersistShape {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistShape;
      if (parsed.projects && parsed.projects.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  const projects = SEED_PROJECTS.map(recomputeProject);
  const subscribers = seedSubscribers(projects);
  const billing = seedBilling(projects, subscribers);
  const readings = seedReadings(subscribers);
  const directives = seedDirectives(projects);
  const workOrders = seedWorkOrders(projects);
  return { projects, subscribers, readings, billing, directives, workOrders };
}

function loadSession(): UserAccount | null {
  try {
    const raw = sessionStorage.getItem(LS_SESSION);
    if (raw) return JSON.parse(raw) as UserAccount;
  } catch {
    /* ignore */
  }
  return null;
}

interface MizanContextValue {
  user: UserAccount | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  role: Role;
  activeProjectId: string | null;
  directorates: Directorate[];
  // Session-scoped data (filtered for local tenants, full for super)
  projects: WaterProject[];
  subscribers: Subscriber[];
  readings: Reading[];
  billing: BillingLog[];
  directives: Directive[];
  workOrders: WorkOrder[];
  online: boolean;
  setOnline: (v: boolean) => void;
  addProject: (name: string, directorateId: string) => void;
  addSubscriber: (s: Omit<Subscriber, 'id'>) => void;
  addReading: (r: Omit<Reading, 'id' | 'syncStatus' | 'retries'>) => void;
  retryReading: (id: string) => void;
  addDirective: (d: Omit<Directive, 'id' | 'createdAt' | 'acknowledged'>) => void;
  acknowledgeDirective: (id: string) => void;
  closeWorkOrder: (id: string) => void;
  resetData: () => void;
}

const MizanContext = createContext<MizanContextValue | null>(null);

export function MizanProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistShape>(loadState);
  const [user, setUser] = useState<UserAccount | null>(loadSession);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  useEffect(() => {
    try {
      if (user) sessionStorage.setItem(LS_SESSION, JSON.stringify(user));
      else sessionStorage.removeItem(LS_SESSION);
    } catch {
      /* ignore */
    }
  }, [user]);

  // Auto-sync pending readings when online
  useEffect(() => {
    if (!online) return;
    const t = setTimeout(() => {
      setState((s) => {
        const hasPending = s.readings.some((r) => r.syncStatus !== 'synced');
        if (!hasPending) return s;
        return {
          ...s,
          readings: s.readings.map((r) =>
            r.syncStatus === 'synced' ? r : { ...r, syncStatus: 'synced' as SyncStatus, retries: r.retries + (r.syncStatus === 'retrying' ? 1 : 0) },
          ),
        };
      });
    }, 1800);
    return () => clearTimeout(t);
  }, [online, state.readings]);

  const role: Role = user?.role ?? 'super';
  const activeProjectId = user?.projectId ?? null;

  // Session-scoped data: local tenants only see their own project's data
  const scopedProjects = useMemo(() => {
    if (!user) return state.projects;
    if (user.role === 'super') return state.projects;
    return state.projects.filter((p) => p.id === user.projectId);
  }, [state.projects, user]);

  const scopedSubscribers = useMemo(() => {
    if (!user) return state.subscribers;
    if (user.role === 'super') return state.subscribers;
    return state.subscribers.filter((s) => s.projectId === user.projectId);
  }, [state.subscribers, user]);

  const scopedReadings = useMemo(() => {
    if (!user) return state.readings;
    if (user.role === 'super') return state.readings;
    return state.readings.filter((r) => r.projectId === user.projectId);
  }, [state.readings, user]);

  const scopedBilling = useMemo(() => {
    if (!user) return state.billing;
    if (user.role === 'super') return state.billing;
    return state.billing.filter((b) => b.projectId === user.projectId);
  }, [state.billing, user]);

  const scopedDirectives = useMemo(() => {
    if (!user) return state.directives;
    if (user.role === 'super') return state.directives;
    return state.directives.filter((d) => d.projectId === user.projectId);
  }, [state.directives, user]);

  const scopedWorkOrders = useMemo(() => {
    if (!user) return state.workOrders;
    if (user.role === 'super') return state.workOrders;
    return state.workOrders.filter((w) => w.projectId === user.projectId);
  }, [state.workOrders, user]);

  const value = useMemo<MizanContextValue>(() => {
    const login: MizanContextValue['login'] = (username, password) => {
      const acct = ACCOUNTS.find((a) => a.username === username.trim() && a.password === password);
      if (acct) {
        setUser(acct);
        return true;
      }
      return false;
    };

    const logout: MizanContextValue['logout'] = () => {
      setUser(null);
    };

    const addProject: MizanContextValue['addProject'] = (name, directorateId) => {
      const dir = DIRECTORATES.find((d) => d.id === directorateId);
      const dirName = dir?.name ?? 'غير محدد';
      const id = `p-${Date.now().toString(36)}`;
      const base: WaterProject = {
        id,
        name,
        directorateId,
        directorateName: dirName,
        establishedYear: 2026,
        households: 0,
        productionM3: 0,
        meteredConsumptionM3: 0,
        tariffPerM3: 1000,
        subscribersCount: 0,
        verifiedReadingsPct: 0,
        collectedPct: 0,
        governanceGrade: 'F',
        conflictGrade: 'stable',
        lossRatePct: 0,
        lastSync: new Date().toISOString(),
      };
      setState((s) => ({ ...s, projects: [...s.projects, recomputeProject(base)] }));
    };

    const addSubscriber: MizanContextValue['addSubscriber'] = (s) => {
      const sub: Subscriber = { ...s, id: `s-${Date.now().toString(36)}` };
      setState((prev) => ({
        ...prev,
        subscribers: [sub, ...prev.subscribers],
        projects: prev.projects.map((p) =>
          p.id === s.projectId ? { ...p, subscribersCount: p.subscribersCount + 1 } : p,
        ),
      }));
    };

    const addReading: MizanContextValue['addReading'] = (r) => {
      const reading: Reading = {
        ...r,
        id: `r-${Date.now().toString(36)}`,
        syncStatus: online ? 'synced' : 'pending',
        retries: 0,
      };
      setState((prev) => {
        const project = prev.projects.find((p) => p.id === r.projectId);
        const delta = r.readingM3 - r.previousM3;
        const updatedProjects = prev.projects.map((p) =>
          p.id === r.projectId
            ? recomputeProject({
                ...p,
                meteredConsumptionM3: p.meteredConsumptionM3 + Math.max(0, delta),
                verifiedReadingsPct: Math.min(100, p.verifiedReadingsPct + (r.hasPhoto ? 1 : 0)),
              })
            : p,
        );
        const updatedProj = updatedProjects.find((p) => p.id === r.projectId);
        const shouldCreateWO =
          updatedProj &&
          updatedProj.lossRatePct > 15 &&
          !prev.workOrders.some((w) => w.projectId === r.projectId && w.status !== 'closed');
        return {
          ...prev,
          readings: [reading, ...prev.readings],
          projects: updatedProjects,
          workOrders: shouldCreateWO && project
            ? [
                {
                  id: `wo-${Date.now().toString(36)}`,
                  projectId: r.projectId,
                  projectName: project.name,
                  type: 'leak',
                  description: 'أمر صيانة آلي: تجاوز الفاقد المائي 15% بعد تحديث القراءة',
                  lossPct: updatedProj!.lossRatePct,
                  createdAt: new Date().toISOString(),
                  status: 'open',
                },
                ...prev.workOrders,
              ]
            : prev.workOrders,
        };
      });
    };

    const retryReading: MizanContextValue['retryReading'] = (id) => {
      setState((prev) => ({
        ...prev,
        readings: prev.readings.map((r) =>
          r.id === id ? { ...r, syncStatus: 'retrying', retries: r.retries + 1 } : r,
        ),
      }));
    };

    const addDirective: MizanContextValue['addDirective'] = (d) => {
      const dir: Directive = {
        ...d,
        id: `dir-${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
        acknowledged: false,
      };
      setState((prev) => ({ ...prev, directives: [dir, ...prev.directives] }));
    };

    const acknowledgeDirective: MizanContextValue['acknowledgeDirective'] = (id) => {
      setState((prev) => ({
        ...prev,
        directives: prev.directives.map((d) => (d.id === id ? { ...d, acknowledged: true } : d)),
      }));
    };

    const closeWorkOrder: MizanContextValue['closeWorkOrder'] = (id) => {
      setState((prev) => ({
        ...prev,
        workOrders: prev.workOrders.map((w) => (w.id === id ? { ...w, status: 'closed' } : w)),
      }));
    };

    const resetData = () => {
      localStorage.removeItem(LS_KEY);
      const fresh = loadState();
      setState(fresh);
    };

    return {
      user,
      login,
      logout,
      role,
      activeProjectId,
      directorates: DIRECTORATES,
      projects: scopedProjects,
      subscribers: scopedSubscribers,
      readings: scopedReadings,
      billing: scopedBilling,
      directives: scopedDirectives,
      workOrders: scopedWorkOrders,
      online,
      setOnline,
      addProject,
      addSubscriber,
      addReading,
      retryReading,
      addDirective,
      acknowledgeDirective,
      closeWorkOrder,
      resetData,
    };
  }, [state, user, online, role, activeProjectId, scopedProjects, scopedSubscribers, scopedReadings, scopedBilling, scopedDirectives, scopedWorkOrders]);

  return <MizanContext.Provider value={value}>{children}</MizanContext.Provider>;
}

export function useMizan() {
  const ctx = useContext(MizanContext);
  if (!ctx) throw new Error('useMizan must be used within MizanProvider');
  return ctx;
}
