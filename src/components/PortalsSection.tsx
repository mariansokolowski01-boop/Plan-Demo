import React from 'react';
import { OrderData } from '../types';
import { Database } from 'lucide-react';

export const PortalsSection: React.FC<{ portals: OrderData[] }> = ({ portals }) => {
  if (portals.length === 0) return null;

  const totalWeight = portals.reduce((sum, p) => sum + p.weightT, 0);

  return (
    <div className="mt-12 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-300 flex items-center gap-2">
          <Database className="w-5 h-5 text-slate-500" />
          Pula: Portale (Zakończone, 0 RBH)
          <span className="bg-slate-800 text-slate-400 text-xs py-1 px-2 rounded-full ml-2">
            {portals.length}
          </span>
        </h3>
        <div className="text-emerald-400 font-bold text-lg">
          {totalWeight.toFixed(2)} t
        </div>
      </div>
      <div className="p-4 text-sm text-slate-400 flex flex-wrap gap-2">
        {portals.map(p => (
          <span key={p.id} className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors" title={p.description}>
            {p.id} <span className="text-emerald-400/80 ml-1">({p.weightT.toFixed(2)} t)</span>
          </span>
        ))}
      </div>
    </div>
  );
}
