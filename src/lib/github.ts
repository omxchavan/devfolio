interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  homepage: string | null;
  html_url: string;
  topics: string[];
}

interface GitHubContributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

interface GitHubLanguages {
  [key: string]: number;
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export class GitHubError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "GitHubError";
  }
}

async function githubFetch<T>(url: string): Promise<T> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "devfolio-app",
  };

  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  const response = await fetch(url, {
    headers,
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new GitHubError("GitHub API rate limit exceeded. Please try again later.", 403);
    }
    if (response.status === 404) {
      throw new GitHubError("Repository not found. Please check the URL.", 404);
    }
    throw new GitHubError(`GitHub API error: ${response.status}`, response.status);
  }

  return response.json() as Promise<T>;
}

export function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(
    /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/
  );
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

export async function fetchRepoDetails(owner: string, repo: string) {
  const data = await githubFetch<GitHubRepo>(
    `https://api.github.com/repos/${owner}/${repo}`
  );

  return {
    name: data.name,
    description: data.description || "",
    stars: data.stargazers_count,
    language: data.language,
    homepage: data.homepage,
    topics: data.topics || [],
  };
}

export async function fetchContributors(owner: string, repo: string) {
  try {
    const data = await githubFetch<GitHubContributor[]>(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=30`
    );

    return data
      .filter((c) => c.login)
      .map((c) => ({
        githubUsername: c.login,
        avatarUrl: c.avatar_url,
        contributions: c.contributions,
      }));
  } catch {
    return [];
  }
}

export async function fetchLanguages(owner: string, repo: string) {
  try {
    const data = await githubFetch<GitHubLanguages>(
      `https://api.github.com/repos/${owner}/${repo}/languages`
    );

    return Object.keys(data);
  } catch {
    return [];
  }
}

export async function fetchReadme(owner: string, repo: string) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Accept: "application/vnd.github.v3.raw",
          "User-Agent": "devfolio-app",
          ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok || !response.body) return "";

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    
    while (text.length < 2000) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }
    
    reader.cancel(); // Stop receiving the rest of the file
    // Return first 1000 chars as excerpt
    return text.slice(0, 1000);
  } catch {
    return "";
  }
}
