import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');
const startIdx = content.indexOf('<main className="min-h-[500px]">');
if (startIdx === -1) throw new Error("not found");
const newContent = content.substring(0, startIdx) + `        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={\`px-6 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap \${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }\`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <main className="min-h-[500px]">
          {activeTab === 'aktywne' && (
            <OrdersTable 
              orders={inProgressOrders} 
              title="Aktywne Zlecenia (W Toku)"
              emptyMessage={loading ? 'Trwa pobieranie danych z Google Sheets...' : 'Brak zleceń w tej kategorii.'}
            />
          )}

          {activeTab === 'portale' && (
            <PortalsSection portals={portals} />
          )}

          {activeTab === 'hala' && dashboardHala && (
            <OrdersTable 
              orders={[dashboardHala]} 
              title="INWESTYCJA: HALA"
              emptyMessage="Brak zleceń Hala Invest."
            />
          )}

          {activeTab === 'bledy' && errorWeightOrders.length > 0 && (
            <OrdersTable 
              orders={errorWeightOrders} 
              title="Zlecenia bez wagi (Błąd wyliczeń wagowych)"
              emptyMessage="Brak zleceń bez wagi."
            />
          )}

          {activeTab === 'zakonczone' && (
            <OrdersTable
              orders={completedOrders}
              title="Zakończone Zlecenia (2026)"
              emptyMessage={loading ? 'Trwa pobieranie danych...' : 'Brak zakończonych zleceń w 2026.'}
              disableGrouping={true}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;`;
fs.writeFileSync('src/App.tsx', newContent);
