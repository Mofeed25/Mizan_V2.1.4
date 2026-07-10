import { MizanProvider, useMizan } from './data/store';
import { TopBar } from './components/TopBar';
import { LoginScreen } from './components/LoginScreen';
import { CentralDashboard } from './components/CentralDashboard';
import { LocalView } from './components/LocalView';
import { Chatbot } from './components/Chatbot';
import { Droplets, ShieldCheck } from 'lucide-react';

function Shell() {
  const { user, role } = useMizan();

  if (!user) {
    return (
      <div className="min-h-screen">
        <LoginScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <main className="animate-fade-in">
        {role === 'super' ? <CentralDashboard /> : <LocalView />}
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-aqua-600 text-white"><Droplets className="h-4 w-4" /></div>
          <span><span className="font-bold text-slate-700">ميزان</span> — منصة حوكمة المياه وبناء السلام — محافظة تعز</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          بيانات تجريبية لأغراض العرض على المانحين الدوليين
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <MizanProvider>
      <Shell />
    </MizanProvider>
  );
}
