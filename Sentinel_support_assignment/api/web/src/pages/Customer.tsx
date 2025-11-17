import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Placeholder types
type Transaction = {
  id: string;
  ts: string;
  merchant: string;
  amount_cents: number;
  category: string;
};

type Insight = {
  topMerchants: { merchant: string; count: number }[];
  categories: { name: string; pct: number }[];
  monthlyTrend: { month: string; sum: number }[];
  anomalies: { ts: string; z: number; note: string }[];
};

export default function Customer() {
  const { id } = useParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [insights, setInsights] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // TODO: Fetch transactions and insights from backend
      // Placeholder data
      setTransactions([
        { id: "t1", ts: "2025-07-13", merchant: "ABC", amount_cents: 4999, category: "Shopping" },
        { id: "t2", ts: "2025-07-12", merchant: "QuickCab", amount_cents: 1200, category: "Transport" },
      ]);
      setInsights({
        topMerchants: [{ merchant: "ABC", count: 12 }],
        categories: [{ name: "Transport", pct: 0.23 }],
        monthlyTrend: [{ month: "2025-07", sum: 120045 }],
        anomalies: [{ ts: "2025-07-13", z: 3.1, note: "spike" }],
      });
      setLoading(false);
    }
    fetchData();
  }, [id]);

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
        Customer {id} Timeline
      </header>
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "40px 20px",
        }}
      >
        {loading ? (
          <div style={{ color: "#6366f1" }}>Loading...</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
              width: "100%",
              maxWidth: 1200,
            }}
          >
            {/* Transactions */}
            <section
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 12px rgba(99,102,241,0.08)",
                padding: "32px 24px",
                minWidth: 320,
                marginBottom: 0,
                gridColumn: "1 / 3",
              }}
            >
              <h2 style={{ color: "#6366f1", fontWeight: 600, marginTop: 0 }}>Transactions</h2>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: "#fff",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f1f5f9" }}>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Merchant</th>
                      <th style={thStyle}>Amount</th>
                      <th style={thStyle}>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr key={txn.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={tdStyle}>{txn.ts}</td>
                        <td style={tdStyle}>{txn.merchant}</td>
                        <td style={tdStyle}>₹{(txn.amount_cents / 100).toFixed(2)}</td>
                        <td style={tdStyle}>{txn.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            {/* Category Spend */}
            <section
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 12px rgba(99,102,241,0.08)",
                padding: "32px 24px",
                minWidth: 260,
              }}
            >
              <h2 style={{ color: "#6366f1", fontWeight: 600, marginTop: 0 }}>Category Spend</h2>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {insights?.categories.map((cat) => (
                  <li key={cat.name} style={{ marginBottom: 8, color: "#334155" }}>
                    <b style={{ color: "#6366f1" }}>{cat.name}</b>: {(cat.pct * 100).toFixed(1)}%
                  </li>
                ))}
              </ul>
            </section>
            {/* Merchant Mix */}
            <section
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 12px rgba(99,102,241,0.08)",
                padding: "32px 24px",
                minWidth: 260,
              }}
            >
              <h2 style={{ color: "#6366f1", fontWeight: 600, marginTop: 0 }}>Merchant Mix</h2>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {insights?.topMerchants.map((m) => (
                  <li key={m.merchant} style={{ marginBottom: 8, color: "#334155" }}>
                    <b style={{ color: "#6366f1" }}>{m.merchant}</b>: {m.count}
                  </li>
                ))}
              </ul>
            </section>
            {/* Anomalies */}
            <section
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 12px rgba(99,102,241,0.08)",
                padding: "32px 24px",
                minWidth: 260,
                gridColumn: "1 / 3",
              }}
            >
              <h2 style={{ color: "#6366f1", fontWeight: 600, marginTop: 0 }}>Anomalies</h2>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {insights?.anomalies.map((a) => (
                  <li key={a.ts} style={{ marginBottom: 8, color: "#334155" }}>
                    <b style={{ color: "#6366f1" }}>{a.ts}</b>: {a.note} (z={a.z.toFixed(2)})
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
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

const thStyle: React.CSSProperties = {
  padding: "12px 10px",
  textAlign: "left",
  color: "#6366f1",
  fontWeight: 700,
  fontSize: "1.05rem",
  borderBottom: "2px solid #e0e7ff",
  background: "#f1f5f9",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 10px",
  fontSize: "1rem",
  color: "#334155",
  background: "#fff",
};
