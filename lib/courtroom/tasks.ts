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
  { id: "t-alt",  text: "Add alt to <img id='img1'>",        critical: true,  category: "accessibility",
    verdict: "Charged under Disability Act for missing alt text." },
  { id: "t-xss",  text: "Fix input validation on login form", critical: true,  category: "security-input",
    verdict: "Negligence → data breach via input validation flaw." },
  { id: "t-auth", text: "Fix user logins",                    critical: true,  category: "auth",
    verdict: "Business failure: customers locked out." },
  { id: "t-db",   text: "Secure database configuration",      critical: true,  category: "db-security",
    verdict: "Data breach due to insecure DB configuration." },

  // non-critical distractions (no verdict text)
  { id: "n-boss",   text: "Boss: Are you done with Sprint 1?",           critical: false, category: "notice" },
  { id: "n-family", text: "Family: Dinner plans tonight?",               critical: false, category: "notice" },
  { id: "n-ui",     text: "Change button color on landing page (cosmetic)", critical: false, category: "notice" },
];
