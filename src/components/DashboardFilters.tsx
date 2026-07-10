import { Filter, MapPin, Droplets, BarChart3 } from 'lucide-react';
import { useMizan } from '../data/store';

interface Props {
  directorateId: string | 'all';
  setDirectorateId: (v: string | 'all') => void;
  projectId: string | 'all';
  setProjectId: (v: string | 'all') => void;
}

export function DashboardFilters({ directorateId, setDirectorateId, projectId, setProjectId }: Props) {
  const { directorates, projects } = useMizan();
  const filteredProjects = directorateId === 'all' ? projects : projects.filter((p) => p.directorateId === directorateId);

  return (
    <div className="card card-pad">
      <div className="mb-3 flex items-center gap-2">
        <Filter className="h-4 w-4 text-brand-600" />
        <h2 className="section-title">عوامل تصفية لوحة التحكم</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="label flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> المديرية</label>
          <select
            className="input"
            value={directorateId}
            onChange={(e) => { setDirectorateId(e.target.value); setProjectId('all'); }}
          >
            <option value="all">كل المديريات</option>
            {directorates.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label flex items-center gap-1.5"><Droplets className="h-3.5 w-3.5" /> مشروع المياه</label>
          <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="all">كل المشاريع</option>
            {filteredProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <div className="flex w-full items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
            <BarChart3 className="h-4 w-4 text-brand-600" />
            <span>عدد المشاريع المعروضة: <span className="num font-bold text-slate-800">{filteredProjects.length}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
