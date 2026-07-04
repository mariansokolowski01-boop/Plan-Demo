import React, { useState, useEffect } from "react";
import { RefreshCw, LayoutList, Clock, AlertCircle } from "lucide-react";
import { OrderData } from "./types";
import { getSheetData } from "./lib/sheets";
import { processOrders } from "./lib/dataProcessing";
import { OrdersTable } from "./components/OrdersTable";
import { PortalsSection } from "./components/PortalsSection";

const PLAN_SHEET_ID = "1f2-asu4IPQRaHsTB0vTff14_i2pHWK8Z";
const RBH_SHEET_ID = "1tt3w3K0TIntDXfhi8l6ZPFzdW8G6bj6cOjMXo5mcQK4";

function App() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [dashboardHala, setDashboardHala] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const planData = await getSheetData(PLAN_SHEET_ID, "2026");
      const rbhData = await getSheetData(RBH_SHEET_ID, "2026");
      const dashboardData = await getSheetData(RBH_SHEET_ID, "Dashboard");

      const processedOrders = processOrders(planData, rbhData);
      setOrders(processedOrders);

      // ZASADA: Hala Invest z zakładki Dashboard
      if (dashboardData && dashboardData.length > 0) {
        for (const row of dashboardData) {
          const cat = row[0]?.toString().trim() || "";
          if (cat === "PROJEKT: Inwestycja Hala") {
            const weightStr =
              row[1]?.toString().replace(/\s/g, "").replace(",", ".") || "0";
            const rbhStr =
              row[2]?.toString().replace(/\s/g, "").replace(",", ".") || "0";
            setDashboardHala({
              id: "100/24",
              company: "Stal-Tech",
              description: "Inwestycja Hala",
              weightT: parseFloat(weightStr) || 0,
              status: "Produkcja",
              totalRbh: parseFloat(rbhStr) || 0,
              deadlineStr: "",
              daysLeft: null,
              isPortal: false,
              isHala100: true,
              isStalTech: true,
              isErrorWeight: false,
            });
            break;
          }
        }
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || "Wystąpił błąd podczas pobierania danych.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ZASADA 2: Wycięcie zleceń 100/24 (Hala Invest)
  const hala100Orders = orders.filter((o) => o.isHala100);
  const validOrders = orders.filter((o) => !o.isHala100);

  // Odizolowanie Zleceń własnych Stal-Tech
  const stalTechOrders = validOrders.filter((o) => o.isStalTech);

  // Zlecenia do dalszego przetwarzania
  const remainingOrders = validOrders.filter((o) => !o.isStalTech);

  // Odizolowanie błędów wagi
  const errorWeightOrders = remainingOrders.filter((o) => o.isErrorWeight);

  const processableOrders = remainingOrders.filter((o) => !o.isErrorWeight);

  // ZASADA 3: Odizolowanie portali
  const portals = processableOrders.filter((o) => o.isPortal);

  // Pozostałe zlecenia (bez Portali)
  const mainOrders = processableOrders.filter((o) => !o.isPortal);

  // Zakładka 'W toku' - odfiltrowanie zleceń "Zakończone"
  const activeOrders = mainOrders.filter(
    (o) => o.status.toLowerCase() !== "zakończone",
  );
  if (dashboardHala) {
    activeOrders.push(dashboardHala);
  }

  // Zakładka 'Zakończone'
  const completedOrdersList = mainOrders.filter(
    (o) => o.status.toLowerCase() === "zakończone",
  );

  // Obliczamy łączną wagę dla każdej firmy dla W Toku
  const companyWeights = new Map<string, number>();
  activeOrders.forEach((o) => {
    companyWeights.set(
      o.company,
      (companyWeights.get(o.company) || 0) + o.weightT,
    );
  });

  const inProgressOrders = activeOrders.sort((a, b) => {
    // Sortowanie: Najpierw po łącznej wadze firmy (malejąco)
    if (a.company !== b.company) {
      const weightA = companyWeights.get(a.company) || 0;
      const weightB = companyWeights.get(b.company) || 0;
      if (weightA !== weightB) {
        return weightB - weightA;
      }
      return a.company.localeCompare(b.company);
    }
    // Następnie Nr Zlecenia (rosnąco)
    return a.id.localeCompare(b.id);
  });

  // Obliczamy łączną wagę dla każdej firmy dla Zakończonych
  const completedPortals = portals.filter(o => o.status.toLowerCase() === 'zakończone');
  if (completedPortals.length > 0) {
    const sumWeight = completedPortals.reduce((sum, p) => sum + p.weightT, 0);
    const sumRbh = completedPortals.reduce((sum, p) => sum + p.totalRbh, 0);
    const svenskCompany = completedOrdersList.find(o => o.company.toLowerCase().includes('svensk'))?.company || 'Svenskinfrateknik';
    
    completedOrdersList.push({
      id: 'SUMA PORTALI',
      company: svenskCompany,
      description: `Zakończone Portale (${completedPortals.length} poz.)`,
      weightT: sumWeight,
      totalRbh: sumRbh,
      status: 'Zakończone',
      deadlineStr: '-',
      daysLeft: null,
      isPortal: true,
      isHala100: false,
      isStalTech: false,
      isErrorWeight: false
    });
  }

  const completedCompanyWeights = new Map<string, number>();
  completedOrdersList.forEach((o) => {
    completedCompanyWeights.set(
      o.company,
      (completedCompanyWeights.get(o.company) || 0) + o.weightT,
    );
  });

  const completedOrders = completedOrdersList.sort((a, b) => {
    // Sortowanie: Najpierw po łącznej wadze firmy (malejąco)
    if (a.company !== b.company) {
      const weightA = completedCompanyWeights.get(a.company) || 0;
      const weightB = completedCompanyWeights.get(b.company) || 0;
      if (weightA !== weightB) {
        return weightB - weightA;
      }
      return a.company.localeCompare(b.company);
    }
    // Następnie Nr Zlecenia (rosnąco)
    if (a.id === 'SUMA PORTALI') return 1;
    if (b.id === 'SUMA PORTALI') return -1;
    return a.id.localeCompare(b.id);
  });

  const [activeTab, setActiveTab] = useState<'aktywne' | 'portale' | 'hala' | 'bledy' | 'zakonczone'>('aktywne');

  const tabs = [
    { id: 'aktywne', label: 'W Toku' },
    ...(errorWeightOrders.length > 0 ? [{ id: 'bledy', label: 'Brak wagi' }] : []),
    { id: 'zakonczone', label: 'Zakończone' }
  ];

  // Reset tab if it becomes hidden
  useEffect(() => {
    
    if (activeTab === 'bledy' && errorWeightOrders.length === 0) setActiveTab('aktywne');
  }, [dashboardHala, errorWeightOrders, activeTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Monitor Zużycia RBH 2026
            </h1>
            <p className="text-slate-400 text-sm mt-1">Śledzenie na żywo</p>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="text-xs text-slate-500 text-right">
                Ostatnia aktualizacja:
                <br />
                <span className="text-slate-300 font-medium">
                  {lastUpdated.toLocaleTimeString("pl-PL")}
                </span>
              </div>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Pobieranie..." : "Aktualizuj"}
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
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

export default App;