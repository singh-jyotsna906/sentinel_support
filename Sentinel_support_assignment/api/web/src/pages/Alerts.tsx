import { useEffect, useState } from "react";

// Placeholder for alert type
type Alert = {
  id: string;
  customerId: string;
  risk: string;
  status: string;
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [triageEvents, setTriageEvents] = useState<any[]>([]);
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageError, setTriageError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/alerts/list`, {
          // add API key if /api/alerts is protected
          // headers: { "X-API-Key": "agent-key" },
        });
        const data = await res.json();
        setAlerts(data.items || []);
        setHasNext(!!data.nextPage);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
        setAlerts([]);
        setHasNext(false);
      }
      setLoading(false);
    }
    fetchAlerts();
  }, [page]);

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
        Alerts
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
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 12px rgba(99,102,241,0.08)",
            padding: "36px 32px",
            minWidth: 340,
            maxWidth: 900,
            width: "100%",
            marginBottom: 40,
          }}
        >
          <h2 style={{ color: "#6366f1", fontWeight: 600, marginTop: 0, marginBottom: 24 }}>
            Alert List
          </h2>
          {loading ? (
            <div style={{ color: "#6366f1" }}>Loading alerts...</div>
          ) : (
            <>
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
                      <th style={thStyle}>Alert ID</th>
                      <th style={thStyle}>Customer</th>
                      <th style={thStyle}>Risk</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert) => (
                      <tr key={alert.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={tdStyle}>{alert.id}</td>
                        <td style={tdStyle}>
                          <button
                            style={{
                              background: "none",
                              border: "none",
                              color: "#6366f1",
                              textDecoration: "underline",
                              cursor: "pointer",
                              fontWeight: 600,
                              fontSize: "1rem",
                              padding: 0,
                            }}
                            onClick={() =>
                              (window.location.href = `/customer/${alert.customerId}`)
                            }
                            title={`Go to customer ${alert.customerId}`}
                          >
                            {alert.customerId}
                          </button>
                        </td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              color:
                                alert.risk === "high"
                                  ? "#ef4444"
                                  : alert.risk === "medium"
                                  ? "#f59e42"
                                  : "#22c55e",
                              fontWeight: 600,
                              textTransform: "capitalize",
                            }}
                          >
                            {alert.risk}
                          </span>
                        </td>
                        <td style={tdStyle}>{alert.status}</td>
                        <td style={tdStyle}>
                          <button
                            style={actionBtnStyle}
                            onClick={async () => {
                              setSelectedAlert(alert);
                              setDrawerOpen(true);
                              setTriageEvents([]);
                              setTriageLoading(true);
                              setTriageError(null);

                              try {
                                const API_KEY = "agent-key";

                                // 1) Start triage run
                                const res = await fetch(
                                  "http://localhost:3000/api/triage",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      "X-API-Key": API_KEY,
                                    },
                                    body: JSON.stringify({ alertId: alert.id }),
                                  }
                                );
                                const data = await res.json();
                                const runId = data.runId;
                                console.log("Triage run started, runId:", runId);

                                // 2) Open SSE stream with apiKey as query param
                                const es = new EventSource(
                                  `http://localhost:3000/api/triage/${runId}/stream?apiKey=${API_KEY}`
                                );

                                es.onopen = () => {
                                  console.log("SSE connection opened");
                                  setTriageLoading(false);
                                };

                                es.onmessage = (event) => {
                                  console.log("SSE raw event:", event.data);
                                  try {
                                    const parsed = JSON.parse(event.data);
                                    setTriageEvents((prev) => [...prev, parsed]);
                                  } catch (e) {
                                    console.error(
                                      "Failed to parse SSE message",
                                      e,
                                      event.data
                                    );
                                  }
                                };
                              } catch (err) {
                                console.error("Failed to start triage", err);
                                setTriageError("Failed to start triage");
                                setTriageLoading(false);
                              }
                            }}
                          >
                            Open Triage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  marginTop: 24,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <button
                  style={navBtnStyle}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span
                  style={{
                    margin: "0 8px",
                    color: "#6366f1",
                    fontWeight: 600,
                  }}
                >
                  Page {page}
                </span>
                <button
                  style={navBtnStyle}
                  onClick={() => setPage((p) => (hasNext ? p + 1 : p))}
                  disabled={!hasNext}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        {drawerOpen && selectedAlert && (
          <div
            style={{
              border: "none",
              boxShadow: "0 2px 16px rgba(99,102,241,0.18)",
              background: "#fff",
              position: "fixed",
              right: 0,
              top: 0,
              width: 420,
              height: "100%",
              zIndex: 1000,
              padding: "32px 28px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
          >
            <h2 style={{ color: "#6366f1", fontWeight: 600, marginTop: 0 }}>
              Triage Drawer
            </h2>
            <div style={{ marginBottom: 12 }}>
              <b>Alert ID:</b> {selectedAlert.id}
            </div>
            <div style={{ marginBottom: 12 }}>
              <b>Risk:</b>{" "}
              <span
                style={{
                  color:
                    selectedAlert.risk === "high"
                      ? "#ef4444"
                      : selectedAlert.risk === "medium"
                      ? "#f59e42"
                      : "#22c55e",
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {selectedAlert.risk}
              </span>
            </div>
            <div style={{ marginBottom: 18 }}>
              <b>Status:</b> {selectedAlert.status}
            </div>

            {triageLoading && (
              <div style={{ color: "#6366f1" }}>Loading triage...</div>
            )}
            {triageError && (
              <div style={{ color: "#ef4444" }}>{triageError}</div>
            )}

            <div>
              <h3 style={{ color: "#6366f1", fontWeight: 600 }}>
                Streaming Updates
              </h3>
              <ul aria-live="polite" style={{ paddingLeft: 18 }}>
                {triageEvents.map((evt, i) => (
                  <li key={i} style={{ marginBottom: 8 }}>
                    {/* Simple debug rendering so you can see everything */}
                    <pre
                      style={{
                        background: "#f9fafb",
                        padding: "6px 8px",
                        borderRadius: 6,
                        fontSize: "0.85rem",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {JSON.stringify(evt, null, 2)}
                    </pre>
                  </li>
                ))}
              </ul>
            </div>

            <div
              style={{
                marginTop: 16,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button style={actionBtnStyle}>Freeze Card</button>
              <button style={actionBtnStyle}>Open Dispute</button>
              <button style={actionBtnStyle}>Contact Customer</button>
              <button style={actionBtnStyle}>Mark False Positive</button>
            </div>
            <button
              style={{
                ...actionBtnStyle,
                marginTop: 24,
                background: "#e0e7ff",
                color: "#6366f1",
                fontWeight: 700,
              }}
              onClick={() => {
                setDrawerOpen(false);
                setSelectedAlert(null);
                setTriageEvents([]);
              }}
              aria-label="Close Triage Drawer"
            >
              Close
            </button>
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

const navBtnStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "10px 24px",
  fontWeight: 600,
  fontSize: "1rem",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
  transition: "background 0.2s, transform 0.1s",
  outline: "none",
  margin: 0,
};

const actionBtnStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "8px 18px",
  fontWeight: 600,
  fontSize: "1rem",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
  transition: "background 0.2s, transform 0.1s",
  outline: "none",
  margin: 0,
};