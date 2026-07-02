import { useState, useMemo } from 'react';
import { allOrders } from '../data/store';
import { Search, AlertTriangle, Database } from 'lucide-react';

export function OrderSearch() {
  const [searchTerm, setSearchTerm] = useState('');

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const lowerTerm = searchTerm.toLowerCase();
    return allOrders.filter(o => 
      o.orderNumber.toLowerCase().includes(lowerTerm) ||
      o.company.toLowerCase().includes(lowerTerm) ||
      o.description.toLowerCase().includes(lowerTerm)
    ).sort((a, b) => {
      // Sort primarily by year (descending), then by order number
      const yearDiff = Number(b.year) - Number(a.year);
      return yearDiff !== 0 ? yearDiff : a.orderNumber.localeCompare(b.orderNumber);
    });
  }, [searchTerm]);

  return (
    <div className="space-y-6 pb-20 max-h-[85vh] overflow-y-auto custom-scrollbar">
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center mb-2">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-lg"
              placeholder="Szukaj zlecenia, nazwy klienta lub opisu... (np. 043/24, Gurit)"
            />
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-3 px-2">
          Wyszukuje we wszystkich zleceniach w bazie. Możesz używać fragmentów nazw lub numerów.
        </p>
      </div>

      {searchTerm.trim() !== '' && (
        <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/80 sticky top-0 z-10 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              Wyniki Wyszukiwania
              <span className="ml-2 bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">{results.length}</span>
            </h3>
          </div>
          
          <div className="p-5 space-y-3">
            {results.length > 0 ? (
              results.map((order) => {
                const yieldRbhPt = order.rbhPerT || (order.weightT > 0 ? order.totalRbh / order.weightT : 0);
                const isHighYield = !order.isMinKg && yieldRbhPt > 500; // Flagging potentially erroneous/high RBH
                
                return (
                  <div key={`${order.orderNumber}-${order.company}`} className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-indigo-400 font-mono font-bold text-lg">{order.orderNumber}</span>
                          <span className="text-slate-300 font-medium bg-slate-800 px-2.5 py-1 rounded-md text-sm">{order.company}</span>
                          <span className={`text-xs px-2 py-1 rounded-md font-semibold ${
                            order.status.toLowerCase().includes('zako') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-slate-400 text-sm mt-2 max-w-2xl">
                          {order.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
                      <div>
                        <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Masa</div>
                        <div className="text-slate-200 font-bold">{order.weightT.toFixed(3)} <span className="text-slate-500 font-normal text-sm">t</span></div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Suma RBH</div>
                        <div className="text-amber-400 font-bold">{order.totalRbh.toFixed(1)} <span className="text-slate-500 font-normal text-sm">rbh</span></div>
                      </div>
                      <div className={isHighYield ? 'bg-rose-500/10 p-2 rounded-lg -m-2' : ''}>
                        <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
                          {order.isMinKg ? 'min / kg' : 'RBH / t'}
                        </div>
                        <div className={`font-bold flex items-center gap-2 ${isHighYield ? 'text-rose-400' : (order.isMinKg ? 'text-teal-400' : 'text-indigo-400')}`}>
                          {order.isMinKg ? order.rbhPerKgMin.toFixed(2) : yieldRbhPt.toFixed(2)}
                          {isHighYield && <AlertTriangle className="w-4 h-4 text-rose-400" title="Bardzo wysoki wskaźnik - możliwy błąd w danych" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-slate-500 py-12">
                Brak wyników dla frazy "{searchTerm}".
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
