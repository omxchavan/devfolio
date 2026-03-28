import { createProjectSchema } from "./src/lib/validations";
const data = {
  title: "Test Project",
  description: "This is a test project with enough characters",
  domain: "Web",
  githubRepo: "https://github.com/user/repo",
  liveLink: "",
  tags: ["test"],
  images: []
};
try {
  createProjectSchema.parse(data);
  console.log("Schema parse success!");
} catch (e) {
  console.log("Schema parse error:", e);
}
