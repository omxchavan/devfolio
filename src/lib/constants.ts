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

export const ACADEMIC_YEARS = ["FY", "SY", "TY", "BE"] as const;

export type AcademicYear = (typeof ACADEMIC_YEARS)[number];

export const COMMON_TAGS = [
  "React",
  "Next.js",
  "Tailwind",
  "Node.js",
  "Python",
  "Java",
  "ML",
  "AI",
  "MongoDB",
  "Firebase",
  "Flutter",
  "Android",
  "Arduino",
  "IoT",
  "Docker",
];

