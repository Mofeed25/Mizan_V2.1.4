import { BadgeCheck, Camera, MapPin, ShieldCheck } from 'lucide-react';
import { useFilteredProjects, computeAggregates } from '../lib/aggregations';
import { fmtNum } from '../lib/format';

interface Props {
  directorateId: string | 'all';
  projectId: string | 'all';
}

export function TransparencyMeter({ directorateId, projectId }: Props) {
  const projects = useFilteredProjects(directorateId, projectId);
  const agg = computeAggregates(projects);
  const verifiedPct = Math.round(agg.avgVerified);
  const collectedPct = Math.round(agg.avgCollected);

  // Circular progress
  const R = 52;
  const C = 2 * Math.PI * R;
  const offset = C - (verifiedPct / 100) * C;

  return (
    <div className="card card-pad">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="section-title">عداد الشفافية والمساءلة</h3>
          <p className="text-xs text-slate-500">نسبة القراءات الموثقة ميدانياً (GPS + إثبات صورة)</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        {/* Ring */}
        <div className="relative grid place-items-center">
          <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
            <circle cx="70" cy="70" r={R} fill="none" stroke="#eef2f7" strokeWidth="12" />
            <circle
              cx="70" cy="70" r={R} fill="none" stroke="url(#gradVerify)" strokeWidth="12"
              strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradVerify" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#0bbac0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute text-center">
            <div className="num text-3xl font-extrabold text-slate-900">{verifiedPct}%</div>
            <div className="text-[11px] font-semibold text-slate-500">موثق ميدانياً</div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <VerifyRow icon={<MapPin className="h-4 w-4" />} label="إثبات الموقع (GPS)" value={verifiedPct} tone="emerald" />
          <VerifyRow icon={<Camera className="h-4 w-4" />} label="إثبات عداد بالصورة" value={Math.max(0, verifiedPct - 6)} tone="aqua" />
          <VerifyRow icon={<BadgeCheck className="h-4 w-4" />} label="الالتزام المالي (التحصيل)" value={collectedPct} tone="brand" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-center sm:grid-cols-4">
        <Mini label="إجمالي المشتركين" value={fmtNum(agg.totalSubscribers)} />
        <Mini label="الأسر المخدومة" value={fmtNum(agg.totalHouseholds)} />
        <Mini label="الاستهلاك المعدود" value={`${fmtNum(agg.totalMetered)} م³`} />
        <Mini label="الفاقد الكلي" value={`${fmtNum(agg.totalLoss)} م³`} />
      </div>
    </div>
  );
}

function VerifyRow({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: 'emerald' | 'aqua' | 'brand' }) {
  const tones = { emerald: 'bg-emerald-500', aqua: 'bg-aqua-500', brand: 'bg-brand-500' };
  const iconTones = { emerald: 'bg-emerald-50 text-emerald-600', aqua: 'bg-aqua-50 text-aqua-600', brand: 'bg-brand-50 text-brand-600' };
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-slate-600">
          <span className={`grid h-6 w-6 place-items-center rounded-lg ${iconTones[tone]}`}>{icon}</span>
          {label}
        </span>
        <span className="num font-bold text-slate-800">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tones[tone]} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="num text-sm font-extrabold text-slate-800">{value}</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  );
}
