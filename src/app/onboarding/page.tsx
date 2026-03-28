"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, User as UserIcon, LinkIcon, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { onboardingSchema } from "@/lib/validations";
import { ACADEMIC_YEARS } from "@/lib/constants";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    prn: "",
    year: "" as string,
    socialLinks: {
      linkedin: "",
      twitter: "",
      portfolio: "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.onboarded) {
        router.push("/dashboard");
      } else {
        setForm((prev) => ({
          ...prev,
          name: session.user.name || "",
          email: session.user.email || "",
        }));
        setInitialLoading(false);
      }
    } else if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = onboardingSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const field = err.path.join(".");
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }

      toast.success("Profile setup complete!");
      await update({ onboarded: true });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      if (message.toLowerCase().includes("failed to fetch")) {
        toast.error("Network Error: Please check your internet connection and try again.");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || initialLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Devfolio!</h1>
          <p className="text-muted-foreground mt-2">Let&apos;s set up your profile before you continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a little about yourself..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className={errors.bio ? "border-destructive" : ""}
                />
                <div className="flex justify-between">
                  {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
                  <p className="text-xs text-muted-foreground ml-auto">{form.bio.length}/500</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                College Details
              </CardTitle>
              <CardDescription>Your PRN and academic year for AISSMS IOIT IT department.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prn">PRN (Roll Number)</Label>
                  <Input
                    id="prn"
                    placeholder="e.g. 72312345"
                    value={form.prn}
                    onChange={(e) => setForm({ ...form, prn: e.target.value })}
                    className={errors.prn ? "border-destructive" : ""}
                  />
                  {errors.prn && <p className="text-xs text-destructive">{errors.prn}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year</Label>
                  <select
                    id="year"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-ring"
                  >
                    <option value="">Select year</option>
                    {ACADEMIC_YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  {errors.year && <p className="text-xs text-destructive">{errors.year}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-muted-foreground" />
                Social Links
              </CardTitle>
              <CardDescription>Add your social profiles (optional but recommended)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  value={form.socialLinks.linkedin}
                  onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, linkedin: e.target.value } })}
                  className={errors["socialLinks.linkedin"] ? "border-destructive" : ""}
                />
                {errors["socialLinks.linkedin"] && <p className="text-xs text-destructive">{errors["socialLinks.linkedin"]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter / X Profile</Label>
                <Input
                  id="twitter"
                  placeholder="https://twitter.com/username"
                  value={form.socialLinks.twitter}
                  onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, twitter: e.target.value } })}
                  className={errors["socialLinks.twitter"] ? "border-destructive" : ""}
                />
                {errors["socialLinks.twitter"] && <p className="text-xs text-destructive">{errors["socialLinks.twitter"]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio">Personal Portfolio</Label>
                <Input
                  id="portfolio"
                  placeholder="https://yourwebsite.com"
                  value={form.socialLinks.portfolio}
                  onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, portfolio: e.target.value } })}
                  className={errors["socialLinks.portfolio"] ? "border-destructive" : ""}
                />
                {errors["socialLinks.portfolio"] && <p className="text-xs text-destructive">{errors["socialLinks.portfolio"]}</p>}
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full rounded-lg" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Setup
          </Button>
        </form>
      </div>
    </div>
  );
}
