import { Megaphone, Info, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useMizan } from '../data/store';
import { fmtDate } from '../lib/format';

const sevMeta = {
  info: { icon: Info, cls: 'bg-slate-50 border-slate-200 text-slate-700', badge: 'bg-slate-100 text-slate-600' },
  warning: { icon: AlertTriangle, cls: 'bg-amber-50 border-amber-200 text-amber-800', badge: 'bg-amber-100 text-amber-700' },
  critical: { icon: ShieldAlert, cls: 'bg-red-50 border-red-200 text-red-800', badge: 'bg-red-100 text-red-700' },
};

export function DirectivesAlerts({ projectId }: { projectId: string }) {
  const { directives, acknowledgeDirective } = useMizan();
  const mine = directives.filter((d) => d.projectId === projectId);
  const urgent = mine.filter((d) => !d.acknowledged);

  if (mine.length === 0) {
    return (
      <div className="card card-pad text-center">
        <Megaphone className="mx-auto mb-2 h-8 w-8 text-slate-300" />
        <p className="text-sm text-slate-500">لا توجد توجيهات إدارية مركزية لهذا المشروع حالياً.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {urgent.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700 border border-red-200">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          لديك {urgent.length} توجيه إداري عاجل يتطلب إجراءً
        </div>
      )}
      {mine.map((d) => {
        const s = sevMeta[d.severity];
        const Icon = s.icon;
        return (
          <div key={d.id} className={`card animate-slide-in border-2 ${s.cls} ${d.acknowledged ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-3 p-4">
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${s.badge}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold">{d.title}</h4>
                  <span className={`chip ${s.badge}`}>{d.severity === 'critical' ? 'حرج' : d.severity === 'warning' ? 'تحذير' : 'إشعار'}</span>
                  {d.acknowledged && <span className="chip bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-3 w-3" /> تم الإقرار</span>}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed opacity-90">{d.body}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{fmtDate(d.createdAt)}</span>
                  {!d.acknowledged && (
                    <button
                      onClick={() => acknowledgeDirective(d.id)}
                      className="btn-ghost text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> إقرار الاستلام
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
