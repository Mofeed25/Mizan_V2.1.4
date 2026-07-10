import { Table2, ArrowUpDown, Wrench, FileWarning } from 'lucide-react';
import { useMizan } from '../data/store';
import { useFilteredProjects } from '../lib/aggregations';
import { fmtNum, gradeColor, riskMeta } from '../lib/format';

interface Props {
  directorateId: string | 'all';
  projectId: string | 'all';
}

export function ProjectBreakdown({ directorateId, projectId }: Props) {
  const projects = useFilteredProjects(directorateId, projectId);
  const { workOrders, directives } = useMizan();

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Table2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="section-title">تفصيل المشاريع المستقلة</h3>
            <p className="text-xs text-slate-500">درجات الحوكمة ونسب الفاقد والامتثال المالي</p>
          </div>
        </div>
        <span className="text-xs text-slate-400">{projects.length} مشروع</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">المشروع</th>
              <th className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-1"><ArrowUpDown className="h-3 w-3" /> درجة الحوكمة</span></th>
              <th className="px-4 py-3 font-semibold">الفاقد المائي</th>
              <th className="px-4 py-3 font-semibold">الامتثال المالي</th>
              <th className="px-4 py-3 font-semibold">مؤشر النزاع</th>
              <th className="px-4 py-3 font-semibold">التعرفة</th>
              <th className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-1"><Wrench className="h-3 w-3" /> أوامر صيانة</span></th>
              <th className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-1"><FileWarning className="h-3 w-3" /> توجيهات</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((p) => {
              const woCount = workOrders.filter((w) => w.projectId === p.id && w.status !== 'closed').length;
              const dirCount = directives.filter((d) => d.projectId === p.id && !d.acknowledged).length;
              const m = riskMeta[p.conflictGrade];
              return (
                <tr key={p.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800">{p.name}</div>
                    <div className="text-xs text-slate-400">مديرية {p.directorateName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`chip border ${gradeColor(p.governanceGrade)} num text-base font-extrabold`}>{p.governanceGrade}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${p.lossRatePct > 25 ? 'bg-red-500' : p.lossRatePct > 15 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, p.lossRatePct * 2)}%` }} />
                      </div>
                      <span className="num font-semibold text-slate-700">{fmtNum(p.lossRatePct, 1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`num font-semibold ${p.collectedPct >= 85 ? 'text-emerald-600' : p.collectedPct >= 70 ? 'text-amber-600' : 'text-red-600'}`}>{fmtNum(p.collectedPct)}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`chip border ${m.cls}`}><span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />{m.label}</span>
                  </td>
                  <td className="px-4 py-3 num font-semibold text-slate-700">{fmtNum(p.tariffPerM3)} ريال</td>
                  <td className="px-4 py-3">
                    {woCount > 0 ? <span className="chip bg-amber-50 text-amber-700 border border-amber-200 num">{woCount} مفتوح</span> : <span className="text-xs text-slate-400">لا يوجد</span>}
                  </td>
                  <td className="px-4 py-3">
                    {dirCount > 0 ? <span className="chip bg-red-50 text-red-700 border border-red-200 num">{dirCount} جديد</span> : <span className="text-xs text-slate-400">لا يوجد</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
