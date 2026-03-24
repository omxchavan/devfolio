export const DOMAINS = [
  "Web",
  "AI",
  "App",
  "Mobile",
  "DevOps",
  "Data",
  "Security",
  "Blockchain",
  "IoT",
  "Other",
] as const;

export type Domain = (typeof DOMAINS)[number];
