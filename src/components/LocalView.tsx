import { useState } from 'react';
import { Users, Receipt, Gauge, Megaphone, Activity, Droplets, Building2 } from 'lucide-react';
import { useMizan } from '../data/store';
import { DirectivesAlerts } from './DirectivesAlerts';
import { SubscriberList } from './SubscriberList';
import { BillingLogs } from './BillingLogs';
import { ReadingCapture } from './ReadingCapture';
import { NrwLossEngine } from './NrwLossEngine';
import { fmtNum, gradeColor, riskMeta } from '../lib/format';

type Tab = 'overview' | 'subscribers' | 'billing' | 'readings' | 'nrw';

const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'overview', label: 'نظرة عامة', icon: Activity },
  { id: 'subscribers', label: 'المشتركون', icon: Users },
  { id: 'billing', label: 'الفوترة', icon: Receipt },
  { id: 'readings', label: 'القراءات', icon: Gauge },
  { id: 'nrw', label: 'الفاقد المائي', icon: Droplets },
];

export function LocalView() {
  const { activeProjectId, projects, directives, workOrders } = useMizan();
  const [tab, setTab] = useState<Tab>('overview');
  const project = projects.find((p) => p.id === activeProjectId);
  if (!project) return <div className="p-8 text-center text-slate-500">لا يوجد مشروع محدد. اختر مشروعاً من المبدل أعلاه.</div>;

  const myDirs = directives.filter((d) => d.projectId === project.id && !d.acknowledged);
  const myWO = workOrders.filter((w) => w.projectId === project.id && w.status !== 'closed');
  const m = riskMeta[project.conflictGrade];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      {/* Project header */}
      <div className="card card-pad mb-5 relative overflow-hidden">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-aqua-400 to-brand-500 opacity-10" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-aqua-500 to-brand-600 text-white shadow-glow"><Droplets className="h-6 w-6" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">{project.name}</h2>
                <span className={`chip border ${gradeColor(project.governanceGrade)} num text-base font-extrabold`}>{project.governanceGrade}</span>
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500"><Building2 className="h-3.5 w-3.5" /> مديرية {project.directorateName} • تأسس {project.establishedYear}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`chip border ${m.cls}`}><span className={`h-2 w-2 rounded-full ${m.dot}`} /> {m.label}</span>
            <span className="chip bg-slate-100 text-slate-600">فاقد <span className="num font-bold">{fmtNum(project.lossRatePct, 1)}%</span></span>
            <span className="chip bg-slate-100 text-slate-600">تعرفة <span className="num font-bold">{fmtNum(project.tariffPerM3)} ريال</span></span>
          </div>
        </div>
        <div className="relative mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Mini label="المشتركون" value={fmtNum(project.subscribersCount)} />
          <Mini label="الأسر المخدومة" value={fmtNum(project.households)} />
          <Mini label="الإنتاج الشهري" value={`${fmtNum(project.productionM3)} م³`} />
          <Mini label="القراءات الموثقة" value={`${fmtNum(project.verifiedReadingsPct)}%`} />
        </div>
      </div>

      {/* Directives alert (always visible if any) */}
      {myDirs.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-red-600" />
            <h3 className="text-base font-bold text-slate-800">التوجيهات والتعميمات الإدارية المركزية</h3>
            <span className="chip bg-red-50 text-red-700 border border-red-200 num">{myDirs.length} عاجل</span>
          </div>
          <DirectivesAlerts projectId={project.id} />
        </div>
      )}

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-card border border-slate-200/70">
        {tabs.map((t) => {
          const Icon = t.icon;
          const badge = t.id === 'nrw' && myWO.length > 0 ? myWO.length : t.id === 'overview' && myDirs.length > 0 ? myDirs.length : 0;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${tab === t.id ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Icon className="h-4 w-4" /> {t.label}
              {badge > 0 && <span className={`num absolute -top-1 -left-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold ${tab === t.id ? 'bg-white text-brand-700' : 'bg-red-500 text-white'}`}>{badge}</span>}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="space-y-5">
          {myDirs.length === 0 && <DirectivesAlerts projectId={project.id} />}
          <div className="grid gap-4 lg:grid-cols-2">
            <BillingLogs projectId={project.id} />
            <NrwLossEngine projectId={project.id} />
          </div>
        </div>
      )}
      {tab === 'subscribers' && <SubscriberList projectId={project.id} />}
      {tab === 'billing' && <BillingLogs projectId={project.id} />}
      {tab === 'readings' && <ReadingCapture projectId={project.id} />}
      {tab === 'nrw' && <NrwLossEngine projectId={project.id} />}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="num text-lg font-extrabold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
