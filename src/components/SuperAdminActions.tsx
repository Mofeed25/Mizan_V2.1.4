import { useState } from 'react';
import { Plus, Send, Megaphone, Building2, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { useMizan } from '../data/store';

export function SuperAdminActions() {
  const { projects, directorates, addProject, addDirective } = useMizan();
  const [showProject, setShowProject] = useState(false);
  const [showDir, setShowDir] = useState(false);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Add project */}
      <div className="card card-pad">
        <div className="mb-3 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="section-title">إضافة مشروع مياه جديد</h3>
            <p className="text-xs text-slate-500">إجراء حصري للمشرف العام - لا يمكن إضافة مشتركين فرديين من هنا</p>
          </div>
        </div>
        <AddProjectForm
          open={showProject}
          setOpen={setShowProject}
          directorates={directorates}
          onSubmit={(name, dirId) => { addProject(name, dirId); setShowProject(false); }}
        />
        {!showProject ? (
          <button onClick={() => setShowProject(true)} className="btn-primary w-full">
            <Plus className="h-4 w-4" /> فتح نموذج إضافة مشروع
          </button>
        ) : null}
        <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-700 border border-amber-100">
          <ShieldAlert className="inline h-3.5 w-3.5 ml-1" />
          لوحة التحكم المركزية ممنوعة من إضافة مشتركين فرديين - هذا من صلاحيات مدير المشروع المحلي فقط.
        </div>
      </div>

      {/* Directives */}
      <div className="card card-pad">
        <div className="mb-3 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-red-600">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="section-title">الأوامر والتوجيهات الإدارية</h3>
            <p className="text-xs text-slate-500">إرسال تعميم أو تحذير رسمي لمشروع مياه محدد</p>
          </div>
        </div>
        <DirectiveForm
          open={showDir}
          setOpen={setShowDir}
          projects={projects}
          onSubmit={(d) => { addDirective(d); setShowDir(false); }}
        />
        {!showDir ? (
          <button onClick={() => setShowDir(true)} className="btn w-full bg-red-600 text-white hover:bg-red-700 shadow-sm">
            <Send className="h-4 w-4" /> صياغة توجيه إداري
          </button>
        ) : null}
      </div>
    </div>
  );
}

function AddProjectForm({ open, setOpen, directorates, onSubmit }: {
  open: boolean;
  setOpen: (v: boolean) => void;
  directorates: { id: string; name: string }[];
  onSubmit: (name: string, dirId: string) => void;
}) {
  const [name, setName] = useState('');
  const [dirId, setDirId] = useState(directorates[0]?.id ?? '');
  if (!open) return null;
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (name.trim()) onSubmit(name.trim(), dirId); }}
      className="animate-fade-in space-y-3"
    >
      <div>
        <label className="label">اسم المشروع</label>
        <input className="input" placeholder="مثال: مشروع مياه سنافر التعاوني" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="label">المديرية</label>
        <select className="input" value={dirId} onChange={(e) => setDirId(e.target.value)}>
          {directorates.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1"><Plus className="h-4 w-4" /> إضافة المشروع</button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">إلغاء</button>
      </div>
    </form>
  );
}

function DirectiveForm({ open, setOpen, projects, onSubmit }: {
  open: boolean;
  setOpen: (v: boolean) => void;
  projects: { id: string; name: string }[];
  onSubmit: (d: { projectId: string; projectName: string; title: string; body: string; severity: 'info' | 'warning' | 'critical' }) => void;
}) {
  const [pid, setPid] = useState(projects[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [severity, setSeverity] = useState<'info' | 'warning' | 'critical'>('warning');
  if (!open) return null;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const p = projects.find((x) => x.id === pid);
        if (p && title.trim() && body.trim()) onSubmit({ projectId: p.id, projectName: p.name, title: title.trim(), body: body.trim(), severity });
      }}
      className="animate-fade-in space-y-3"
    >
      <div>
        <label className="label">المشروع المستهدف</label>
        <select className="input" value={pid} onChange={(e) => setPid(e.target.value)}>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">مستوى الخطورة</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { v: 'info', label: 'إشعار', icon: <Info className="h-4 w-4" />, cls: 'border-slate-200 text-slate-600' },
            { v: 'warning', label: 'تحذير', icon: <AlertTriangle className="h-4 w-4" />, cls: 'border-amber-200 text-amber-600' },
            { v: 'critical', label: 'حرج', icon: <ShieldAlert className="h-4 w-4" />, cls: 'border-red-200 text-red-600' },
          ] as const).map((s) => (
            <button
              key={s.v}
              type="button"
              onClick={() => setSeverity(s.v)}
              className={`btn border ${s.cls} ${severity === s.v ? 'ring-2 ring-offset-1 ring-current bg-slate-50' : 'bg-white'}`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">عنوان التوجيه</label>
        <input className="input" placeholder="مثال: تعميم: مراجعة التعرفة الموحدة" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="label">نص التوجيه</label>
        <textarea className="input min-h-[100px] resize-y" placeholder="اكتب نص التعميم أو التحذير الرسمي..." value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn flex-1 bg-red-600 text-white hover:bg-red-700"><Send className="h-4 w-4" /> إرسال التوجيه</button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">إلغاء</button>
      </div>
    </form>
  );
}
