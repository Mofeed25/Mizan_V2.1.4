import { useState } from 'react';
import { Camera, MapPin, Save, RotateCw, Wifi, WifiOff, CheckCircle2, Gauge } from 'lucide-react';
import { useMizan } from '../data/store';
import { fmtDate, syncMeta } from '../lib/format';


export function ReadingCapture({ projectId }: { projectId: string }) {
  const { subscribers, readings, addReading, retryReading, online, setOnline } = useMizan();
  const mine = subscribers.filter((s) => s.projectId === projectId);
  const myReadings = readings.filter((r) => r.projectId === projectId);
  const [selId, setSelId] = useState(mine[0]?.id ?? '');
  const [reading, setReading] = useState('');
  const [prev, setPrev] = useState('0');
  const [gpsOn, setGpsOn] = useState(true);
  const [photoOn, setPhotoOn] = useState(true);

  const sub = mine.find((s) => s.id === selId);
  const pending = myReadings.filter((r) => r.syncStatus !== 'synced');
  const syncedCount = myReadings.filter((r) => r.syncStatus === 'synced').length;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sub || !reading) return;
    const prevNum = +prev || 0;
    const curNum = +reading;
    if (curNum < prevNum) return;
    addReading({
      subscriberId: sub.id,
      subscriberName: sub.name,
      projectId,
      readingM3: curNum,
      previousM3: prevNum,
      capturedAt: new Date().toISOString(),
      gps: gpsOn ? { lat: 15.35 + Math.random() * 0.1, lng: 44.0 + Math.random() * 0.1 } : { lat: 0, lng: 0 },
      hasPhoto: photoOn,
    });
    setReading('');
    setPrev(String(curNum));
  }

  return (
    <div className="space-y-4">
      {/* Sync status banner */}
      <div className={`card card-pad border-2 ${online ? 'border-emerald-200' : 'border-amber-200'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`relative grid h-11 w-11 place-items-center rounded-xl ${online ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              {online ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
              {!online && <span className="absolute inset-0 animate-pulse-ring rounded-xl bg-amber-300/30" />}
            </div>
            <div>
              <div className="font-bold text-slate-800">{online ? 'متصل بالشبكة - مزامنة تلقائية' : 'وضع عدم الاتصال'}</div>
              <div className="text-xs text-slate-500">
                {pending.length > 0 ? `${pending.length} قراءة في قائمة الانتظار` : 'جميع القراءات متزامنة'} • {syncedCount} قراءة متزامنة
              </div>
            </div>
          </div>
          <button onClick={() => setOnline(!online)} className={online ? 'btn-ghost' : 'btn bg-amber-500 text-white hover:bg-amber-600'}>
            {online ? 'محاكاة انقطاع الشبكة' : 'محاكاة عودة الشبكة'}
          </button>
        </div>
      </div>

      {/* Capture form */}
      <div className="card card-pad">
        <div className="mb-4 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600"><Gauge className="h-5 w-5" /></div>
          <div>
            <h3 className="section-title">تسجيل قراءة العداد</h3>
            <p className="text-xs text-slate-500">إدخال قراءة مع إثبات GPS وصورة</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">المشترك</label>
              <select className="input" value={selId} onChange={(e) => { setSelId(e.target.value); const s = mine.find((x) => x.id === e.target.value); setPrev(s ? String(100 + Math.floor(Math.random() * 300)) : '0'); }}>
                {mine.map((s) => <option key={s.id} value={s.id}>{s.name} - {s.meterSerial}</option>)}
              </select>
            </div>
            <div>
              <label className="label">القراءة السابقة (م³)</label>
              <input className="input num" value={prev} onChange={(e) => setPrev(e.target.value)} type="number" />
            </div>
          </div>
          <div>
            <label className="label">القراءة الحالية (م³)</label>
            <input className="input num text-lg font-bold" value={reading} onChange={(e) => setReading(e.target.value)} type="number" placeholder="00000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setGpsOn(!gpsOn)} className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all ${gpsOn ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700"><MapPin className={`h-4 w-4 ${gpsOn ? 'text-emerald-600' : 'text-slate-400'}`} /> إثبات الموقع GPS</span>
              <span className={`h-5 w-9 rounded-full transition-colors ${gpsOn ? 'bg-emerald-500' : 'bg-slate-300'} relative`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${gpsOn ? 'left-0.5' : 'right-0.5'}`} /></span>
            </button>
            <button type="button" onClick={() => setPhotoOn(!photoOn)} className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all ${photoOn ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-white'}`}>
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Camera className={`h-4 w-4 ${photoOn ? 'text-brand-600' : 'text-slate-400'}`} /> إثبات صورة العداد</span>
              <span className={`h-5 w-9 rounded-full transition-colors ${photoOn ? 'bg-brand-500' : 'bg-slate-300'} relative`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${photoOn ? 'left-0.5' : 'right-0.5'}`} /></span>
            </button>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={!reading || !sub}>
            <Save className="h-4 w-4" /> حفظ القراءة {online ? '(مزامنة فورية)' : '(حفظ محلي)'}
          </button>
        </form>
      </div>

      {/* Queue */}
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 p-4">
          <h3 className="section-title">قائمة القراءات ومزامنتها</h3>
          <p className="text-xs text-slate-500">آخر القراءات المسجلة وحالة المزاممة</p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {myReadings.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">لا توجد قراءات مسجلة بعد لهذا المشروع.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myReadings.slice(0, 20).map((r) => {
                const m = syncMeta[r.syncStatus];
                return (
                  <div key={r.id} className="flex items-center gap-3 p-3.5">
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${r.syncStatus === 'synced' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {r.syncStatus === 'synced' ? <CheckCircle2 className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-slate-700">{r.subscriberName}</span>
                        <span className="num text-xs text-slate-400">{r.previousM3} ← {r.readingM3} م³</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                        <span>{fmtDate(r.capturedAt)}</span>
                        {r.gps.lat !== 0 && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> GPS</span>}
                        {r.hasPhoto && <span className="flex items-center gap-0.5"><Camera className="h-3 w-3" /> صورة</span>}
                        {r.retries > 0 && <span className="num">محاولات: {r.retries}</span>}
                      </div>
                    </div>
                    <span className={`chip border ${m.cls} shrink-0`}><span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />{m.label}</span>
                    {r.syncStatus !== 'synced' && (
                      <button onClick={() => retryReading(r.id)} className="btn-ghost px-2 py-1 text-xs"><RotateCw className="h-3.5 w-3.5" /> إعادة</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
