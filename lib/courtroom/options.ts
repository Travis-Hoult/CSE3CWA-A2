// lib/courtroom/options.ts
export type Option = {
  id: string;
  title: string;
  verdictCategory: "accessibility" | "security-input" | "auth";
  text: string;
};

export const BASE_OPTIONS: Option[] = [
  { id: "opt-acc",  title: "Fix accessibility issues", verdictCategory: "accessibility",  text: "Add alt text to images site-wide." },
  { id: "opt-sec",  title: "Harden login form",        verdictCategory: "security-input", text: "Enforce non-empty + server-side validation." },
  { id: "opt-auth", title: "Ship MVP auth flow",       verdictCategory: "auth",           text: "Deliver core auth UX and happy-path." },
];

export function getOption(id: string) {
  return BASE_OPTIONS.find(o => o.id === id);
}
