import { Droplets, ShieldCheck, Wifi, WifiOff, RotateCcw, LogOut, UserCircle } from 'lucide-react';
import { useMizan } from '../data/store';

export function TopBar() {
  const { user, role, online, setOnline, resetData, logout } = useMizan();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-aqua-600 text-white shadow-glow">
            <Droplets className="h-6 w-6" strokeWidth={2.2} />
            <span className="absolute -bottom-1 -left-1 grid h-5 w-5 place-items-center rounded-full bg-white text-brand-700 shadow ring-1 ring-slate-200">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">ميزان</h1>
              <span className="chip bg-brand-50 text-brand-700 border border-brand-100">منصة حوكمة المياه</span>
            </div>
            <p className="text-xs text-slate-500">محافظة تعز — حوكمة المياه وبناء السلام</p>
          </div>
        </div>

        <div className="flex-1" />

        {/* User identity badge */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-card">
          <div className={`grid h-8 w-8 place-items-center rounded-lg ${role === 'super' ? 'bg-brand-50 text-brand-600' : 'bg-aqua-50 text-aqua-600'}`}>
            {role === 'super' ? <ShieldCheck className="h-4 w-4" /> : <UserCircle className="h-4 w-4" />}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-slate-800">{user?.displayName ?? 'مستخدم'}</div>
            <div className="text-xs text-slate-500">
              {role === 'super' ? 'التحكم المركزي' : user?.directorateName ?? 'مدير مشروع'}
            </div>
          </div>
        </div>

        {/* Online toggle */}
        <button
          onClick={() => setOnline(!online)}
          className={`btn ${online ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}
          title="محاكاة حالة الشبكة"
        >
          {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          <span className="hidden sm:inline">{online ? 'متصل' : 'غير متصل'}</span>
        </button>

        <button onClick={resetData} className="btn-ghost" title="إعادة ضبط البيانات التجريبية">
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="btn bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
          title="تسجيل الخروج"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline font-bold">تسجيل الخروج</span>
        </button>
      </div>
    </header>
  );
}
