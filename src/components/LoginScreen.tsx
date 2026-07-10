import { useState } from 'react';
import { Droplets, ShieldCheck, User, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useMizan } from '../data/store';

export function LoginScreen() {
  const { login } = useMizan();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const ok = login(username, password);
      if (!ok) {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.');
        setLoading(false);
      }
    }, 500);
  }

  function fill(u: string, p: string) {
    setUsername(u);
    setPassword(p);
    setError('');
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-aqua-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
      </div>

      <div className="relative grid min-h-screen place-items-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 text-center">
            <div className="relative mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-brand-500 to-aqua-500 text-white shadow-glow">
              <Droplets className="h-8 w-8" strokeWidth={2.2} />
              <span className="absolute -bottom-1 -left-1 grid h-6 w-6 place-items-center rounded-full bg-white text-brand-700 shadow ring-1 ring-slate-200">
                <ShieldCheck className="h-4 w-4" strokeWidth={2.5} />
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">ميزان</h1>
            <p className="mt-1 text-sm text-slate-400">منصة حوكمة المياه وبناء السلام</p>
            <p className="text-xs text-slate-500">محافظة تعز — الجمهورية اليمنية</p>
          </div>

          {/* Login card */}
          <div className="animate-fade-in rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6 shadow-cardlg backdrop-blur-xl">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-white">تسجيل الدخول</h2>
              <p className="text-xs text-slate-400">أدخل بيانات حسابك للوصول إلى لوحة الحوكمة</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">اسم المستخدم</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/60 py-2.5 pr-10 pl-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/60 py-2.5 pr-10 pl-10 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !username || !password}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-aqua-600 py-3 text-sm font-bold text-white shadow-lg transition-all hover:from-brand-500 hover:to-aqua-500 disabled:opacity-50"
              >
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    تسجيل الدخول
                  </>
                )}
              </button>
            </form>

            {/* Quick fill demo accounts */}
            <div className="mt-6 border-t border-slate-700/50 pt-4">
              <p className="mb-2 text-xs font-semibold text-slate-400">حسابات تجريبية للعرض:</p>
              <div className="space-y-1.5">
                <DemoAccount label="المشرف المركزي - تعز" username="admin_taiz" onClick={() => fill('admin_taiz', 'Taiz2026')} />
                <DemoAccount label="مديرية المواسط - يفرس" username="mawasit_water" onClick={() => fill('mawasit_water', 'Maw123')} />
                <DemoAccount label="مديرية الشمايتين - التربة" username="shamaytain_water" onClick={() => fill('shamaytain_water', 'Sha123')} />
                <DemoAccount label="مديرية جبل حبشي - الوافي" username="jabal_water" onClick={() => fill('jabal_water', 'Jab123')} />
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            نظام محمي — جميع العمليات مسجلة ومخوّلة وفق الصلاحيات
          </p>
        </div>
      </div>
    </div>
  );
}

function DemoAccount({ label, username, onClick }: { label: string; username: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/40 px-3 py-2 text-right transition-all hover:border-brand-500/50 hover:bg-slate-900/60"
    >
      <span className="text-xs font-semibold text-slate-300">{label}</span>
      <span className="num text-xs text-slate-500">{username}</span>
    </button>
  );
}
