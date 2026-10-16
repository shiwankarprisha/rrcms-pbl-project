
import { useEffect, useState } from "react";
import "./App.css";

type HealthResponse = {
  status: string;
  application: string;
  message: string;
};

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend returned an error");
        }
        return response.json() as Promise<HealthResponse>;
      })
      .then(setHealth)
      .catch(() => {
        setError("Unable to connect to the RRCMS backend.");
      });
  }, []);

  return (
    <main className="app">
      <section className="panel">
        <p className="eyebrow">RRCMS · PROJECT INITIALIZATION</p>
        <h1>Remote Repair Centre Management System</h1>
        <p className="intro">
          One connected platform for repair management and pickup & delivery.
        </p>

        <div className="status">
          <span className={`dot ${health ? "online" : ""}`} />
          <div>
            <strong>Backend connection</strong>
            <p>
              {health
                ? `${health.application}: ${health.message}`
                : error || "Connecting to the API..."}
            </p>
          </div>
        </div>

        <div className="modules">
          <article>
            <span>01</span>
            <h2>Repair Management</h2>
            <p>Requests, technician assignments and repair progress.</p>
          </article>
          <article>
            <span>02</span>
            <h2>Pickup & Delivery</h2>
            <p>Scheduling, delivery tracking and customer confirmation.</p>
          </article>
        </div>

        <p className="footer">Built with React, TypeScript and Node.js</p>
      </section>
    </main>
  );
}

export default App;