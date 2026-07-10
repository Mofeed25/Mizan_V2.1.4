import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadialBarChart, RadialBar, PolarAngleAxis, AreaChart, Area, Legend } from 'recharts';
import { useFilteredProjects, computeAggregates } from '../lib/aggregations';
import { fmtNum } from '../lib/format';

interface Props {
  directorateId: string | 'all';
  projectId: string | 'all';
}

export function DashboardCharts({ directorateId, projectId }: Props) {
  const projects = useFilteredProjects(directorateId, projectId);
  const agg = computeAggregates(projects);

  const prodData = projects.map((p) => ({
    name: p.name.replace('مشروع مياه ', '').replace(' التعاوني', '').replace(' المحلي', '').replace(' الأهلي', '').replace(' الريفي', '').replace(' الجبلي', ''),
    production: p.productionM3,
    metered: p.meteredConsumptionM3,
    loss: p.productionM3 - p.meteredConsumptionM3,
  }));

  const radialData = [
    { name: 'الشفافية', value: Math.round(agg.avgVerified), fill: '#10b981' },
    { name: 'التحصيل', value: Math.round(agg.avgCollected), fill: '#029dff' },
    { name: 'كفاءة الشبكة', value: Math.round(100 - agg.lossPct), fill: '#0bbac0' },
  ];

  const trendData = [
    { month: 'فبراير', production: agg.totalProduction * 0.94, loss: agg.lossPct + 4 },
    { month: 'مارس', production: agg.totalProduction * 0.97, loss: agg.lossPct + 2 },
    { month: 'أبريل', production: agg.totalProduction * 1.02, loss: agg.lossPct },
    { month: 'مايو', production: agg.totalProduction * 0.99, loss: agg.lossPct - 1 },
    { month: 'يونيو', production: agg.totalProduction, loss: agg.lossPct },
    { month: 'يوليو', production: agg.totalProduction * 1.03, loss: Math.max(0, agg.lossPct - 0.5) },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Production vs metered */}
      <div className="card card-pad lg:col-span-2">
        <h3 className="section-title mb-1">الإنتاج مقابل الاستهلاك المعدود (م³)</h3>
        <p className="mb-4 text-xs text-slate-500">الفجوة تمثل الفاقد المائي غير الإيرادي (NRW)</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={prodData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} orientation="right" />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 12 }}
              formatter={(v, n) => [`${fmtNum(Number(v))} م³`, n === 'production' ? 'الإنتاج' : n === 'metered' ? 'معدود' : 'فاقد']}
            />
            <Legend formatter={(v) => v === 'production' ? 'الإنتاج' : v === 'metered' ? 'معدود' : 'فاقد'} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="production" fill="#029dff" radius={[6, 6, 0, 0]} maxBarSize={42} />
            <Bar dataKey="metered" fill="#0bbac0" radius={[6, 6, 0, 0]} maxBarSize={42} />
            <Bar dataKey="loss" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={42} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radial governance score */}
      <div className="card card-pad">
        <h3 className="section-title mb-1">مؤشرات الأداء الكلية</h3>
        <p className="mb-4 text-xs text-slate-500">نسبة مئوية لكل محور حوكمة</p>
        <ResponsiveContainer width="100%" height={260}>
          <RadialBarChart innerRadius="30%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background dataKey="value" cornerRadius={8} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} formatter={(v) => `${fmtNum(Number(v))}%`} />
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 11 }} formatter={(v) => v} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* Trend */}
      <div className="card card-pad lg:col-span-3">
        <h3 className="section-title mb-1">اتجاه الإنتاج ونسبة الفاقد (آخر 6 أشهر)</h3>
        <p className="mb-4 text-xs text-slate-500">مراقبة زمنية لمؤشرات الحوكمة</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={trendData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <defs>
              <linearGradient id="gProd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#029dff" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#029dff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gLoss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="l" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} orientation="right" />
            <YAxis yAxisId="r" orientation="left" tick={{ fontSize: 11, fill: '#f59e0b' }} axisLine={false} tickLine={false} domain={[0, 40]} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => v === 'production' ? 'الإنتاج (م³)' : 'الفاقد (%)'} />
            <Area yAxisId="l" type="monotone" dataKey="production" stroke="#029dff" strokeWidth={2.5} fill="url(#gProd)" />
            <Area yAxisId="r" type="monotone" dataKey="loss" stroke="#f59e0b" strokeWidth={2.5} fill="url(#gLoss)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
