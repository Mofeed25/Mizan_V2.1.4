import { useState } from 'react';
import { UserPlus, Search, Users, Wallet, AlertCircle, X } from 'lucide-react';
import { useMizan } from '../data/store';
import { fmtNum, fmtYER } from '../lib/format';
import type { Subscriber } from '../data/types';

const statusMeta = {
  active: { label: 'نشط', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  arrears: { label: 'متأخر', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  disconnected: { label: 'مقطوع', cls: 'bg-red-50 text-red-700 border-red-200' },
};

export function SubscriberList({ projectId }: { projectId: string }) {
  const { subscribers, addSubscriber } = useMizan();
  const [q, setQ] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const mine = subscribers.filter((s) => s.projectId === projectId);
  const filtered = mine.filter((s) => s.name.includes(q) || s.meterSerial.includes(q) || s.zone.includes(q));

  const totalBalance = mine.reduce((sum, s) => sum + s.balanceYER, 0);
  const arrearsCount = mine.filter((s) => s.status !== 'active').length;

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-aqua-50 text-aqua-600"><Users className="h-5 w-5" /></div>
          <div>
            <h3 className="section-title">قائمة المشتركين المحليين</h3>
            <p className="text-xs text-slate-500">{mine.length} مشترك • {arrearsCount} متأخر</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input w-48 pr-9" placeholder="بحث بالاسم أو العداد..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary"><UserPlus className="h-4 w-4" /> مشترك جديد</button>
        </div>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-3 border-b border-slate-100 p-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><Users className="h-3.5 w-3.5" /> إجمالي المشتركين</div>
          <div className="num mt-1 text-xl font-extrabold text-slate-800">{fmtNum(mine.length)}</div>
        </div>
        <div className="rounded-xl bg-amber-50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-amber-600"><AlertCircle className="h-3.5 w-3.5" /> متأخرات السداد</div>
          <div className="num mt-1 text-xl font-extrabold text-amber-700">{fmtNum(arrearsCount)}</div>
        </div>
        <div className="rounded-xl bg-red-50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-red-600"><Wallet className="h-3.5 w-3.5" /> إجمالي الرصيد المستحق</div>
          <div className="num mt-1 text-xl font-extrabold text-red-700">{fmtYER(totalBalance)} ريال</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">المشترك</th>
              <th className="px-4 py-3 font-semibold">المنطقة</th>
              <th className="px-4 py-3 font-semibold">رقم العداد</th>
              <th className="px-4 py-3 font-semibold">أفراد الأسرة</th>
              <th className="px-4 py-3 font-semibold">الرصيد المستحق</th>
              <th className="px-4 py-3 font-semibold">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((s) => {
              const st = statusMeta[s.status];
              return (
                <tr key={s.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-bold text-slate-800">{s.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.zone}</td>
                  <td className="px-4 py-3 num text-slate-600">{s.meterSerial}</td>
                  <td className="px-4 py-3 num text-slate-600">{s.householdSize}</td>
                  <td className="px-4 py-3 num font-semibold text-slate-700">{s.balanceYER > 0 ? `${fmtYER(s.balanceYER)} ريال` : '—'}</td>
                  <td className="px-4 py-3"><span className={`chip border ${st.cls}`}>{st.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAdd && <AddSubscriberModal projectId={projectId} onClose={() => setShowAdd(false)} onAdd={addSubscriber} />}
    </div>
  );
}

function AddSubscriberModal({ projectId, onClose, onAdd }: { projectId: string; onClose: () => void; onAdd: (s: Omit<Subscriber, 'id'>) => void }) {
  const [name, setName] = useState('');
  const [zone, setZone] = useState('');
  const [meter, setMeter] = useState('');
  const [size, setSize] = useState(5);
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md animate-fade-in rounded-2xl bg-white p-5 shadow-cardlg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">إضافة مشترك محلي</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || !meter.trim()) return;
            onAdd({ projectId, name: name.trim(), zone: zone.trim() || 'حي السوق', meterSerial: meter.trim(), householdSize: size, balanceYER: 0, status: 'active' });
            onClose();
          }}
          className="space-y-3"
        >
          <div><label className="label">اسم المشترك</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم الكامل" /></div>
          <div><label className="label">المنطقة / الحي</label><input className="input" value={zone} onChange={(e) => setZone(e.target.value)} placeholder="مثال: الحي الشرقي" /></div>
          <div><label className="label">رقم العداد</label><input className="input num" value={meter} onChange={(e) => setMeter(e.target.value)} placeholder="YM-XXX-0001" /></div>
          <div><label className="label">عدد أفراد الأسرة</label><input type="number" min={1} max={20} className="input num" value={size} onChange={(e) => setSize(+e.target.value)} /></div>
          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary flex-1"><UserPlus className="h-4 w-4" /> إضافة</button>
            <button type="button" onClick={onClose} className="btn-ghost">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

