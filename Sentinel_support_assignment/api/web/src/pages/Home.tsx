import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type Customer = {
  id: string;
  name?: string;
};

const Home: React.FC = () => {
  const [customerId, setCustomerId] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/fixtures/customers.json")
      .then(res => res.json())
      .then(data => {
        setCustomers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const goToCustomer = (id?: string) => {
    const cid = id ?? customerId.trim();
    if (cid) {
      navigate(`/customer/${cid}`);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)",
        padding: 0,
        margin: 0,
        fontFamily: "Segoe UI, Arial, sans-serif",
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
        Sentinel Support Portal
      </header>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "40px",
          padding: "40px 20px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* Left: Navigation and Customer Input */}
        <div
          style={{
            flex: "1 1 320px",
            minWidth: 320,
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            gap: "32px",
          }}
        >
          <section
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 2px 12px rgba(99,102,241,0.08)",
              padding: "32px 24px",
              marginBottom: 0,
            }}
          >
            <h2 style={{ margin: "0 0 24px 0", color: "#6366f1", fontWeight: 600 }}>
              Quick Navigation
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <button
                onClick={() => navigate("/dashboard")}
                style={navBtnStyle}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/alerts")}
                style={navBtnStyle}
              >
                Alerts
              </button>
              <button
                onClick={() => navigate("/evals")}
                style={navBtnStyle}
              >
                Evals
              </button>
            </div>
          </section>
        </div>
      </div>
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
};

// Button style for navigation and actions
const navBtnStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "12px 0",
  fontWeight: 600,
  fontSize: "1.1rem",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
  transition: "background 0.2s, transform 0.1s",
  outline: "none",
  width: "100%",
  margin: 0,
};
export default Home;
