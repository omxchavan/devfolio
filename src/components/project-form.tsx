"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DOMAINS } from "@/lib/constants";
import { createProjectSchema } from "@/lib/validations";
import { Loader2, Plus, X, Upload, Link as LinkIcon, GitPullRequest } from "lucide-react";
import { toast } from "sonner";

export function ProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    domain: "" as string,
    githubRepo: "",
    liveLink: "",
    tags: [] as string[],
    images: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      setForm({ ...form, tags: [...form.tags, tag] });
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  }

  async function uploadImage(file: File) {
    setImageUploading(true);
    try {
      // Get signed upload params
      const paramRes = await fetch("/api/upload", { method: "POST" });
      if (!paramRes.ok) throw new Error("Failed to get upload params");
      const params = await paramRes.json();

      // Upload to Cloudinary
      const formData = new FormData();
      
      // Append all signed params from the server
      Object.entries(params).forEach(([key, value]) => {
        if (key !== "cloudName" && key !== "apiKey") {
          formData.append(key, value as string);
        }
      });
      formData.append("api_key", params.apiKey);
      formData.append("file", file);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!uploadRes.ok) throw new Error("Upload failed");

      const data = await uploadRes.json();
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, data.secure_url],
      }));
      toast.success("Image uploaded!");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  }

  function removeImage(url: string) {
    setForm({ ...form, images: form.images.filter((i) => i !== url) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = createProjectSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0]?.toString() || "form";
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create project");
      }

      toast.success("Project created successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GitPullRequest className="h-5 w-5" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              placeholder="My Awesome Project"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what your project does, the problem it solves, and key features..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={4}
              className={errors.description ? "border-destructive" : ""}
            />
            <div className="flex justify-between">
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {form.description.length}/2000
              </p>
            </div>
          </div>

          {/* Domain */}
          <div className="space-y-2">
            <Label>Domain *</Label>
            <Select
              value={form.domain}
              onValueChange={(value) => setForm({ ...form, domain: value ?? "" })}
            >
              <SelectTrigger className={errors.domain ? "border-destructive" : ""}>
                <SelectValue placeholder="Select a domain" />
              </SelectTrigger>
              <SelectContent>
                {DOMAINS.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.domain && (
              <p className="text-xs text-destructive">{errors.domain}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* GitHub Repo */}
          <div className="space-y-2">
            <Label htmlFor="githubRepo">GitHub Repository *</Label>
            <Input
              id="githubRepo"
              placeholder="https://github.com/username/repo"
              value={form.githubRepo}
              onChange={(e) =>
                setForm({ ...form, githubRepo: e.target.value })
              }
              className={errors.githubRepo ? "border-destructive" : ""}
            />
            {errors.githubRepo && (
              <p className="text-xs text-destructive">{errors.githubRepo}</p>
            )}
            <p className="text-xs text-muted-foreground">
              We&apos;ll automatically fetch repo details, contributors, and tech stack
            </p>
          </div>

          {/* Live Link */}
          <div className="space-y-2">
            <Label htmlFor="liveLink">Live Link (optional)</Label>
            <Input
              id="liveLink"
              placeholder="https://myproject.com"
              value={form.liveLink}
              onChange={(e) =>
                setForm({ ...form, liveLink: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag (e.g. react, ml, api)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addTag}
              disabled={form.tags.length >= 10}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {form.tags.length}/10 tags • GitHub topics will also be added automatically
          </p>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Screenshots
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Image grid */}
          {form.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {form.images.map((url) => (
                <div key={url} className="relative group aspect-video rounded-lg overflow-hidden border">
                  <img
                    src={url}
                    alt="Screenshot"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          {form.images.length < 5 && (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                {imageUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">Click to upload</span>
                    <span className="text-xs">PNG, JPG, GIF, WebP (max 5MB)</span>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("File too large. Max 5MB.");
                      return;
                    }
                    uploadImage(file);
                  }
                  e.target.value = "";
                }}
                disabled={imageUploading}
              />
            </label>
          )}
          <p className="text-xs text-muted-foreground">
            {form.images.length}/5 images
          </p>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating project...
          </>
        ) : (
          "Create Project"
        )}
      </Button>
    </form>
  );
}
