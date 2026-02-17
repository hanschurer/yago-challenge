import { useState, useEffect } from "react";
import { fetchCards, createCard, updateCardStatus, type Card } from "../api";
import {
  Plus,
  PauseCircle,
  PlayCircle,
  Trash2,
  Shield,
  Lock,
} from "lucide-react";
// import clsx from "clsx"; // I realized I can use clsx if installed, but I will stick to inline styles or className logic if simple

export function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newCardLimit, setNewCardLimit] = useState(1000); // $10.00 default

  useEffect(() => {
    loadCards();
  }, []);

  async function loadCards() {
    try {
      const data = await fetchCards();
      setCards(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCreateCard(e: React.FormEvent) {
    e.preventDefault();
    if (!newCardName) return;
    try {
      await createCard(newCardName, newCardLimit * 100); // limit in cents
      setShowCreate(false);
      setNewCardName("");
      setNewCardLimit(1000);
      loadCards();
    } catch (e) {
      alert("Failed to create card");
    }
  }

  async function toggleStatus(card: Card) {
    try {
      const newStatus = card.status === "ACTIVE" ? "FROZEN" : "ACTIVE";
      await updateCardStatus(card.id, newStatus);
      loadCards();
    } catch (e) {
      console.error(e);
    }
  }

  async function terminateCard(id: number) {
    if (
      !confirm(
        "Are you sure you want to terminate this card? This action cannot be undone.",
      )
    )
      return;
    try {
      await updateCardStatus(id, "TERMINATED");
      loadCards();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
            Your Cards
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage your virtual cards and spending limits
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={20} style={{ marginRight: "0.5rem" }} />
          Create New Card
        </button>
      </div>

      {showCreate && (
        <div
          className="glass-panel"
          style={{ padding: "1.5rem", marginBottom: "2rem", maxWidth: "500px" }}
        >
          <h3 style={{ marginBottom: "1rem" }}>New Virtual Card</h3>
          <form
            onSubmit={handleCreateCard}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                Card Name
              </label>
              <input
                className="input-field"
                value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
                placeholder="e.g. AWS Subscription"
                autoFocus
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                Spending Limit ($)
              </label>
              <input
                type="number"
                className="input-field"
                value={newCardLimit}
                onChange={(e) => setNewCardLimit(Number(e.target.value))}
                min="1"
              />
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <button
                type="button"
                className="btn-danger"
                onClick={() => setShowCreate(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                Create Card
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className="glass-panel"
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "0",
              overflow: "hidden",
            }}
          >
            <div className="virtual-card-visual">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "2rem",
                }}
              >
                <Shield size={24} color="#3b82f6" />
                <span
                  className={`status-badge status-${card.status.toLowerCase()}`}
                >
                  {card.status === "FROZEN" && <Lock size={14} />}
                  {card.status}
                </span>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontFamily: "monospace",
                    letterSpacing: "0.1em",
                  }}
                >
                  •••• •••• •••• {card.last4}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.875rem",
                  opacity: 0.8,
                }}
              >
                <span>{card.name}</span>
                <span>EXP 12/28</span>
              </div>
            </div>

            <div style={{ padding: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>
                  Spent / Limit
                </span>
                <span style={{ fontWeight: 600 }}>
                  ${(card.spentAmount / 100).toFixed(2)} / $
                  {(card.limitAmount / 100).toFixed(2)}
                </span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: "6px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "3px",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    width: `${Math.min((card.spentAmount / card.limitAmount) * 100, 100)}%`,
                    height: "100%",
                    background:
                      card.status === "FROZEN"
                        ? "var(--warning)"
                        : "var(--accent-primary)",
                    borderRadius: "3px",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                {card.status !== "TERMINATED" && (
                  <button
                    onClick={() => toggleStatus(card)}
                    className="glass-panel"
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    {card.status === "ACTIVE" ? (
                      <PauseCircle size={16} />
                    ) : (
                      <PlayCircle size={16} />
                    )}
                    {card.status === "ACTIVE" ? "Freeze" : "Unfreeze"}
                  </button>
                )}
                {card.status !== "TERMINATED" && (
                  <button
                    onClick={() => terminateCard(card.id)}
                    className="btn-danger"
                    style={{
                      padding: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Terminate Card"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
