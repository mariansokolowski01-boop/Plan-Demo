import { useState, useMemo } from 'react';
import { standardOrders, getStatsForYear, Order } from '../data/store';
import { CalendarClock, CheckCircle2, Clock, AlertTriangle, Building2, ChevronDown } from 'lucide-react';

export function CurrentYearDashboard() {
  const currentYear = '2026';
  const stats = getStatsForYear(currentYear);
  const yearOrders = standardOrders.filter(o => o.year === currentYear);

  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());

  const toggleCompany = (company: string) => {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(company)) {
        newSet.delete(company);
      } else {
        newSet.add(company);
      }
      return newSet;
    });
  };

  const companySummaries = useMemo(() => {
    const map = new Map<string, {
      company: string;
      orders: Order[];
      totalWeight: number;
      totalRbh: number;
      activeCount: number;
      completedCount: number;
    }>();

    yearOrders.forEach(order => {
      if (!map.has(order.company)) {
        map.set(order.company, {
          company: order.company,
          orders: [],
          totalWeight: 0,
          totalRbh: 0,
          activeCount: 0,
          completedCount: 0
        });
      }
      
      const summary = map.get(order.company)!;
      summary.orders.push(order);
      summary.totalWeight += order.weightT;
      summary.totalRbh += order.totalRbh;
      
      if (order.status.toLowerCase().includes('w toku')) {
        summary.activeCount++;
      } else if (order.status.toLowerCase().includes('zako')) {
        summary.completedCount++;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalWeight - a.totalWeight);
  }, [yearOrders]);

  return (
    <div className="space-y-6 pb-20 overflow-y-auto max-h-[85vh] pr-2 custom-scrollbar">
      {/* Top Banner KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div className="text-slate-400 text-sm font-medium">Bieżący Rok</div>
          </div>
          <div className="text-3xl font-bold text-slate-100">{currentYear}</div>
        </div>

        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 shadow-md">
          <div className="text-slate-400 text-sm font-medium mb-1">Masa Łączna</div>
          <div className="text-3xl font-bold text-emerald-400">{stats.totalWeight.toFixed(2)} <span className="text-lg text-emerald-600">t</span></div>
        </div>

        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 shadow-md">
          <div className="text-slate-400 text-sm font-medium mb-1">Przerobione Roboczogodziny</div>
          <div className="text-3xl font-bold text-amber-400">{stats.totalRbh.toFixed(1)} <span className="text-lg text-amber-600">rbh</span></div>
        </div>

        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 shadow-md">
          <div className="text-indigo-300 text-sm font-medium mb-1">Bieżąca Pracochłonność</div>
          <div className="text-3xl font-bold text-indigo-400">{stats.yieldRbhPt.toFixed(2)} <span className="text-lg text-indigo-600/50">rbh/t</span></div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
          <Building2 className="w-5 h-5 text-indigo-400" />
          Zestawienie według Klientów
        </h3>

        {companySummaries.length === 0 && (
          <div className="text-center text-slate-500 py-10 bg-slate-800/30 rounded-2xl border border-slate-800/50">Brak danych dla bieżącego roku.</div>
        )}

        {companySummaries.map((summary) => {
          const isExpanded = expandedCompanies.has(summary.company);
          const ordersForRbhPt = summary.orders.filter(o => !o.isMinKg);
          const weightForRbhPt = ordersForRbhPt.reduce((sum, o) => sum + o.weightT, 0);
          const rbhForRbhPt = ordersForRbhPt.reduce((sum, o) => sum + o.totalRbh, 0);
          const yieldRbhPt = weightForRbhPt > 0 ? (rbhForRbhPt / weightForRbhPt) : 0;

          const ordersOver1t = ordersForRbhPt.filter(o => o.weightT > 1);
          const weightOver1t = ordersOver1t.reduce((sum, o) => sum + o.weightT, 0);
          const rbhOver1t = ordersOver1t.reduce((sum, o) => sum + o.totalRbh, 0);
          const yieldOver1t = weightOver1t > 0 ? (rbhOver1t / weightOver1t) : 0;

          const ordersUnder1t = ordersForRbhPt.filter(o => o.weightT <= 1);
          const weightUnder1t = ordersUnder1t.reduce((sum, o) => sum + o.weightT, 0);
          const rbhUnder1t = ordersUnder1t.reduce((sum, o) => sum + o.totalRbh, 0);
          const yieldUnder1t = weightUnder1t > 0 ? (rbhUnder1t / weightUnder1t) : 0;
          
          return (
            <div key={summary.company} className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden transition-all duration-200">
              {/* Accordion Header */}
              <button 
                onClick={() => toggleCompany(summary.company)}
                className="w-full p-5 flex flex-col md:flex-row md:items-center justify-between bg-slate-800/80 hover:bg-slate-700/50 transition-colors text-left gap-4"
              >
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-200">{summary.company}</h4>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    {summary.activeCount > 0 && (
                      <span className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        <Clock className="w-3.5 h-3.5" /> {summary.activeCount} w toku
                      </span>
                    )}
                    {summary.completedCount > 0 && (
                      <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {summary.completedCount} zak.
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 md:gap-6 bg-slate-900/50 py-2 px-4 rounded-xl border border-slate-700/30">
                  <div>
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-0.5">Waga</div>
                    <div className="text-slate-200 font-semibold">{summary.totalWeight.toFixed(2)} <span className="text-slate-500 text-sm">t</span></div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-0.5">RBH</div>
                    <div className="text-slate-200 font-semibold">{summary.totalRbh.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-0.5">RBH/t (Śr)</div>
                    <div className="text-indigo-400 font-bold">{yieldRbhPt > 0 ? yieldRbhPt.toFixed(2) : '-'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-0.5">RBH/t &gt;1t</div>
                    <div className="text-emerald-400 font-bold">{yieldOver1t > 0 ? yieldOver1t.toFixed(2) : '-'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-0.5">RBH/t &lt;=1t</div>
                    <div className="text-amber-400 font-bold">{yieldUnder1t > 0 ? yieldUnder1t.toFixed(2) : '-'}</div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="border-t border-slate-700/50 bg-slate-900/40 p-4 space-y-3">
                  <div className="grid grid-cols-12 gap-4 text-xs font-medium text-slate-500 uppercase tracking-wider px-4 pb-2 border-b border-slate-800">
                    <div className="col-span-2">Zlecenie</div>
                    <div className="col-span-4">Opis</div>
                    <div className="col-span-2 text-right">Waga (t)</div>
                    <div className="col-span-1 text-right">RBH</div>
                    <div className="col-span-1 text-right">RBH/t</div>
                    <div className="col-span-2 pl-4">Status</div>
                  </div>

                  {summary.orders.sort((a,b) => (b.weightT - a.weightT)).map(order => {
                    const isOverdue = order.daysToFinish !== undefined && order.daysToFinish < 0;
                    const isEndingSoon = order.daysToFinish !== undefined && order.daysToFinish >= 0 && order.daysToFinish <= 7;
                    const isCompleted = order.status.toLowerCase().includes('zako');
                    const isActive = order.status.toLowerCase().includes('w toku');

                    return (
                      <div key={order.orderNumber} className={`grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-xl border transition-colors ${
                        isActive ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800' : 'bg-slate-900/30 border-slate-800/50 opacity-80 hover:opacity-100 hover:bg-slate-800/50'
                      }`}>
                        <div className="col-span-2 font-mono text-indigo-300">{order.orderNumber}</div>
                        <div className="col-span-4 text-sm text-slate-300 truncate" title={order.description}>{order.description}</div>
                        <div className="col-span-2 text-right font-medium text-emerald-400/90">{order.weightT.toFixed(3)}</div>
                        <div className="col-span-1 text-right font-medium text-amber-400/90">{order.totalRbh.toFixed(1)}</div>
                        <div className="col-span-1 text-right font-medium text-slate-400">
                          {order.isMinKg 
                            ? <span className="text-teal-400 text-xs">{order.rbhPerKgMin.toFixed(2)} min/kg</span>
                            : (order.rbhPerT || (order.weightT > 0 ? (order.totalRbh/order.weightT) : 0)).toFixed(2)}
                        </div>
                        <div className="col-span-2 pl-4 flex flex-col items-start gap-1">
                          {isCompleted && (
                            <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Zakończone
                            </span>
                          )}
                          {isActive && (
                            <>
                              <span className="text-xs text-amber-500 font-medium flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> W toku
                              </span>
                              {order.daysToFinish !== undefined && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                  isOverdue ? 'bg-rose-500/20 text-rose-400' : 
                                  isEndingSoon ? 'bg-amber-500/20 text-amber-400' : 
                                  'bg-slate-700 text-slate-400'
                                }`}>
                                  {isOverdue && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                                  {isOverdue ? 'Opóźnione ' : 'Za '} 
                                  {Math.abs(order.daysToFinish)} dni
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
