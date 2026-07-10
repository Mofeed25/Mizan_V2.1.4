import { ShieldAlert, Scale, Droplet, Coins } from 'lucide-react';
import { useFilteredProjects, computeAggregates } from '../lib/aggregations';
import { riskMeta, fmtNum } from '../lib/format';
import type { RiskGrade } from '../data/types';

interface Props {
  directorateId: string | 'all';
  projectId: string | 'all';
}

function riskScore(loss: number, tariffVar: number): number {
  // 0 stable .. 100 high
  const s = Math.min(100, Math.max(0, loss * 2.2 + tariffVar * 0.04));
  return Math.round(s);
}

function gradeFromScore(score: number): RiskGrade {
  if (score >= 65) return 'high';
  if (score >= 38) return 'med';
  return 'stable';
}

export function ConflictTracker({ directorateId, projectId }: Props) {
  const projects = useFilteredProjects(directorateId, projectId);
  const agg = computeAggregates(projects);
  const overall = riskScore(agg.lossPct, agg.tariffVariance);
  const overallGrade = gradeFromScore(overall);
  const meta = riskMeta[overallGrade];

  const rows = projects.map((p) => {
    const score = riskScore(p.lossRatePct, Math.abs(p.tariffPerM3 - agg.avgTariff));
    return { p, score, grade: gradeFromScore(score) };
  });

  return (
    <div className="card card-pad">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-red-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="section-title">مؤشر الحد من النزاعات المائية</h3>
            <p className="text-xs text-slate-500">يحسب ندرة المياه وتباين التعرفة لتصنيف المناطق</p>
          </div>
        </div>
        <span className={`chip border ${meta.cls}`}>
          <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      {/* Overall gauge */}
      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">مؤشر الخطر الإجمالي</span>
          <span className="num font-bold text-slate-800">{overall}/100</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${meta.bar} transition-all duration-700`}
            style={{ width: `${overall}%` }}
          />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-emerald-50 py-1.5 font-semibold text-emerald-700">
            مستقر <span className="num block text-lg font-extrabold">{agg.stableCount}</span>
          </div>
          <div className="rounded-lg bg-amber-50 py-1.5 font-semibold text-amber-700">
            متوسط <span className="num block text-lg font-extrabold">{agg.medRiskCount}</span>
          </div>
          <div className="rounded-lg bg-red-50 py-1.5 font-semibold text-red-700">
            مرتفع <span className="num block text-lg font-extrabold">{agg.highRiskCount}</span>
          </div>
        </div>
      </div>

      {/* Drivers */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Driver icon={<Droplet className="h-4 w-4" />} label="نسبة الفاقد" value={`${fmtNum(agg.lossPct, 1)}%`} tone="red" />
        <Driver icon={<Scale className="h-4 w-4" />} label="تباين التعرفة" value={`${fmtNum(agg.tariffVariance, 0)} ريال`} tone="amber" />
        <Driver icon={<Droplet className="h-4 w-4" />} label="الإنتاج الكلي" value={`${fmtNum(agg.totalProduction)} م³`} tone="brand" />
        <Driver icon={<Coins className="h-4 w-4" />} label="متوسط التعرفة" value={`${fmtNum(agg.avgTariff, 0)} ريال`} tone="aqua" />
      </div>

      {/* Per-project bars */}
      <div className="space-y-2.5">
        {rows.map(({ p, score, grade }) => {
          const m = riskMeta[grade];
          return (
            <div key={p.id} className="rounded-xl border border-slate-100 p-3">
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700 truncate">{p.name}</span>
                <span className={`chip border ${m.cls} shrink-0`}>{m.label}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${m.bar} transition-all duration-700`} style={{ width: `${score}%` }} />
              </div>
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>فاقد <span className="num font-semibold text-slate-600">{fmtNum(p.lossRatePct, 1)}%</span></span>
                <span>تعرفة <span className="num font-semibold text-slate-600">{fmtNum(p.tariffPerM3)} ريال</span></span>
                <span className="num font-bold text-slate-700">{score}/100</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Driver({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'red' | 'amber' | 'brand' | 'aqua' }) {
  const tones = {
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    brand: 'bg-brand-50 text-brand-600',
    aqua: 'bg-aqua-50 text-aqua-600',
  };
  return (
    <div className="rounded-xl border border-slate-100 p-2.5">
      <div className={`mb-1.5 grid h-7 w-7 place-items-center rounded-lg ${tones[tone]}`}>{icon}</div>
      <div className="num text-sm font-extrabold text-slate-800">{value}</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  );
}
