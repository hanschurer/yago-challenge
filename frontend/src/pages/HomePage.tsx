import {
  Rocket,
  Terminal,
  Database,
  Code2,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  ArrowRight,
  Layers,
  Shield,
  Zap,
} from "lucide-react";

export function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {/* Hero Section */}
      <section className="challenge-hero">
        <div className="hero-glow" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <span className="challenge-badge">
              <Rocket size={14} />
              Coding Challenge
            </span>
            <span className="challenge-badge challenge-badge--version">
              v1.0
            </span>
          </div>
          <h1
            style={{
              fontSize: "2.75rem",
              lineHeight: 1.15,
              marginBottom: "1rem",
              background: "linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Fintech Card Management
            <br />
            System Challenge
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.125rem",
              maxWidth: "680px",
              lineHeight: 1.7,
            }}
          >
            Build a full-stack virtual card management platform inspired by{" "}
            <strong style={{ color: "var(--accent-primary)" }}>
              Privacy.com
            </strong>
            . This challenge tests your ability to work with a modern TypeScript
            stack — including Express, Drizzle ORM, PostgreSQL, Zod validation,
            and React — to create, manage, and transact with virtual debit
            cards.
          </p>
        </div>
      </section>

      {/* Tech Stack */}
      <section>
        <h2
          style={{
            fontSize: "1.5rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Layers size={22} color="var(--accent-primary)" />
          Tech Stack
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          {[
            {
              icon: <Code2 size={20} />,
              label: "TypeScript",
              desc: "End-to-end type safety",
            },
            {
              icon: <Zap size={20} />,
              label: "Express v5",
              desc: "Backend REST API",
            },
            {
              icon: <Database size={20} />,
              label: "PostgreSQL + Drizzle",
              desc: "Database & ORM",
            },
            {
              icon: <Shield size={20} />,
              label: "Zod",
              desc: "Runtime validation",
            },
            {
              icon: <CreditCard size={20} />,
              label: "React + Vite",
              desc: "Frontend SPA",
            },
            {
              icon: <Layers size={20} />,
              label: "Recharts",
              desc: "Data visualization",
            },
          ].map((tech, i) => (
            <div
              key={i}
              className="glass-panel tech-card"
              style={{ padding: "1.25rem" }}
            >
              <div
                style={{
                  color: "var(--accent-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                {tech.icon}
              </div>
              <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                {tech.label}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                }}
              >
                {tech.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Challenge Description */}
      <section className="glass-panel" style={{ padding: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertTriangle size={22} color="var(--warning)" />
          The Challenge
        </h2>
        <div
          style={{
            color: "var(--text-secondary)",
            lineHeight: 1.8,
            fontSize: "1rem",
          }}
        >
          <p style={{ marginBottom: "1rem" }}>
            You've joined a fintech startup that provides virtual debit cards
            for secure online payments. The previous developer left behind a
            partially-working codebase with several{" "}
            <strong style={{ color: "var(--danger)" }}>
              bugs and missing features
            </strong>
            . Your job is to get the system production-ready.
          </p>
          <p style={{ marginBottom: "1rem" }}>
            The system should allow users to:
          </p>
          <ul
            style={{
              paddingLeft: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <li>Create unlimited virtual cards with custom spending limits</li>
            <li>Freeze and unfreeze cards instantly</li>
            <li>Terminate cards permanently</li>
            <li>
              Simulate transactions against cards (with limit enforcement)
            </li>
            <li>
              View a transaction history with filtering and receipt upload
            </li>
            <li>See a real-time dashboard with spending trends</li>
            <li>
              <strong>NEW:</strong> Resumable large file downloads (compliance
              reports)
            </li>
          </ul>
        </div>
      </section>

      {/* Step-by-Step Instructions */}
      <section>
        <h2
          style={{
            fontSize: "1.5rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Terminal size={22} color="var(--success)" />
          Step-by-Step: Reproduce the Challenge
        </h2>

        <div className="steps-container">
          {/* Step 1 */}
          <div className="step-card glass-panel">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3 className="step-title">Clone the Repository</h3>
              <p className="step-desc">
                Start by cloning the challenge repo and checking out the{" "}
                <code>main</code> branch (the broken state).
              </p>
              <div className="code-block">
                <code>
                  git clone &lt;repo-url&gt;{"\n"}
                  cd yago-challenge{"\n"}
                  git checkout main
                </code>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="step-card glass-panel">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3 className="step-title">Set Up PostgreSQL</h3>
              <p className="step-desc">
                Ensure you have PostgreSQL running locally (v14+ recommended).
                Create a new database for the challenge.
              </p>
              <div className="code-block">
                <code>
                  createdb yago_challenge{"\n"}
                  {"\n"}# Or with psql:{"\n"}
                  psql -c "CREATE DATABASE yago_challenge;"
                </code>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="step-card glass-panel">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3 className="step-title">Configure Backend Environment</h3>
              <p className="step-desc">
                Navigate to the <code>backend/</code> directory, install
                dependencies, and create your <code>.env</code> file.
              </p>
              <div className="code-block">
                <code>
                  cd backend{"\n"}
                  npm install{"\n"}
                  {"\n"}# Create .env file{"\n"}
                  echo
                  'DATABASE_URL="postgres://username:password@localhost:5432/yago_challenge"'
                  &gt; .env
                </code>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="step-card glass-panel">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3 className="step-title">Run Database Migrations</h3>
              <p className="step-desc">
                Generate and apply Drizzle ORM migrations to create the database
                schema (users, cards, transactions tables with enums).
              </p>
              <div className="code-block">
                <code>
                  npm run db:generate{"\n"}
                  npm run db:migrate
                </code>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="step-card glass-panel">
            <div className="step-number">5</div>
            <div className="step-content">
              <h3 className="step-title">Start the Backend Server</h3>
              <p className="step-desc">
                Launch the Express API server. It will auto-seed demo data on
                first load if the database is empty.
              </p>
              <div className="code-block">
                <code>
                  npm run dev{"\n"}
                  {"\n"}# Server runs at http://localhost:3000
                </code>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="step-card glass-panel">
            <div className="step-number">6</div>
            <div className="step-content">
              <h3 className="step-title">Set Up & Start the Frontend</h3>
              <p className="step-desc">
                In a new terminal, navigate to the <code>frontend/</code>{" "}
                directory, install dependencies, and start the Vite dev server.
              </p>
              <div className="code-block">
                <code>
                  cd frontend{"\n"}
                  npm install{"\n"}
                  npm run dev{"\n"}
                  {"\n"}# App runs at http://localhost:5173
                </code>
              </div>
            </div>
          </div>

          {/* Step 7 */}
          <div className="step-card glass-panel">
            <div className="step-number">7</div>
            <div className="step-content">
              <h3 className="step-title">Explore & Identify Issues</h3>
              <p className="step-desc">
                Open the app in your browser and explore every feature. Look for
                bugs, broken interactions, and missing functionality:
              </p>
              <ul className="step-checklist">
                <li>
                  <CheckCircle2 size={16} color="var(--success)" />
                  <span>Does the Dashboard load data correctly?</span>
                </li>
                <li>
                  <CheckCircle2 size={16} color="var(--success)" />
                  <span>Can you create a new virtual card?</span>
                </li>
                <li>
                  <CheckCircle2 size={16} color="var(--success)" />
                  <span>Do freeze/unfreeze and terminate actions work?</span>
                </li>
                <li>
                  <CheckCircle2 size={16} color="var(--success)" />
                  <span>Can transactions be simulated (via API)?</span>
                </li>
                <li>
                  <CheckCircle2 size={16} color="var(--success)" />
                  <span>Does the spending chart visualize real data?</span>
                </li>
                <li>
                  <CheckCircle2 size={16} color="var(--success)" />
                  <span>Are validation errors handled gracefully?</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Step 8 */}
          <div className="step-card glass-panel">
            <div className="step-number">8</div>
            <div className="step-content">
              <h3 className="step-title">Fix & Implement</h3>
              <p className="step-desc">
                Fix the bugs you've found and implement any missing features.
                When you're done, push your changes to a new branch.
              </p>
              <div className="code-block">
                <code>
                  git checkout -b solution{"\n"}
                  git add .{"\n"}
                  git commit -m "fix: resolve all challenge issues"{"\n"}
                  git push origin solution
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Branch Note */}
      <section
        className="glass-panel"
        style={{
          padding: "2rem",
          borderLeft: "4px solid var(--accent-primary)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <GitBranch size={22} color="var(--accent-primary)" />
          <h2 style={{ fontSize: "1.25rem" }}>Solution Branch</h2>
        </div>
        <p
          style={{
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            marginBottom: "1rem",
          }}
        >
          A reference solution is available on the{" "}
          <code
            style={{
              background: "rgba(59, 130, 246, 0.15)",
              padding: "0.2rem 0.5rem",
              borderRadius: "4px",
              color: "var(--accent-primary)",
              fontWeight: 600,
            }}
          >
            solution
          </code>{" "}
          branch. Try to solve the challenge yourself first before looking at
          the reference implementation!
        </p>
        <div className="code-block">
          <code>git checkout solution # View the reference solution</code>
        </div>
      </section>

      {/* Quick Links */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem",
          paddingBottom: "2rem",
        }}
      >
        <a href="/dashboard" className="quick-link glass-panel">
          <div>
            <h3 style={{ marginBottom: "0.25rem" }}>Dashboard</h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
              }}
            >
              View spending overview & trends
            </p>
          </div>
          <ArrowRight size={20} color="var(--text-secondary)" />
        </a>
        <a href="/cards" className="quick-link glass-panel">
          <div>
            <h3 style={{ marginBottom: "0.25rem" }}>Cards</h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
              }}
            >
              Manage virtual cards & limits
            </p>
          </div>
          <ArrowRight size={20} color="var(--text-secondary)" />
        </a>
        <a href="/transactions" className="quick-link glass-panel">
          <div>
            <h3 style={{ marginBottom: "0.25rem" }}>Transactions</h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
              }}
            >
              Browse transaction history
            </p>
          </div>
          <ArrowRight size={20} color="var(--text-secondary)" />
        </a>
        <a href="/download" className="quick-link glass-panel">
          <div>
            <h3 style={{ marginBottom: "0.25rem" }}>Downloads</h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
              }}
            >
              Test resumable file downloads
            </p>
          </div>
          <ArrowRight size={20} color="var(--text-secondary)" />
        </a>
      </section>
    </div>
  );
}
