import { useEffect, useState } from "react";

// Placeholder types
type EvalResult = {
  id: string;
  pass: boolean;
  failureReason?: string;
};

export default function Evals() {
  const [evals, setEvals] = useState<EvalResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch eval results from backend
    setLoading(true);
    setEvals([
      { id: "eval1", pass: true },
      { id: "eval2", pass: false, failureReason: "Policy Denial" },
    ]);
    setLoading(false);
  }, []);

  // Compute confusion matrix (placeholder)
  const confusionMatrix = {
    pass: evals.filter((e) => e.pass).length,
    fail: evals.filter((e) => !e.pass).length,
  };

  // Top failures (placeholder)
  const topFailures = evals.filter((e) => !e.pass).map((e) => e.failureReason || "Unknown");

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
        Evals
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
          <div style={{ color: "#6366f1" }}>Loading evals...</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
              width: "100%",
              maxWidth: 900,
            }}
          >
            {/* Results */}
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
              <h2 style={{ color: "#6366f1", fontWeight: 600, marginTop: 0 }}>Results</h2>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {evals.map((e) => (
                  <li
                    key={e.id}
                    style={{
                      marginBottom: 8,
                      color: e.pass ? "#22c55e" : "#ef4444",
                      fontWeight: 600,
                    }}
                  >
                    <b style={{ color: "#6366f1" }}>{e.id}</b>: {e.pass ? "PASS" : "FAIL"}
                    {e.failureReason && (
                      <span style={{ color: "#64748b", fontWeight: 400 }}>
                        {" "}
                        ({e.failureReason})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
            {/* Confusion Matrix */}
            <section
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 12px rgba(99,102,241,0.08)",
                padding: "32px 24px",
                minWidth: 260,
              }}
            >
              <h2 style={{ color: "#6366f1", fontWeight: 600, marginTop: 0 }}>Confusion Matrix</h2>
              <div style={{ color: "#334155", fontSize: "1.1rem", marginBottom: 8 }}>
                <b style={{ color: "#22c55e" }}>Pass:</b> {confusionMatrix.pass}
              </div>
              <div style={{ color: "#334155", fontSize: "1.1rem" }}>
                <b style={{ color: "#ef4444" }}>Fail:</b> {confusionMatrix.fail}
              </div>
            </section>
            {/* Top Failures */}
            <section
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 12px rgba(99,102,241,0.08)",
                padding: "32px 24px",
                minWidth: 260,
              }}
            >
              <h2 style={{ color: "#6366f1", fontWeight: 600, marginTop: 0 }}>Top Failures</h2>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {topFailures.length === 0 ? (
                  <li style={{ color: "#22c55e" }}>No failures</li>
                ) : (
                  topFailures.map((f, i) => (
                    <li key={i} style={{ marginBottom: 8, color: "#ef4444" }}>
                      {f}
                    </li>
                  ))
                )}
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
