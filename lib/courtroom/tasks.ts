// lib/courtroom/tasks.ts
export type Category = "accessibility" | "security-input" | "auth" | "db-security" | "notice";
export type Task = {
  id: string;
  text: string;
  critical: boolean;
  category: Category;
  verdict?: string; // only for criticals
};

export const tasks: Task[] = [
  // ==== ORIGINAL CRITICALS ====
  {
    id: "t-alt",
    text: "Add alt to <img id='img1'>",
    critical: true,
    category: "accessibility",
    verdict: "Charged under Disability Act for missing alt text.",
  },
  {
    id: "t-xss",
    text: "Fix input validation on login form",
    critical: true,
    category: "security-input",
    verdict: "Negligence → data breach via input validation flaw.",
  },
  {
    id: "t-auth",
    text: "Fix user logins",
    critical: true,
    category: "auth",
    verdict: "Business failure: customers locked out.",
  },
  {
    id: "t-db",
    text: "Secure database configuration",
    critical: true,
    category: "db-security",
    verdict: "Data breach due to insecure DB configuration.",
  },

  // ==== ORIGINAL NOTICES ====
  { id: "n-boss",   text: "Boss: Are you done with Sprint 1?", critical: false, category: "notice" },
  { id: "n-family", text: "Family: Dinner plans tonight?",     critical: false, category: "notice" },
  { id: "n-ui",     text: "Change button color on landing page (cosmetic)", critical: false, category: "notice" },

  // ==== ACCESSIBILITY (added) ====
  {
    id: "acc-aria-critical-1",
    text: "CRITICAL: Primary navigation lacks aria-labels; screen reader users blocked.",
    critical: true,
    category: "accessibility",
    verdict: "Accessibility breach: unlabeled navigation blocks assistive tech.",
  },
  {
    id: "acc-contrast-1",
    text: "NOTICE: CTA buttons have low color contrast (< 4.5:1).",
    critical: false,
    category: "accessibility",
  },
  {
    id: "acc-forms-labels-1",
    text: "NOTICE: Inputs missing associated <label> elements.",
    critical: false,
    category: "accessibility",
  },

  // ==== SECURITY / INPUT (added) ====
  {
    id: "sec-login-critical-1",
    text: "CRITICAL: Login accepts empty password; missing server-side validation.",
    critical: true,
    category: "security-input",
    verdict: "Security violation: missing server-side validation at login.",
  },
  {
    id: "sec-rate-limit-1",
    text: "NOTICE: No rate limiting on /login attempts.",
    critical: false,
    category: "security-input",
  },
  {
    id: "sec-xss-attr-1",
    text: "NOTICE: Unescaped user input placed in data-* attribute (potential XSS).",
    critical: false,
    category: "security-input",
  },

  // ==== AUTH (added) ====
  {
    id: "auth-session-critical-1",
    text: "CRITICAL: Session cookie not HttpOnly/Secure in production.",
    critical: true,
    category: "auth",
    verdict: "Authentication/session misconfiguration enables token theft.",
  },
  {
    id: "auth-logout-1",
    text: "NOTICE: Logout doesn’t invalidate session on server.",
    critical: false,
    category: "auth",
  },
  {
    id: "auth-redirect-1",
    text: "NOTICE: Post-login redirect doesn’t validate returnTo origin.",
    critical: false,
    category: "auth",
  },

  // ==== DB SECURITY (added — optional extra pressure) ====
  {
    id: "db-backup-critical-1",
    text: "CRITICAL: Database backups publicly accessible in S3 bucket.",
    critical: true,
    category: "db-security",
    verdict: "Data exposure due to public backups.",
  },
  {
    id: "db-perms-1",
    text: "NOTICE: App DB user has superuser privileges.",
    critical: false,
    category: "db-security",
  },
  {
    id: "db-tls-1",
    text: "NOTICE: Database connection not enforcing TLS.",
    critical: false,
    category: "db-security",
  },
];
