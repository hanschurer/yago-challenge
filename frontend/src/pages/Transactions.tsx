import { useState, useEffect } from "react";
import {
  fetchTransactions,
  fetchCards,
  type Transaction,
  type Card,
} from "../api";
import { format } from "date-fns";
import {
  Search,
  Filter,
  ArrowUpRight,
  // ArrowDownLeft,
  FileText,
  Upload,
} from "lucide-react";

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [txData, cardsData] = await Promise.all([
          fetchTransactions(),
          fetchCards(),
        ]);
        setTransactions(txData);
        setCards(cardsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredTransactions = selectedCardId
    ? transactions.filter((t) => t.cardId === selectedCardId)
    : transactions;

  return (
    <div style={{ padding: "2rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
            Transactions
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            View and manage your spending history
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div
            className="glass-panel"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
            }}
          >
            <Filter
              size={18}
              style={{ marginRight: "0.5rem", color: "var(--text-secondary)" }}
            />
            <select
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-primary)",
                outline: "none",
              }}
              onChange={(e) =>
                setSelectedCardId(
                  e.target.value ? Number(e.target.value) : null,
                )
              }
            >
              <option value="">All Cards</option>
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (..{c.last4})
                </option>
              ))}
            </select>
          </div>
          <button
            className="glass-panel"
            style={{
              padding: "0.5rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Search size={18} />
            Search
          </button>
        </div>
      </header>

      <div className="glass-panel" style={{ overflow: "hidden" }}>
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Merchant</th>
              <th>Date</th>
              <th>Card</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => {
              const card = cards.find((c) => c.id === tx.cardId);
              return (
                <tr key={tx.id}>
                  <td
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(59, 130, 246, 0.1)",
                        padding: "0.5rem",
                        borderRadius: "50%",
                      }}
                    >
                      <ArrowUpRight size={16} color="var(--accent-primary)" />
                    </div>
                    <span style={{ fontWeight: 500 }}>{tx.merchantName}</span>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {format(new Date(tx.date), "MMM dd, yyyy HH:mm")}
                  </td>
                  <td>
                    {card ? (
                      <span
                        style={{
                          fontFamily: "monospace",
                          background: "rgba(255,255,255,0.05)",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.875rem",
                        }}
                      >
                        •••• {card.last4}
                      </span>
                    ) : (
                      "Unknown Card"
                    )}
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${tx.status.toLowerCase() == "completed" ? "active" : "detail"}`}
                      style={{
                        color:
                          tx.status === "COMPLETED"
                            ? "var(--success)"
                            : "var(--warning)",
                        background:
                          tx.status === "COMPLETED"
                            ? "rgba(16, 185, 129, 0.1)"
                            : "rgba(245, 158, 11, 0.1)",
                        borderColor: "transparent",
                      }}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    ${(tx.amount / 100).toFixed(2)}
                  </td>
                  <td>
                    {tx.receiptUrl ? (
                      <a
                        href="#"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          color: "var(--accent-primary)",
                          textDecoration: "none",
                        }}
                      >
                        <FileText size={16} /> View
                      </a>
                    ) : (
                      <button
                        style={{
                          background: "transparent",
                          color: "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                      >
                        <Upload size={14} /> Upload
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            No transactions found.
          </div>
        )}
      </div>
    </div>
  );
}
