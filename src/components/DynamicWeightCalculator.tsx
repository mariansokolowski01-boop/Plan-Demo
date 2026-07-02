import { useState, useMemo } from 'react';
import { standardOrders } from '../data/store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function DynamicWeightCalculator() {
  const [minWeightKg, setMinWeightKg] = useState<number>(500);
  const [maxWeightKg, setMaxWeightKg] = useState<number>(2000);
  const [yearFilter, setYearFilter] = useState<string>('All');

  const filteredOrders = useMemo(() => {
    return standardOrders.filter(order => {
      const weightInKg = order.weightT * 1000;
      const isWeightMatch = weightInKg >= minWeightKg && weightInKg <= maxWeightKg;
      const isYearMatch = yearFilter === 'All' ? true : order.year === yearFilter;
      return isWeightMatch && isYearMatch;
    }).sort((a, b) => b.weightT - a.weightT);
  }, [minWeightKg, maxWeightKg, yearFilter]);

  const stats = useMemo(() => {
    const totalTonnage = filteredOrders.reduce((sum, o) => sum + o.weightT, 0);
    const totalRbh = filteredOrders.reduce((sum, o) => sum + o.totalRbh, 0);
    
    const ordersForRbhPt = filteredOrders.filter(o => !o.isMinKg);
    const weightForRbhPt = ordersForRbhPt.reduce((sum, o) => sum + o.weightT, 0);
    const rbhForRbhPt = ordersForRbhPt.reduce((sum, o) => sum + o.totalRbh, 0);
    const avgRbhT = weightForRbhPt > 0 ? rbhForRbhPt / weightForRbhPt : 0;
    
    const ordersOver1t = ordersForRbhPt.filter(o => o.weightT > 1);
    const weightOver1t = ordersOver1t.reduce((sum, o) => sum + o.weightT, 0);
    const rbhOver1t = ordersOver1t.reduce((sum, o) => sum + o.totalRbh, 0);
    const avgRbhTOver1t = weightOver1t > 0 ? rbhOver1t / weightOver1t : 0;

    const ordersUnder1t = ordersForRbhPt.filter(o => o.weightT <= 1);
    const weightUnder1t = ordersUnder1t.reduce((sum, o) => sum + o.weightT, 0);
    const rbhUnder1t = ordersUnder1t.reduce((sum, o) => sum + o.totalRbh, 0);
    const avgRbhTUnder1t = weightUnder1t > 0 ? rbhUnder1t / weightUnder1t : 0;

    return {
      count: filteredOrders.length,
      totalTonnage,
      totalRbh,
      avgRbhT,
      avgRbhTOver1t,
      avgRbhTUnder1t
    };
  }, [filteredOrders]);

  const chartData = filteredOrders.map(o => ({
    name: o.orderNumber,
    'Zlecenie': o.orderNumber,
    'Masa [kg]': Math.round(o.weightT * 1000),
    'RBH/t': o.rbhPerT || (o.weightT ? o.totalRbh / o.weightT : 0)
  })).slice(0, 20); // Top 20 for readability

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
        <h2 className="text-xl font-semibold text-slate-100 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Dynamiczny Kalkulator Pracochłonności (RBH/t)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Min Masa [kg]
            </label>
            <input 
              type="number"
              value={minWeightKg}
              onChange={(e) => setMinWeightKg(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Max Masa [kg]
            </label>
            <input 
              type="number"
              value={maxWeightKg}
              onChange={(e) => setMaxWeightKg(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Rok
            </label>
            <select 
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="All">Wszystkie Lata</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-sm mb-1">Zlecenia</div>
            <div className="text-xl font-bold text-slate-100">{stats.count} szt.</div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-sm mb-1">Tonaż</div>
            <div className="text-xl font-bold text-emerald-400">{stats.totalTonnage.toFixed(2)} t</div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-sm mb-1">RBH</div>
            <div className="text-xl font-bold text-amber-400">{stats.totalRbh.toFixed(1)}</div>
          </div>
          <div className="bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/30 shadow-inner">
            <div className="text-indigo-300 text-sm mb-1 font-medium">RBH/t (Śr)</div>
            <div className="text-2xl font-bold text-indigo-400">{stats.avgRbhT > 0 ? stats.avgRbhT.toFixed(2) : '-'}</div>
          </div>
          <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30 shadow-inner">
            <div className="text-emerald-300 text-sm mb-1 font-medium">RBH/t &gt;1t</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.avgRbhTOver1t > 0 ? stats.avgRbhTOver1t.toFixed(2) : '-'}</div>
          </div>
          <div className="bg-amber-900/20 p-4 rounded-xl border border-amber-500/30 shadow-inner">
            <div className="text-amber-300 text-sm mb-1 font-medium">RBH/t &lt;=1t</div>
            <div className="text-2xl font-bold text-amber-400">{stats.avgRbhTUnder1t > 0 ? stats.avgRbhTUnder1t.toFixed(2) : '-'}</div>
          </div>
        </div>

        {filteredOrders.length > 0 && (
          <div className="h-64 mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="Zlecenie" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Bar yAxisId="left" dataKey="RBH/t" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100">Lista Zleceń w Wybranym Przedziale</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 font-medium">Klient</th>
                <th className="px-6 py-4 font-medium">Nr Zlecenia ST</th>
                <th className="px-6 py-4 font-medium">Opis</th>
                <th className="px-6 py-4 font-medium text-right">Masa [t]</th>
                <th className="px-6 py-4 font-medium text-right">Suma RBH</th>
                <th className="px-6 py-4 font-medium text-right">RBH / t</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredOrders.map((order) => (
                <tr key={order.orderNumber} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4">{order.company}</td>
                  <td className="px-6 py-4 font-mono text-indigo-300">{order.orderNumber}</td>
                  <td className="px-6 py-4 truncate max-w-xs" title={order.description}>{order.description}</td>
                  <td className="px-6 py-4 text-right text-emerald-400 font-medium">{order.weightT.toFixed(3)}</td>
                  <td className="px-6 py-4 text-right text-amber-400">{order.totalRbh.toFixed(1)}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-200">
                    {order.isMinKg 
                      ? <span className="text-teal-400 text-xs">{order.rbhPerKgMin.toFixed(2)} min/kg</span>
                      : (order.rbhPerT || (order.weightT > 0 ? order.totalRbh / order.weightT : 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Brak zleceń w wybranym przedziale wagowym.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
