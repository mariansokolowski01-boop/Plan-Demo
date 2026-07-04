import React from 'react';
import { OrderData } from '../types';
import { Activity } from 'lucide-react';

interface OrdersTableProps {
  orders: OrderData[];
  title: string;
  emptyMessage: string;
  disableGrouping?: boolean;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders, title, emptyMessage, disableGrouping = false }) => {
  const totalWeight = orders.reduce((sum, o) => sum + o.weightT, 0);
  const totalRbh = orders.reduce((sum, o) => sum + o.totalRbh, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          {title}
          <span className="bg-slate-800 text-slate-400 text-xs py-1 px-2 rounded-full ml-2">
            {orders.length}
          </span>
        </h2>
        <div className="flex gap-6 text-sm">
          <div className="flex flex-col">
            <span className="text-slate-500 font-medium uppercase tracking-wider text-xs">Suma Wagi</span>
            <span className="text-emerald-400 font-bold text-lg">{totalWeight.toFixed(2)} t</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 font-medium uppercase tracking-wider text-xs">Suma RBH</span>
            <span className="text-amber-400 font-bold text-lg">{totalRbh.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-950/50 text-slate-400 text-sm font-medium border-b border-slate-800/50">
              <th className="p-4 pl-6 font-semibold">Firma</th>
              <th className="p-4 font-semibold">Nr Zlecenia</th>
              <th className="p-4 font-semibold w-1/3">Opis</th>
              <th className="p-4 font-semibold text-center">Termin (Deadline)</th>
              <th className="p-4 font-semibold text-center">Dni do końca</th>
              <th className="p-4 font-semibold text-right">Waga [t]</th>
              <th className="p-4 font-semibold text-right">RBH</th>
              <th className="p-4 font-semibold text-right">RBH/t</th>
              <th className="p-4 pr-6 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {orders.length > 0 ? (
              orders.map((order, index) => {
                const rbhPerT = order.weightT > 0 ? order.totalRbh / order.weightT : 0;
                const isNewCompany = !disableGrouping && index > 0 && order.company !== orders[index - 1].company;
                
                return (
                  <tr key={order.id} className={`hover:bg-slate-800/30 transition-colors ${isNewCompany ? 'border-t-2 border-slate-700/80 bg-slate-900/30' : ''}`}>
                    <td className="p-4 pl-6 text-slate-300 font-medium">
                      {disableGrouping ? (
                        <span>{order.company}</span>
                      ) : isNewCompany || index === 0 ? (
                        <span className="font-bold text-slate-200">{order.company}</span>
                      ) : (
                        <span>{order.company}</span>
                      )}
                    </td>
                    <td className="p-4 text-indigo-300 font-mono text-sm">{order.id}</td>
                    <td className="p-4 text-slate-400 text-sm truncate max-w-[300px]" title={order.description}>{order.description}</td>
                    <td className="p-4 text-slate-300 text-center text-sm">{order.deadlineStr || '-'}</td>
                    <td className="p-4 text-center">
                      {order.daysLeft !== null ? (
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${order.daysLeft < 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {order.daysLeft}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-right text-emerald-400/90 font-medium">{order.weightT.toFixed(3)}</td>
                    <td className="p-4 text-right text-amber-400/90 font-medium">{order.totalRbh.toFixed(1)}</td>
                    <td className="p-4 text-right text-indigo-400/90 font-bold">{rbhPerT > 0 ? rbhPerT.toFixed(2) : '-'}</td>
                    <td className="p-4 pr-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        order.status.toLowerCase() === 'zakończone'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {order.status || 'W toku'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
