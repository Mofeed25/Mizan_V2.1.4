import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  trend?: number; // +/- percentage
  accent?: 'brand' | 'aqua' | 'emerald' | 'amber' | 'red' | 'slate';
}

const accents = {
  brand: 'from-brand-500 to-brand-600 text-brand-600 bg-brand-50',
  aqua: 'from-aqua-500 to-aqua-600 text-aqua-600 bg-aqua-50',
  emerald: 'from-emerald-500 to-emerald-600 text-emerald-600 bg-emerald-50',
  amber: 'from-amber-500 to-amber-600 text-amber-600 bg-amber-50',
  red: 'from-red-500 to-red-600 text-red-600 bg-red-50',
  slate: 'from-slate-500 to-slate-600 text-slate-600 bg-slate-50',
};

export function StatCard({ icon, label, value, sub, trend, accent = 'brand' }: StatCardProps) {
  const a = accents[accent];
  return (
    <div className="card card-pad relative overflow-hidden transition-shadow hover:shadow-cardlg">
      <div className={`absolute -left-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${a.split(' ')[0]} ${a.split(' ')[1]} opacity-10`} />
      <div className="relative flex items-start justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${a.split(' ')[3]} ${a.split(' ')[4]}`}>
          {icon}
        </div>
        {typeof trend === 'number' && (
          <span className={`chip ${trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span className="num">{Math.abs(trend)}%</span>
          </span>
        )}
      </div>
      <div className="relative mt-3">
        <div className="text-2xl font-extrabold tracking-tight text-slate-900 num">{value}</div>
        <div className="mt-0.5 text-sm font-semibold text-slate-600">{label}</div>
        {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
      </div>
    </div>
  );
}
