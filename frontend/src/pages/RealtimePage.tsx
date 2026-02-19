import { useState, useEffect, useRef } from "react";
import { toggleSimulation, pollTransactions, getSSEUrl } from "../api";
import { Zap, RefreshCcw, Play, Square, Clock, Wifi } from "lucide-react";

export function RealtimePage() {
  const [isSimulating, setIsSimulating] = useState(false);

  // Polling State
  const [pollEvents, setPollEvents] = useState<any[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // SSE State
  const [sseEvents, setSseEvents] = useState<any[]>([]);
  const [sseStatus, setSseStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const eventSourceRef = useRef<EventSource | null>(null);

  // Toggle Simulation
  const handleSimulationToggle = async () => {
    try {
      const newState = !isSimulating;
      await toggleSimulation(newState);
      setIsSimulating(newState);
    } catch (e) {
      console.error(e);
    }
  };

  // Start/Stop Polling
  // Ref for polling loop to access latest ID
  const latestPollIdRef = useRef(0);

  useEffect(() => {
    if (isSimulating) {
      setIsPolling(true);
      pollIntervalRef.current = setInterval(async () => {
        try {
          const events = await pollTransactions(latestPollIdRef.current);
          if (events.length > 0) {
            setPollEvents((prev) => [...events, ...prev].slice(0, 20));
            latestPollIdRef.current = Math.max(...events.map((e: any) => e.id));
          }
        } catch (e) {
          console.error("Poll failed", e);
        }
      }, 3000); // 3 second polling
    } else {
      setIsPolling(false);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isSimulating]);

  // SSE Connection
  useEffect(() => {
    if (isSimulating) {
      setSseStatus("connecting");
      const url = getSSEUrl();
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () => {
        setSseStatus("connected");
      };

      es.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // Initial connection message
        if (data.type === "connected") return;

        // Transaction message
        if (data.type === "transaction") {
          setSseEvents((prev) => [data.data, ...prev].slice(0, 20));
        }
      };

      es.onerror = (err) => {
        console.error("SSE Error", err);
        setSseStatus("disconnected");
        es.close();
      };
    } else {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        setSseStatus("disconnected");
      }
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [isSimulating]);

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <header
        style={{
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
            Real-time Comparison
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Polling vs. Server-Sent Events (SSE) for transaction notifications.
          </p>
        </div>
        <button
          className={isSimulating ? "btn-danger" : "btn-primary"}
          onClick={handleSimulationToggle}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            minWidth: "160px",
            justifyContent: "center",
          }}
        >
          {isSimulating ? (
            <Square size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" />
          )}
          {isSimulating ? "Stop Simulation" : "Start Simulation"}
        </button>
      </header>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}
      >
        {/* Polling Column */}
        <div
          className="glass-panel"
          style={{
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            height: "600px",
          }}
        >
          <div
            style={{
              paddingBottom: "1rem",
              borderBottom: "1px solid var(--border-color)",
              marginBottom: "1rem",
            }}
          >
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--accent-primary)",
              }}
            >
              <RefreshCcw size={20} />
              Short Polling
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                marginTop: "0.5rem",
                color: "var(--text-secondary)",
              }}
            >
              <Clock size={14} />
              <span>Interval: 3000ms</span>
              {isPolling && (
                <span
                  className="status-badge status-active"
                  style={{ marginLeft: "auto" }}
                >
                  Active
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {pollEvents.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  marginTop: "2rem",
                }}
              >
                Waiting for polling data...
              </div>
            ) : (
              pollEvents.map((tx) => (
                <TransactionItem key={tx.id} tx={tx} source="Poll" />
              ))
            )}
          </div>
        </div>

        {/* SSE Column */}
        <div
          className="glass-panel"
          style={{
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            height: "600px",
          }}
        >
          <div
            style={{
              paddingBottom: "1rem",
              borderBottom: "1px solid var(--border-color)",
              marginBottom: "1rem",
            }}
          >
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--success)",
              }}
            >
              <Zap size={20} />
              Server-Sent Events
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                marginTop: "0.5rem",
                color: "var(--text-secondary)",
              }}
            >
              <Wifi size={14} />
              <span>Push Connection</span>
              {sseStatus === "connected" && (
                <span
                  className="status-badge status-active"
                  style={{ marginLeft: "auto" }}
                >
                  Connected
                </span>
              )}
              {sseStatus === "disconnected" && (
                <span
                  className="status-badge status-terminated"
                  style={{ marginLeft: "auto" }}
                >
                  Disconnected
                </span>
              )}
              {sseStatus === "connecting" && (
                <span
                  className="status-badge status-frozen"
                  style={{ marginLeft: "auto" }}
                >
                  Connecting...
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {sseEvents.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  marginTop: "2rem",
                }}
              >
                Waiting for stream data...
              </div>
            ) : (
              sseEvents.map((tx) => (
                <TransactionItem key={tx.id} tx={tx} source="SSE" />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TransactionItem({ tx, source }: { tx: any; source: string }) {
  const isDecline = tx.status !== "COMPLETED";
  return (
    <div
      style={{
        padding: "0.75rem",
        borderRadius: "8px",
        background: "var(--bg-secondary)",
        borderLeft: `4px solid ${isDecline ? "var(--danger)" : "var(--success)"}`,
        animation: "fadeInUp 0.3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "0.25rem",
        }}
      >
        <span style={{ fontWeight: 600 }}>{tx.merchantName}</span>
        <span
          style={{
            fontWeight: 600,
            color: isDecline ? "var(--danger)" : "var(--text-primary)",
          }}
        >
          - ${(tx.amount / 100).toFixed(2)}
        </span>
      </div>
      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--text-secondary)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>
          {source} ID: {tx.id}
        </span>
        <span>{new Date(tx.date).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
