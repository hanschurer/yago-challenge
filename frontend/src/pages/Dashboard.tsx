import { useState, useEffect } from "react";
import {
  fetchCards,
  fetchTransactions,
  type Card,
  type Transaction,
  seedDatabase,
} from "../api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  ArrowUpRight,
  // ArrowDownLeft,
  DollarSign,
  Activity,
} from "lucide-react";
import { format } from "date-fns";

export function Dashboard() {
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cardsData, txData] = await Promise.all([
          fetchCards(),
          fetchTransactions(),
        ]);

        // If no data, seed it
        if (cardsData.length === 0) {
          await seedDatabase();
          const [newCards, newTx] = await Promise.all([
            fetchCards(),
            fetchTransactions(),
          ]);
          setCards(newCards);
          setTransactions(newTx);
        } else {
          setCards(cardsData);
          setTransactions(txData);
        }
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalSpent =
    cards.reduce((acc, card) => acc + card.spentAmount, 0) / 100;
  const activeCards = cards.filter((c) => c.status === "ACTIVE").length;

  // Prepare chart data (mock daily aggregation)
  const chartData = transactions
    .slice(0, 10)
    .map((t) => ({
      name: format(new Date(t.date), "MMM dd"),
      amount: t.amount / 100,
    }))
    .reverse();

  if (loading)
    return <div style={{ padding: "2rem" }}>Loading Dashboard...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
            Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Overview of your financial activity
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <p
                style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
              >
                Total Spent
              </p>
              <h3 style={{ fontSize: "1.875rem", marginTop: "0.5rem" }}>
                ${totalSpent.toLocaleString()}
              </h3>
            </div>
            <div
              style={{
                background: "rgba(59, 130, 246, 0.2)",
                padding: "0.5rem",
                borderRadius: "8px",
                color: "var(--accent-primary)",
              }}
            >
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <p
                style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
              >
                Active Cards
              </p>
              <h3 style={{ fontSize: "1.875rem", marginTop: "0.5rem" }}>
                {activeCards}
              </h3>
            </div>
            <div
              style={{
                background: "rgba(16, 185, 129, 0.2)",
                padding: "0.5rem",
                borderRadius: "8px",
                color: "var(--success)",
              }}
            >
              <Activity size={24} />
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <p
                style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
              >
                Recent Transactions
              </p>
              <h3 style={{ fontSize: "1.875rem", marginTop: "0.5rem" }}>
                {transactions.length}
              </h3>
            </div>
            <div
              style={{
                background: "rgba(245, 158, 11, 0.2)",
                padding: "0.5rem",
                borderRadius: "8px",
                color: "var(--warning)",
              }}
            >
              <ArrowUpRight size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-panel" style={{ padding: "2rem", height: "400px" }}>
        <h3 style={{ marginBottom: "1.5rem" }}>Spending Trends</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "#f8fafc" }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
