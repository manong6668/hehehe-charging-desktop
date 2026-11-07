import { getVersion } from "@tauri-apps/api/app";

export type UpdateChannel = "stable" | "beta";

export interface UpdateInfo {
  currentVersion: string;
  availableVersion: string;
  notes?: string;
  pubDate?: string;
}

export interface CheckOptions {
  timeout?: number;
  channel?: UpdateChannel;
}

export async function getCurrentVersion(): Promise<string> {
  try {
    return await getVersion();
  } catch {
    return "";
  }
}

export async function checkForUpdate(
  _opts: CheckOptions = {},
): Promise<
  | { status: "manual" }
  | { status: "up-to-date" }
  | { status: "available"; info: UpdateInfo }
> {
  // Private release downloads use the user's authenticated GitHub browser session.
  return { status: "manual" };
}
