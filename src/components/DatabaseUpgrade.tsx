import { useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { exit } from "@tauri-apps/plugin-process";
import { Database, ExternalLink, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DatabaseUpgradeProps {
  payload: {
    path?: string;
    error?: string;
    kind?: string;
    db_version?: number;
    supported_version?: number;
  };
}

export function DatabaseUpgrade({ payload }: DatabaseUpgradeProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  async function openDownloads() {
    try {
      await invoke("check_for_updates");
    } catch (cause) {
      setError(String(cause));
    }
  }

  async function openConfiguration() {
    try {
      await invoke("open_app_config_folder");
    } catch (cause) {
      setError(String(cause));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <section className="w-full max-w-lg space-y-5 rounded-2xl border border-border bg-card p-7 shadow-xl">
        <Database className="h-10 w-10 text-amber-500" />
        <h1 className="text-lg font-semibold">{t("dbUpgrade.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("dbUpgrade.manualDownload")}
        </p>
        {payload.db_version != null && payload.supported_version != null && (
          <p className="text-xs text-muted-foreground">
            {t("dbUpgrade.versionInfo", {
              db: payload.db_version,
              supported: payload.supported_version,
            })}
          </p>
        )}
        <div className="space-y-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          {payload.error && <p className="break-words">{payload.error}</p>}
          {payload.path && <p className="break-all">{payload.path}</p>}
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void openDownloads()} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            {t("dbUpgrade.openReleases")}
          </Button>
          <Button
            variant="outline"
            onClick={() => void openConfiguration()}
            className="gap-2"
          >
            <FolderOpen className="h-4 w-4" />
            {t("dbUpgrade.openConfigDir")}
          </Button>
          <Button variant="ghost" onClick={() => void exit(0)}>
            {t("dbUpgrade.quit")}
          </Button>
        </div>
      </section>
    </div>
  );
}

export default DatabaseUpgrade;
