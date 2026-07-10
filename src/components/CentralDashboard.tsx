import { Droplets, Users, Wrench, FileWarning, Gauge, TrendingDown, MapPin } from 'lucide-react';
import { useMizan } from '../data/store';
import { useFilteredProjects, computeAggregates } from '../lib/aggregations';
import { fmtNum } from '../lib/format';
import { StatCard } from './StatCard';
import { DashboardFilters } from './DashboardFilters';
import { ConflictTracker } from './ConflictTracker';
import { TransparencyMeter } from './TransparencyMeter';
import { ProjectBreakdown } from './ProjectBreakdown';
import { DashboardCharts } from './DashboardCharts';
import { SuperAdminActions } from './SuperAdminActions';
import { useState } from 'react';

export function CentralDashboard() {
  const [dirId, setDirId] = useState<string | 'all'>('all');
  const [pid, setPid] = useState<string | 'all'>('all');
  const { workOrders, directives, user } = useMizan();
  const projects = useFilteredProjects(dirId, pid);
  const agg = computeAggregates(projects);
  const openWO = workOrders.filter((w) => w.status !== 'closed' && (pid === 'all' || w.projectId === pid)).length;
  const newDir = directives.filter((d) => !d.acknowledged && (pid === 'all' || d.projectId === pid)).length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="h-6 w-6 text-brand-600" />
            <h2 className="text-xl font-extrabold text-slate-900">لوحة التحكم المركزية — محافظة تعز</h2>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            المنظور المركزي للمشرف العام — تجميع مشاريع المديريات الريفية في محافظة تعز
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-card border border-slate-200/70">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-600">{user?.displayName}</span>
          </div>
        </div>
      </div>

      <DashboardFilters directorateId={dirId} setDirectorateId={setDirId} projectId={pid} setProjectId={setPid} />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Droplets className="h-5 w-5" />} label="إجمالي الإنتاج الشهري" value={`${fmtNum(agg.totalProduction)} م³`} sub="كل مشاريع تعز الريفية" accent="brand" trend={3} />
        <StatCard icon={<TrendingDown className="h-5 w-5" />} label="نسبة الفاقد المائي" value={`${fmtNum(agg.lossPct, 1)}%`} sub={`${fmtNum(agg.totalLoss)} م³ فاقد`} accent={agg.lossPct > 20 ? 'red' : 'amber'} trend={-1} />
        <StatCard icon={<Users className="h-5 w-5" />} label="إجمالي المشتركين" value={fmtNum(agg.totalSubscribers)} sub={`${fmtNum(agg.totalHouseholds)} أسرة مخدومة`} accent="aqua" trend={2} />
        <StatCard icon={<Wrench className="h-5 w-5" />} label="أوامر صيانة مفتوحة" value={fmtNum(openWO)} sub={`${newDir} توجيه إداري جديد`} accent={openWO > 0 ? 'amber' : 'emerald'} />
      </div>

      {/* Conflict + Transparency */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ConflictTracker directorateId={dirId} projectId={pid} />
        <TransparencyMeter directorateId={dirId} projectId={pid} />
      </div>

      {/* Charts */}
      <DashboardCharts directorateId={dirId} projectId={pid} />

      {/* Project breakdown */}
      <ProjectBreakdown directorateId={dirId} projectId={pid} />

      {/* Super admin exclusive actions */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <FileWarning className="h-5 w-5 text-red-600" />
          <h3 className="text-base font-bold text-slate-800">إجراءات المشرف العام الحصرية</h3>
        </div>
        <SuperAdminActions />
      </div>
    </div>
  );
}
