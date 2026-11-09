import type {
  EnvironmentProject,
  EnvironmentThreadShell,
} from "@t3tools/client-runtime/state/models";

export interface SidebarPreviewFolder {
  readonly key: string;
  readonly name: string;
  /** The user's own project, or null for a sample folder. */
  readonly project: Pick<
    EnvironmentProject,
    "environmentId" | "workspaceRoot" | "title" | "faviconPath" | "projectIcon"
  > | null;
  readonly threads: ReadonlyArray<{ readonly title: string; readonly updatedAt: string }>;
}

const HOUR = 60 * 60_000;
const SAMPLE_FOLDERS = [
  { name: "website", threads: [["Fix the signup form", 2 * HOUR] as const] },
  {
    name: "api",
    threads: [
      ["Rate limit the upload route", 5 * HOUR],
      ["Bump dependencies", 26 * HOUR],
    ] as const,
  },
];

const MAX_FOLDERS = 2;
const MAX_THREADS = 2;

/**
 * What the Boring sidebar would show first: the user's most recent threads under their
 * projects. Grouping needs two projects to show, so anyone with fewer sees sample folders.
 */
export function sidebarPreviewFolders(
  projects: ReadonlyArray<EnvironmentProject>,
  shells: ReadonlyArray<
    Pick<
      EnvironmentThreadShell,
      | "environmentId"
      | "projectId"
      | "title"
      | "updatedAt"
      | "archivedAt"
      | "deletedAt"
      | "settledAt"
      | "lineage"
    >
  >,
  now: number,
): ReadonlyArray<SidebarPreviewFolder> {
  const projectByKey = new Map(
    projects
      .filter((project) => project.isScratch !== true)
      .map((project) => [`${project.environmentId}\u0000${project.id}`, project]),
  );
  const folders = new Map<string, { project: EnvironmentProject; threads: typeof shells }>();
  const recent = shells
    .filter(
      (shell) =>
        shell.archivedAt === null &&
        shell.deletedAt === null &&
        shell.settledAt === null &&
        shell.lineage.parentThreadId === null,
    )
    .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  for (const shell of recent) {
    const key = `${shell.environmentId}\u0000${shell.projectId}`;
    const project = projectByKey.get(key);
    if (project === undefined) continue;
    const folder = folders.get(key);
    if (folder === undefined) {
      if (folders.size < MAX_FOLDERS) folders.set(key, { project, threads: [shell] });
    } else if (folder.threads.length < MAX_THREADS) {
      folders.set(key, { project, threads: [...folder.threads, shell] });
    }
  }
  if (folders.size < MAX_FOLDERS) {
    return SAMPLE_FOLDERS.map((folder) => ({
      key: folder.name,
      name: folder.name,
      project: null,
      threads: folder.threads.map(([title, age]) => ({
        title,
        updatedAt: new Date(now - age).toISOString(),
      })),
    }));
  }
  return [...folders].map(([key, { project, threads }]) => ({
    key,
    name: project.title,
    project,
    threads: threads.map(({ title, updatedAt }) => ({ title, updatedAt })),
  }));
}
