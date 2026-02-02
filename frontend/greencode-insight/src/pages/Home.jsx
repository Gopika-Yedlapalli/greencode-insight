import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <main className="home">
        <section className="hero hero-split">
          <div className="hero-left">
            <h1>Understand Your Code Beyond the Surface</h1>
            <h2>Clearer, Simpler, and More Sustainable Software</h2>

            <p className="hero-subtitle">
              GreenCode Insight is a static analysis platform that evaluates
              code complexity, documentation quality, developer sentiment, and
              development-related carbon impact.
            </p>

            <div className="actions">
              <button
                className="btn primary"
                onClick={() => navigate("/register")}
              >
                Get Started
              </button>
            </div>
          </div>

          <div className="hero-right">
            <div className="code-window">
              <pre className="code messy">
                {`// High complexity & duplicated logic
function calculateScore(type, value) {
  let result = 0;

  if (type === "A") {
    if (value > 50) {
      result = value * 2;
    } else {
      result = value + 10;
    }
  }

  if (type === "B") {
    if (value > 50) {
      result = value * 2;
    } else {
      result = value + 10;
    }
  }

  return result;
}`}
              </pre>
              <pre className="code clean">
                {`// Reduced complexity & maintainable
function calculateScore(type, value) {
  if (type !== "A" && type !== "B") {
    return 0;
  }

  return value > 50
    ? value * 2
    : value + 10;
}`}
              </pre>
            </div>
          </div>
        </section>

        <section className="section light">
          <h2>Features</h2>

          <div className="capabilities">
            <div className="card">
              <h3>Comment Analysis</h3>
              <p>
                Computes comment density, detects duplicated or redundant
                comments, and identifies comment-related code smells such as
                over-commenting.
              </p>
            </div>

            <div className="card">
              <h3>Code Complexity</h3>
              <p>
                Calculates static complexity metrics and maintainability
                indicators to identify hard-to-understand and high-risk code
                sections.
              </p>
            </div>

            <div className="card">
              <h3>Sustainability Impact</h3>
              <p>
                Estimates development-related carbon impact based on code
                complexity and long-term maintenance effort.
              </p>
            </div>
          </div>
        </section>

        <section className="section gain-section">
          <div className="split">
            <div className="split-text">
              <h2>What You Gain</h2>
              <p>
                By analysing both code structure and documentation practices,
                GreenCode Insight helps teams detect maintainability issues
                early and reduce long-term technical debt.
              </p>
              <p>
                This results in faster onboarding, easier code evolution, and
                improved software quality across the software lifecycle.
              </p>
            </div>

            <div className="split-visual">
              <div className="stat-card">
                <p className="stat-value">↓</p>
                <p className="stat-label">Technical Debt</p>
              </div>
              <div className="stat-card">
                <p className="stat-value">↑</p>
                <p className="stat-label">Maintainability</p>
              </div>
              <div className="stat-card">
                <p className="stat-value">✓</p>
                <p className="stat-label">Code Clarity</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section for-section light">
          <div className="for-grid">
            <h2>Who This Is For</h2>

            <div className="for-cards">
              <div className="for-card">
                <h3>Developers</h3>
                <p>
                  Gain deeper insight into code quality, complexity, and
                  documentation effectiveness during development.
                </p>
              </div>

              <div className="for-card">
                <h3>Student Teams</h3>
                <p>
                  Understand the impact of design and documentation decisions
                  while building maintainable systems.
                </p>
              </div>

              <div className="for-card">
                <h3>Software Engineers</h3>
                <p>
                  Identify refactoring opportunities and sustainability concerns
                  in large or evolving codebases.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
