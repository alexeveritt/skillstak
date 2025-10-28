import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SkillsTak - Master Your Skills" },
    { name: "description", content: "Welcome to SkillsTak, the platform for mastering your skills through spaced repetition and active learning." },
  ];
}

export default function Home() {
  const appUrl = typeof window !== 'undefined'
    ? 'http://localhost:3001'
    : process.env.APP_URL || 'http://localhost:3001';

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "2rem" }}>
      <header style={{ marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Welcome to SkillsTak</h1>
        <p style={{ fontSize: "1.5rem", color: "#666" }}>Master your skills through spaced repetition</p>
      </header>

      <main style={{ maxWidth: "800px" }}>
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>What is SkillsTak?</h2>
          <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
            SkillsTak is a powerful learning platform that helps you master any skill through
            spaced repetition and active recall. Create custom flashcard decks, track your progress,
            and learn efficiently.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Features</h2>
          <ul style={{ fontSize: "1.1rem", lineHeight: "2" }}>
            <li>Custom flashcard decks for any subject</li>
            <li>Spaced repetition algorithm for optimal learning</li>
            <li>Progress tracking and statistics</li>
            <li>Multi-language support</li>
            <li>Beautiful, intuitive interface</li>
          </ul>
        </section>

        <section>
          <a
            href={appUrl}
            style={{
              display: "inline-block",
              padding: "1rem 2rem",
              fontSize: "1.2rem",
              backgroundColor: "#0066cc",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "bold"
            }}
          >
            Get Started →
          </a>
        </section>
      </main>

      <footer style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid #ddd", color: "#666" }}>
        <p>© 2025 SkillsTak. All rights reserved.</p>
      </footer>
    </div>
  );
}

