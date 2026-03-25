"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateProfileSchema } from "@/lib/validations";
import { Loader2, Link as LinkIcon, User } from "lucide-react";
import { toast } from "sonner";
import { IUser } from "@/types";

interface ProfileFormProps {
  initialData: IUser;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    bio: initialData?.bio || "",
    socialLinks: {
      linkedin: initialData?.socialLinks?.linkedin || "",
      twitter: initialData?.socialLinks?.twitter || "",
      portfolio: initialData?.socialLinks?.portfolio || "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = updateProfileSchema.safeParse(form);
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
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      router.push(`/profile/${initialData.githubUsername}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Info
          </CardTitle>
          <CardDescription>
            This information will be displayed publicly so be careful what you share.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us a little bit about yourself..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className={errors.bio ? "border-destructive" : ""}
            />
            {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
            <p className="text-xs text-muted-foreground ml-auto max-w-[500px] flex justify-end">
              {form.bio.length}/500
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Social Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              placeholder="https://linkedin.com/in/username"
              value={form.socialLinks.linkedin}
              onChange={(e) =>
                setForm({
                  ...form,
                  socialLinks: { ...form.socialLinks, linkedin: e.target.value },
                })
              }
              className={errors["socialLinks.linkedin"] ? "border-destructive" : ""}
            />
            {errors["socialLinks.linkedin"] && (
              <p className="text-xs text-destructive">{errors["socialLinks.linkedin"]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter/X URL</Label>
            <Input
              id="twitter"
              placeholder="https://twitter.com/username"
              value={form.socialLinks.twitter}
              onChange={(e) =>
                setForm({
                  ...form,
                  socialLinks: { ...form.socialLinks, twitter: e.target.value },
                })
              }
              className={errors["socialLinks.twitter"] ? "border-destructive" : ""}
            />
            {errors["socialLinks.twitter"] && (
              <p className="text-xs text-destructive">{errors["socialLinks.twitter"]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio URL</Label>
            <Input
              id="portfolio"
              placeholder="https://mywebsite.com"
              value={form.socialLinks.portfolio}
              onChange={(e) =>
                setForm({
                  ...form,
                  socialLinks: { ...form.socialLinks, portfolio: e.target.value },
                })
              }
              className={errors["socialLinks.portfolio"] ? "border-destructive" : ""}
            />
            {errors["socialLinks.portfolio"] && (
              <p className="text-xs text-destructive">{errors["socialLinks.portfolio"]}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving changes...
          </>
        ) : (
          "Save changes"
        )}
      </Button>
    </form>
  );
}
