import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, X, ShieldAlert, FileText, Wrench, Droplets, Scale, TrendingDown } from 'lucide-react';
import { useMizan } from '../data/store';
import { computeAggregates } from '../lib/aggregations';
import { fmtNum, gradeColor, riskMeta } from '../lib/format';

interface Msg {
  id: string;
  role: 'user' | 'bot';
  text?: string;
  card?: React.ReactNode;
}

const suggestions = [
  { label: 'مؤشر النزاعات المحلية', icon: ShieldAlert },
  { label: 'تقرير الشفافية والمساءلة', icon: FileText },
  { label: 'تحليل الفاقد المائي', icon: TrendingDown },
  { label: 'أوامر الصيانة النشطة', icon: Wrench },
  { label: 'ملخص أداء المشاريع', icon: Droplets },
  { label: 'تباين التعرفة بين المديريات', icon: Scale },
];

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 'init', role: 'bot', text: 'مرحباً! أنا مساعد حوكمة ميزان الذكي. اسألني عن مؤشرات النزاع، الشفافية، الفاقد المائي، أو أوامر الصيانة.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing]);

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Msg = { id: `u-${Date.now()}`, role: 'user', text };
    setMsgs((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const card = generateCard(text);
      const botMsg: Msg = { id: `b-${Date.now()}`, role: 'bot', text: card ? undefined : 'لم أتمكن من فهم سؤالك بدقة. جرّب أحد الاقتراحات أدناه.', card };
      setMsgs((m) => [...m, botMsg]);
      setTyping(false);
    }, 700);
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-brand-600 to-aqua-600 px-5 py-3.5 text-white shadow-cardlg transition-transform hover:scale-105"
        >
          <Bot className="h-5 w-5" />
          <span className="text-sm font-bold">مساعد الحوكمة</span>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
          </span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 left-5 z-40 flex h-[600px] max-h-[85vh] w-[400px] max-w-[calc(100vw-2.5rem)] animate-fade-in flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-cardlg">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-br from-brand-600 to-aqua-600 p-4 text-white">
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur"><Bot className="h-5 w-5" /></div>
              <div>
                <div className="font-bold">مساعد حوكمة ميزان</div>
                <div className="flex items-center gap-1 text-xs text-white/80"><Sparkles className="h-3 w-3" /> ذكاء اصطناعي للحوكمة</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-white/80 hover:bg-white/20"><X className="h-4 w-4" /></button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {msgs.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] ${m.role === 'user' ? 'order-2' : ''}`}>
                  {m.role === 'bot' && <div className="mb-1 flex items-center gap-1 text-xs text-slate-400"><Bot className="h-3 w-3" /> ميزان AI</div>}
                  {m.text && (
                    <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}>
                      {m.text}
                    </div>
                  )}
                  {m.card}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-end">
                <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-1.5 border-t border-slate-100 bg-white p-2.5">
            {suggestions.map((s) => {
              const Icon = s.icon;
              return (
                <button key={s.label} onClick={() => send(s.label)} className="chip bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors">
                  <Icon className="h-3 w-3" /> {s.label}
                </button>
              );
            })}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-slate-100 bg-white p-3">
            <input
              className="input flex-1"
              placeholder="اكتب سؤالك..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
            />
            <button onClick={() => send(input)} className="btn-primary px-3"><Send className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </>
  );
}

function generateCard(query: string): React.ReactNode {
  const { projects, workOrders } = useMizan();
  const agg = computeAggregates(projects);
  const q = query.trim();

  if (q.includes('نزاع') || q.includes('النزاعات')) {
    const rows = projects.map((p) => ({ p, m: riskMeta[p.conflictGrade] }));
    return (
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-800"><ShieldAlert className="h-4 w-4 text-red-500" /> جدول مؤشر النزاعات حسب المديرية</div>
        <div className="space-y-1.5">
          {rows.map(({ p, m }) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs">
              <span className="font-semibold text-slate-700">{p.directorateName}</span>
              <span className="flex items-center gap-2">
                <span className="num text-slate-500">فاقد {fmtNum(p.lossRatePct, 1)}%</span>
                <span className={`chip border ${m.cls}`}><span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} /> {m.label}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (q.includes('شفافية') || q.includes('مساءلة')) {
    return (
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-800"><FileText className="h-4 w-4 text-emerald-500" /> تقرير الشفافية والمساءلة (A-F)</div>
        <div className="space-y-1.5">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs">
              <span className="font-semibold text-slate-700">{p.name.replace('مشروع مياه ', '')}</span>
              <span className="flex items-center gap-2">
                <span className="num text-slate-500">موثق {fmtNum(p.verifiedReadingsPct)}%</span>
                <span className={`chip border ${gradeColor(p.governanceGrade)} num font-extrabold`}>{p.governanceGrade}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">متوسط التوثيق الميداني: <span className="num font-bold">{fmtNum(agg.avgVerified)}%</span></div>
      </div>
    );
  }

  if (q.includes('فاقد') || q.includes('NRW')) {
    return (
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-800"><TrendingDown className="h-4 w-4 text-amber-500" /> تحليل الفاقد المائي</div>
        <div className="mb-2 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-slate-50 p-2"><div className="num text-base font-extrabold text-slate-800">{fmtNum(agg.totalProduction)}</div><div className="text-slate-500">إنتاج م³</div></div>
          <div className="rounded-lg bg-aqua-50 p-2"><div className="num text-base font-extrabold text-aqua-700">{fmtNum(agg.totalMetered)}</div><div className="text-aqua-600">معدود م³</div></div>
          <div className="rounded-lg bg-amber-50 p-2"><div className="num text-base font-extrabold text-amber-700">{fmtNum(agg.lossPct, 1)}%</div><div className="text-amber-600">فاقد</div></div>
        </div>
        <div className="space-y-1">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-xs">
              <span className="w-24 truncate font-semibold text-slate-600">{p.directorateName}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${p.lossRatePct > 25 ? 'bg-red-500' : p.lossRatePct > 15 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, p.lossRatePct * 2)}%` }} /></div>
              <span className="num w-10 text-left font-bold text-slate-700">{fmtNum(p.lossRatePct, 1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (q.includes('صيانة') || q.includes('أوامر')) {
    const open = workOrders.filter((w) => w.status !== 'closed');
    return (
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-800"><Wrench className="h-4 w-4 text-brand-500" /> أوامر الصيانة النشطة ({open.length})</div>
        {open.length === 0 ? <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">لا توجد أوامر صيانة مفتوحة.</div> : (
          <div className="space-y-1.5">
            {open.map((w) => (
              <div key={w.id} className="rounded-lg bg-amber-50 px-3 py-2 text-xs">
                <div className="font-bold text-amber-800">{w.projectName}</div>
                <div className="text-amber-700">{w.description}</div>
                <div className="mt-0.5 flex items-center gap-2 text-amber-600"><span className="num">فاقد {fmtNum(w.lossPct, 1)}%</span> <span className={`chip ${w.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'}`}>{w.status === 'open' ? 'مفتوح' : 'قيد التنفيذ'}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (q.includes('ملخص') || q.includes('أداء')) {
    return (
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-800"><Droplets className="h-4 w-4 text-brand-500" /> ملخص أداء المشاريع</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-brand-50 p-2 text-center"><div className="num text-lg font-extrabold text-brand-700">{projects.length}</div><div className="text-brand-600">مشاريع</div></div>
          <div className="rounded-lg bg-aqua-50 p-2 text-center"><div className="num text-lg font-extrabold text-aqua-700">{fmtNum(agg.totalSubscribers)}</div><div className="text-aqua-600">مشترك</div></div>
          <div className="rounded-lg bg-emerald-50 p-2 text-center"><div className="num text-lg font-extrabold text-emerald-700">{fmtNum(agg.avgVerified)}%</div><div className="text-emerald-600">توثيق</div></div>
          <div className="rounded-lg bg-amber-50 p-2 text-center"><div className="num text-lg font-extrabold text-amber-700">{fmtNum(agg.lossPct, 1)}%</div><div className="text-amber-600">فاقد</div></div>
        </div>
      </div>
    );
  }

  if (q.includes('تعرفة') || q.includes('تباين')) {
    const sorted = [...projects].sort((a, b) => a.tariffPerM3 - b.tariffPerM3);
    return (
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-800"><Scale className="h-4 w-4 text-aqua-500" /> تباين التعرفة بين المديريات</div>
        <div className="space-y-1.5">
          {sorted.map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-xs">
              <span className="w-20 truncate font-semibold text-slate-600">{p.directorateName}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-500" style={{ width: `${(p.tariffPerM3 / 2000) * 100}%` }} /></div>
              <span className="num w-16 text-left font-bold text-slate-700">{fmtNum(p.tariffPerM3)} ريال</span>
            </div>
          ))}
        </div>
        <div className="mt-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600">التباين المعياري: <span className="num font-bold text-slate-800">{fmtNum(agg.tariffVariance, 0)} ريال</span></div>
      </div>
    );
  }

  return null;
}
