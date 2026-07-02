import { getStatsForYear, getHalaSummarized } from '../data/store';

export function KPIDashboard() {
  const years = ['2026', '2025', '2024', '2023'];
  const data = years.map(year => getStatsForYear(year));
  const halaStats = getHalaSummarized();

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Główne Wskaźniki Efektywności (RBH/t) - Wykonywane Zlecenia
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.map((stat) => (
            <div key={stat.year} className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 shadow-md">
              <div className="flex justify-between items-start mb-4">
                <span className="text-slate-400 font-medium text-sm">Rok {stat.year}</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-slate-500 text-xs mb-1">Masa Łączna [t]</div>
                  <div className="text-xl font-semibold text-emerald-400">{stat.totalWeight.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs mb-1">Suma Roboczogodzin</div>
                  <div className="text-xl font-semibold text-amber-400">{stat.totalRbh.toFixed(1)}</div>
                </div>
                <div className="pt-3 border-t border-slate-700/50 mt-3 grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-indigo-300 text-xs mb-1">RBH/t (Śr)</div>
                    <div className="text-xl font-bold text-indigo-400">
                      {stat.yieldRbhPt > 0 ? stat.yieldRbhPt.toFixed(2) : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-emerald-300 text-xs mb-1">RBH/t &gt;1t</div>
                    <div className="text-xl font-bold text-emerald-400">
                      {stat.yieldOver1t > 0 ? stat.yieldOver1t.toFixed(2) : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-amber-300 text-xs mb-1">RBH/t &lt;=1t</div>
                    <div className="text-xl font-bold text-amber-400">
                      {stat.yieldUnder1t > 0 ? stat.yieldUnder1t.toFixed(2) : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Inwestycja Hala (Projekty 100/24, 100/25, 100/26)
        </h2>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-orange-500/20 shadow-lg">
          <p className="text-sm text-slate-400 mb-6 max-w-2xl">
            Projekty z serii 100 związane z budową hali są sumowane przez kolejne 3 lata ze względu na długoterminowy charakter inwestycji. Zostały one wyłączone z głównych wskaźników produkcyjnych rocznych, aby nie zaburzać wydajności (RBH/t).
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-slate-500 text-sm mb-1 uppercase tracking-wider">Łączna Masa Zleceń 100</div>
              <div className="text-3xl font-bold text-emerald-400">{halaStats.totalWeight.toFixed(2)} <span className="text-lg text-emerald-600">t</span></div>
            </div>
            <div>
              <div className="text-slate-500 text-sm mb-1 uppercase tracking-wider">Przepalone Roboczogodziny</div>
              <div className="text-3xl font-bold text-amber-400">{halaStats.totalRbh.toFixed(1)} <span className="text-lg text-amber-600">rbh</span></div>
            </div>
            <div>
              <div className="text-orange-300 text-sm mb-1 uppercase tracking-wider">Pracochłonność Inwestycji</div>
              <div className="text-3xl font-bold text-orange-400">{halaStats.yieldRbhPt.toFixed(2)} <span className="text-lg text-orange-600">rbh/t</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
