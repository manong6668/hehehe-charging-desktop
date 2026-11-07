import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) =>
  readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const configuration = JSON.parse(read("src-tauri/tauri.conf.json"));
const packageMetadata = JSON.parse(read("package.json"));
const template = read("src-tauri/wix/per-user-main.wxs");

assert.equal(configuration.productName, "禾禾充电桩");
assert.equal(configuration.identifier, "com.hehecharging.desktop");
assert.equal(configuration.version, packageMetadata.version);
assert.equal(configuration.mainBinaryName, packageMetadata.name);
assert.equal(configuration.bundle.windows.nsis.installMode, "currentUser");
assert.equal(configuration.bundle.windows.allowDowngrades, false);
assert.equal(
  configuration.bundle.windows.webviewInstallMode.type,
  "embedBootstrapper",
);
assert.match(template, /InstallScope="perUser"/);
assert.match(template, /InstallPrivileges="limited"/);
assert.match(template, /<Directory Id="LocalAppDataFolder">/);
assert.doesNotMatch(
  template,
  /<Remove(?:File|Folder)\b[^>]*(?:Directory|Id)="(?:TauriLocalAppDataPrograms|RemoveUserProgramsFiles|RemoveUserProgramsFolder)"/,
);
assert.doesNotMatch(template, /<RemoveFile\b[^>]*Name="\*"/);
assert.doesNotMatch(template, /<RemoveFolder\b[^>]*Id="DesktopFolder"/);
assert.equal(configuration.bundle.createUpdaterArtifacts, false);
assert.equal(configuration.plugins.updater, undefined);
assert.equal(
  configuration.plugins["deep-link"].desktop.schemes.join(","),
  "hehecharging",
);

for (const file of [
  "src-tauri/tauri.conf.json",
  "src-tauri/src/commands/misc.rs",
  "src/lib/updater.ts",
  "src/components/settings/AboutSection.tsx",
]) {
  assert.doesNotMatch(
    read(file),
    /https:\/\/(?:dl\.ccswitch\.io|github\.com\/farion1231\/cc-switch\/releases)/,
  );
}
assert.match(
  read("src-tauri/src/config.rs"),
  /APP_CONFIG_DIR_NAME: &str = "\.hehehe-charging-desktop"/,
);
assert.match(
  read("src-tauri/src/commands/misc.rs"),
  /https:\/\/github\.com\/manong6668\/hehehe-charging-desktop\/releases\/latest/,
);
assert.match(read("LICENSE"), /Copyright \(c\) 2025 Jason Young/);
console.log(
  "Distribution checks passed for branding, isolated data, safe uninstall, and owned downloads.",
);
