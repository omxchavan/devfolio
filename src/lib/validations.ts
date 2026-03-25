import { z } from "zod";
import { DOMAINS } from "@/lib/constants";

const urlSchema = z.string().url().or(z.literal("")).optional();

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be under 100 characters")
    .trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be under 2000 characters")
    .trim(),
  domain: z.enum(DOMAINS).catch("Other" as any),
  githubRepo: z
    .string()
    .url("Must be a valid URL")
    .regex(
      /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/,
      "Must be a valid GitHub repository URL (e.g. https://github.com/user/repo)"
    ),
  liveLink: urlSchema,
  tags: z
    .array(z.string().max(30).trim())
    .max(10, "Maximum 10 tags allowed")
    .default([]),
  images: z
    .array(z.string().url())
    .max(5, "Maximum 5 images allowed")
    .default([]),
});

export const updateProjectSchema = createProjectSchema.partial();

export const updateProfileSchema = z.object({
  bio: z
    .string()
    .max(500, "Bio must be under 500 characters")
    .trim()
    .optional(),
  socialLinks: z
    .object({
      linkedin: urlSchema,
      twitter: urlSchema,
      portfolio: urlSchema,
    })
    .optional(),
});

export const onboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50).trim(),
  email: z.string().email("Must be a valid email").trim(),
  bio: z.string().max(500, "Bio must be under 500 characters").trim().optional(),
  socialLinks: z
    .object({
      linkedin: urlSchema,
      twitter: urlSchema,
      portfolio: urlSchema,
    })
    .optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().max(100).trim().optional(),
  domain: z.enum(DOMAINS).optional(),
  tags: z.string().max(200).optional(),
  sort: z.enum(["latest", "stars"]).default("latest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
