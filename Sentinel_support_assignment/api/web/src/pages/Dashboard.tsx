import { useEffect, useState } from "react";

type KPIs = {
  alertsInQueue: number;
  disputesOpened: number;
  avgTriageLatency: number;
};

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPIs | null>(null);

  useEffect(() => {
    async function fetchKPIs() {
      try {
        // Example: Fetch alerts in queue
        const alertsRes = await fetch("http://localhost:3000/api/alerts");
        const alertsData = await alertsRes.json();
        // Example: Fetch disputes opened
        const API_BASE = "http://localhost:3000";
        const API_KEY = "agent-key"; // or read from env in a real app

        // Fetch disputes
        const disputesRes = await fetch(`${API_BASE}/api/action/open-dispute`, {
          headers: {
            "X-API-Key": API_KEY,
          },
        });
        const disputesData = await disputesRes.json();

        // Fetch triage latency
        const triageRes = await fetch(`${API_BASE}/api/triage`, {
          headers: {
            "X-API-Key": API_KEY,
          },
        });
        const triageData = await triageRes.json();

        setKpis({
          alertsInQueue: alertsData.count ?? 0,
          disputesOpened: disputesData.count ?? 0,
          avgTriageLatency: triageData.avgLatency ?? 0,
        });
      } catch (err) {
        setKpis({
          alertsInQueue: 0,
          disputesOpened: 0,
          avgTriageLatency: 0,
        });
      }
    }
    fetchKPIs();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)",
        fontFamily: "Segoe UI, Arial, sans-serif",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          padding: "32px 0 16px 0",
          background: "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)",
          color: "#fff",
          textAlign: "center",
          letterSpacing: "2px",
          fontWeight: 700,
          fontSize: "2.5rem",
          boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
        }}
      >
        Dashboard
      </header>
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 12px rgba(99,102,241,0.08)",
            padding: "36px 32px",
            minWidth: 340,
            maxWidth: 480,
            width: "100%",
            marginBottom: 40,
          }}
        >
          <h2 style={{ color: "#6366f1", fontWeight: 600, marginTop: 0, marginBottom: 24 }}>
            Key Performance Indicators
          </h2>
          {kpis ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <KPI label="Alerts in Queue" value={kpis.alertsInQueue} />
              <KPI label="Disputes Opened" value={kpis.disputesOpened} />
              <KPI label="Avg Triage Latency" value={kpis.avgTriageLatency + " ms"} />
            </div>
          ) : (
            <div style={{ color: "#6366f1" }}>Loading KPIs...</div>
          )}
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 12px rgba(99,102,241,0.08)",
            padding: "32px 28px",
            minWidth: 320,
            maxWidth: 420,
            width: "100%",
          }}
        >
          <h2 style={{ color: "#6366f1", fontWeight: 600, marginTop: 0, marginBottom: 18 }}>
            Quick Filters
          </h2>
          <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
            <button style={filterBtnStyle}>High Risk</button>
            <button style={filterBtnStyle}>Pending OTP</button>
            <button style={filterBtnStyle}>Disputes</button>
          </div>
        </div>
      </main>
      <footer
        style={{
          textAlign: "center",
          color: "#a5b4fc",
          padding: "18px 0 10px 0",
          fontSize: "1rem",
          letterSpacing: "1px",
        }}
      >
        &copy; {new Date().getFullYear()} Sentinel Support Assignment
      </footer>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "1.15rem",
        padding: "10px 0",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <span style={{ color: "#64748b" }}>{label}</span>
      <span style={{ color: "#6366f1", fontWeight: 700, fontSize: "1.2rem" }}>{value}</span>
    </div>
  );
}

const filterBtnStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "12px 24px",
  fontWeight: 600,
  fontSize: "1rem",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
  transition: "background 0.2s, transform 0.1s",
  outline: "none",
  margin: 0,
};
