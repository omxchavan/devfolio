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
import { createProjectSchema, updateProjectSchema } from "@/lib/validations";
import { Loader2, Plus, X, Upload, Link as LinkIcon, GitPullRequest, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { IProject } from "@/types";

interface ProjectFormProps {
  initialData?: IProject;
}

export function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    domain: initialData?.domain || ("" as string),
    githubRepo: initialData?.githubRepo || "",
    liveLink: initialData?.liveLink || "",
    tags: initialData?.tags || ([] as string[]),
    images: initialData?.images || ([] as string[]),
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

  async function uploadImages(files: FileList) {
    const remainingSlots = 5 - form.images.length;
    if (remainingSlots <= 0) return;

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    if (filesToUpload.length === 0) return;

    setImageUploading(true);
    const loadingToast = toast.loading(`Uploading ${filesToUpload.length} image(s)...`);

    try {
      // Get signed upload params
      const paramRes = await fetch("/api/upload", { method: "POST" });
      if (!paramRes.ok) throw new Error("Failed to get upload params");
      const params = await paramRes.json();

      const uploadPromises = filesToUpload.map(async (file) => {
        if (file.size > 5 * 1024 * 1024) throw new Error(`File ${file.name} too large (max 5MB)`);

        const formData = new FormData();
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
        return data.secure_url;
      });

      const urls = await Promise.all(uploadPromises);
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
      }));
      toast.dismiss(loadingToast);
      toast.success("Images uploaded successfully!");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error instanceof Error ? error.message : "Failed to upload images");
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

    const schema = initialData ? updateProjectSchema : createProjectSchema;
    const result = schema.safeParse(form);
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
      const url = initialData ? `/api/projects/${initialData._id}` : "/api/projects";
      const method = initialData ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${initialData ? "update" : "create"} project`);
      }

      toast.success(`Project ${initialData ? "updated" : "created"} successfully!`);
      if (initialData) {
        router.push(`/project/${initialData._id}`);
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card className="border-border/30 overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/20">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <GitPullRequest className="h-4 w-4 text-primary" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Project Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Smart Attendance System"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={errors.title ? "border-destructive h-11 rounded-xl" : "h-11 rounded-xl"}
            />
            {errors.title && <p className="text-[10px] font-bold text-destructive uppercase tracking-wide">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Brief Summary *</Label>
            <Textarea
              id="description"
              placeholder="Elevator pitch for your project..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className={errors.description ? "border-destructive rounded-xl resize-none" : "rounded-xl resize-none"}
            />
            <div className="flex justify-between items-center px-1">
              {errors.description && <p className="text-[10px] font-bold text-destructive uppercase tracking-wide">{errors.description}</p>}
              <p className="text-[10px] font-bold text-muted-foreground ml-auto">{form.description.length}/2000</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Domain *</Label>
            <Select value={form.domain} onValueChange={(value) => setForm({ ...form, domain: value ?? "" })}>
              <SelectTrigger className={errors.domain ? "border-destructive h-11 rounded-xl" : "h-11 rounded-xl"}>
                <SelectValue placeholder="Categorize your project" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {DOMAINS.map((domain) => <SelectItem key={domain} value={domain}>{domain}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.domain && <p className="text-[10px] font-bold text-destructive uppercase tracking-wide">{errors.domain}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Media & Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/30 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Gallery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {form.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {form.images.map((url) => (
                  <div key={url} className="relative group aspect-video rounded-xl overflow-hidden border border-border/40">
                    <img src={url} alt="Screenshot" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeImage(url)} className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-destructive/90 text-white opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-lg">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {form.images.length < 5 && (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-2xl cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 group">
                <div className="flex flex-col items-center gap-2">
                  {imageUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    <>
                      <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                        <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-extrabold uppercase tracking-tight">Select Screenshots</p>
                        <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-0.5">Multiple Allowed • Max 5</p>
                      </div>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" multiple onChange={(e) => {
                  if (e.target.files) uploadImages(e.target.files);
                  e.target.value = "";
                }} disabled={imageUploading} />
              </label>
            )}
            <p className="text-[10px] text-muted-foreground font-bold px-1 uppercase tracking-widest">
              {5 - form.images.length} slots remaining
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/30 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-primary" />
              Source & Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="githubRepo" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">GitHub URL *</Label>
              <Input id="githubRepo" placeholder="github.com/aissms-ioit/..." value={form.githubRepo} onChange={(e) => setForm({ ...form, githubRepo: e.target.value })} className={errors.githubRepo ? "border-destructive h-11 rounded-xl" : "h-11 rounded-xl"} />
              {errors.githubRepo && <p className="text-[10px] font-bold text-destructive uppercase tracking-wide">{errors.githubRepo}</p>}
            </div>
            <div className="space-y-2 pt-1">
              <Label htmlFor="liveLink" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Live Demo URL</Label>
              <Input id="liveLink" placeholder="https://..." value={form.liveLink} onChange={(e) => setForm({ ...form, liveLink: e.target.value })} className="h-11 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tags Section */}
      <Card className="border-border/30 overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/20">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Project Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Add tech tag (e.g. react, node)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              className="h-11 rounded-xl"
            />
            <Button type="button" variant="secondary" size="icon" onClick={addTag} disabled={form.tags.length >= 10} className="h-11 w-11 rounded-xl shrink-0"><Plus className="h-5 w-5" /></Button>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Recommended Features</p>
            <div className="flex flex-wrap gap-1.5">
              {["react", "nextjs", "typescript", "python", "ml", "database", "api", "mobile", "ios"]
                .filter(tag => !form.tags.includes(tag)).slice(0, 9).map(tag => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary/10 hover:border-primary/40 rounded-lg py-1 px-3 text-[10px] font-bold uppercase tracking-tighter transition-all" onClick={() => form.tags.length < 10 && setForm({ ...form, tags: [...form.tags, tag] })}>
                    + {tag}
                  </Badge>
                ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag) => (
              <Badge key={tag} className="gap-1.5 py-1 px-3 rounded-lg bg-primary/10 text-primary border-primary/20 hover:bg-destructive/10 hover:text-destructive transition-colors group/tag">
                #{tag}
                <X className="h-3 w-3 cursor-pointer opacity-40 group-hover/tag:opacity-100 pointer-events-auto" onClick={() => removeTag(tag)} />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full h-14 rounded-2xl text-lg font-extrabold shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all" disabled={loading}>
        {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing...</> : initialData ? "Confirm Changes" : "Publish Project"}
      </Button>
    </form>
  );
}
