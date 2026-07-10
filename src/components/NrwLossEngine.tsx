import { Wrench, AlertTriangle, TrendingDown, Activity, CheckCircle2, Gauge, MapPin, Camera } from 'lucide-react';
import { useMizan } from '../data/store';
import { fmtNum } from '../lib/format';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function NrwLossEngine({ projectId }: { projectId: string }) {
  const { projects, workOrders, closeWorkOrder } = useMizan();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;

  const production = project.productionM3;
  const metered = project.meteredConsumptionM3;
  const loss = production - metered;
  const lossPct = project.lossRatePct;
  const exceedsThreshold = lossPct > 15;

  const pieData = [
    { name: 'استهلاك معدود', value: metered, fill: '#0bbac0' },
    { name: 'فاقد مائي', value: loss, fill: lossPct > 25 ? '#dc2626' : '#f59e0b' },
  ];

  const myWO = workOrders.filter((w) => w.projectId === projectId);
  const openWO = myWO.filter((w) => w.status !== 'closed');

  return (
    <div className="space-y-4">
      {/* Loss analysis */}
      <div className="card card-pad">
        <div className="mb-4 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600"><Activity className="h-5 w-5" /></div>
          <div>
            <h3 className="section-title">محرك تحليل الفاقد المائي (NRW)</h3>
            <p className="text-xs text-slate-500">مقارنة حجم الإنتاج بالاستهلاك المعدود</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Pie */}
          <div className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={3} stroke="none">
                  {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} formatter={(v) => `${fmtNum(Number(v))} م³`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className={`num text-3xl font-extrabold ${lossPct > 25 ? 'text-red-600' : lossPct > 15 ? 'text-amber-600' : 'text-emerald-600'}`}>{fmtNum(lossPct, 1)}%</div>
              <div className="text-xs font-semibold text-slate-500">نسبة الفاقد</div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-100 p-3">
              <div className="flex items-center justify-between"><span className="text-sm text-slate-600">إجمالي الإنتاج</span><span className="num font-bold text-slate-800">{fmtNum(production)} م³</span></div>
            </div>
            <div className="rounded-xl border border-slate-100 p-3">
              <div className="flex items-center justify-between"><span className="text-sm text-slate-600">الاستهلاك المعدود</span><span className="num font-bold text-aqua-700">{fmtNum(metered)} م³</span></div>
            </div>
            <div className={`rounded-xl border-2 p-3 ${exceedsThreshold ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700"><TrendingDown className="h-4 w-4" /> الفاقد المائي</span>
                <span className={`num font-extrabold ${exceedsThreshold ? 'text-amber-700' : 'text-emerald-700'}`}>{fmtNum(loss)} م³</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <div className="text-xs text-slate-500">الحد المسموح</div>
                <div className="num text-lg font-extrabold text-slate-700">15%</div>
              </div>
              <div className={`rounded-xl p-3 text-center ${exceedsThreshold ? 'bg-red-50' : 'bg-emerald-50'}`}>
                <div className={`text-xs ${exceedsThreshold ? 'text-red-600' : 'text-emerald-600'}`}>الحالة</div>
                <div className={`text-sm font-extrabold ${exceedsThreshold ? 'text-red-700' : 'text-emerald-700'}`}>{exceedsThreshold ? 'تجاوز الحد' : 'ضمن الحدود'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Auto work order alert */}
        {exceedsThreshold && (
          <div className="mt-4 animate-fade-in rounded-xl border-2 border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-100 text-red-600"><AlertTriangle className="h-5 w-5" /></div>
              <div className="flex-1">
                <h4 className="font-bold text-red-800">أمر صيانة آلي مولّد</h4>
                <p className="mt-1 text-sm text-red-700">
                  تجاوز الفاقد المائي حد 15% ({fmtNum(lossPct, 1)}%). تم توليد أمر صيانة آلي لكشف التسربات أو مسح الوصلات غير النظامية.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="chip bg-white text-red-700 border border-red-200"><Gauge className="h-3 w-3" /> الفاقد: {fmtNum(lossPct, 1)}%</span>
                  <span className="chip bg-white text-red-700 border border-red-200"><MapPin className="h-3 w-3" /> نطاق: {project.directorateName}</span>
                  <span className="chip bg-white text-red-700 border border-red-200"><Camera className="h-3 w-3" /> يتطلب مسح ميداني</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Work orders list */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 p-4">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600"><Wrench className="h-5 w-5" /></div>
          <div className="flex-1">
            <h3 className="section-title">أوامر الصيانة الآلية</h3>
            <p className="text-xs text-slate-500">{openWO.length} مفتوح • {myWO.length - openWO.length} مغلق</p>
          </div>
        </div>
        {myWO.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">لا توجد أوامر صيانة - الفاقد ضمن الحدود المسموحة.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myWO.map((w) => (
              <div key={w.id} className="flex items-start gap-3 p-4">
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${w.status === 'closed' ? 'bg-slate-100 text-slate-400' : w.type === 'illegal_connection' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                  <Wrench className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{w.description}</span>
                    {w.status === 'closed' && <span className="chip bg-slate-100 text-slate-500"><CheckCircle2 className="h-3 w-3" /> مغلق</span>}
                    {w.status === 'open' && <span className="chip bg-red-50 text-red-700 border border-red-200">مفتوح</span>}
                    {w.status === 'in_progress' && <span className="chip bg-brand-50 text-brand-700 border border-brand-200">قيد التنفيذ</span>}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">الفاقد عند التوليد: <span className="num font-semibold">{fmtNum(w.lossPct, 1)}%</span></div>
                </div>
                {w.status !== 'closed' && (
                  <button onClick={() => closeWorkOrder(w.id)} className="btn-ghost px-3 py-1.5 text-xs"><CheckCircle2 className="h-3.5 w-3.5" /> إغلاق</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
