import { Receipt, CheckCircle2, Clock, Wallet } from 'lucide-react';
import { useMizan } from '../data/store';
import { fmtNum, fmtYER } from '../lib/format';

export function BillingLogs({ projectId }: { projectId: string }) {
  const { billing } = useMizan();
  const mine = billing.filter((b) => b.projectId === projectId).sort((a, b) => b.period.localeCompare(a.period));
  const totalBilled = mine.reduce((s, b) => s + b.amountYER, 0);
  const totalCollected = mine.filter((b) => b.paid).reduce((s, b) => s + b.amountYER, 0);
  const collectionRate = totalBilled ? Math.round((totalCollected / totalBilled) * 100) : 0;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-100 p-4">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600"><Receipt className="h-5 w-5" /></div>
        <div className="flex-1">
          <h3 className="section-title">سجل الفوترة والتحصيل</h3>
          <p className="text-xs text-slate-500">فواتير المياه الشهرية وحالة السداد</p>
        </div>
        <div className="text-left">
          <div className={`num text-lg font-extrabold ${collectionRate >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>{collectionRate}%</div>
          <div className="text-xs text-slate-400">نسبة التحصيل</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 border-b border-slate-100 p-4">
        <div className="rounded-xl bg-slate-50 p-3"><div className="text-xs text-slate-500">إجمالي الفواتير</div><div className="num mt-1 text-lg font-extrabold text-slate-800">{fmtYER(totalBilled)}</div></div>
        <div className="rounded-xl bg-emerald-50 p-3"><div className="flex items-center gap-1 text-xs text-emerald-600"><Wallet className="h-3 w-3" /> المحصّل</div><div className="num mt-1 text-lg font-extrabold text-emerald-700">{fmtYER(totalCollected)}</div></div>
        <div className="rounded-xl bg-amber-50 p-3"><div className="flex items-center gap-1 text-xs text-amber-600"><Clock className="h-3 w-3" /> المتبقي</div><div className="num mt-1 text-lg font-extrabold text-amber-700">{fmtYER(totalBilled - totalCollected)}</div></div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        <table className="w-full text-right text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2.5 font-semibold">المشترك</th>
              <th className="px-4 py-2.5 font-semibold">الفترة</th>
              <th className="px-4 py-2.5 font-semibold">الاستهلاك</th>
              <th className="px-4 py-2.5 font-semibold">المبلغ</th>
              <th className="px-4 py-2.5 font-semibold">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mine.slice(0, 30).map((b) => (
              <tr key={b.id} className="transition-colors hover:bg-slate-50/60">
                <td className="px-4 py-2.5 font-semibold text-slate-700">{b.subscriberName}</td>
                <td className="px-4 py-2.5 num text-slate-500">{b.period}</td>
                <td className="px-4 py-2.5 num text-slate-600">{fmtNum(b.consumptionM3)} م³</td>
                <td className="px-4 py-2.5 num font-semibold text-slate-700">{fmtYER(b.amountYER)} ريال</td>
                <td className="px-4 py-2.5">
                  {b.paid
                    ? <span className="chip bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="h-3 w-3" /> مدفوع</span>
                    : <span className="chip bg-amber-50 text-amber-700 border border-amber-200"><Clock className="h-3 w-3" /> معلق</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
