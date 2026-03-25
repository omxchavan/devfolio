"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, User as UserIcon, LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { onboardingSchema } from "@/lib/validations";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    socialLinks: {
      linkedin: "",
      twitter: "",
      portfolio: "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // If already onboarded, redirect away
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
      
      // Force session refresh so the middleware sees the new token
      await update({ onboarded: true });
      
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || initialLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Devfolio!</h1>
        <p className="text-muted-foreground mt-2">Let's set up your profile before you continue.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
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
                rows={4}
                className={errors.bio ? "border-destructive" : ""}
              />
              <div className="flex justify-between">
                {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
                <p className="text-xs text-muted-foreground ml-auto">
                  {form.bio.length}/500
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
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

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Complete Setup
        </Button>
      </form>
    </div>
  );
}
