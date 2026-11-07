import { x } from 'tinyexec'
import { existsSync } from 'node:fs'
import { join } from 'pathe'
import { homedir } from 'node:os'
import { CC_LAUNCH_BREW_CASK } from '../constants.js'

/**
 * Check if hehehe-charging-desktop is installed via multiple detection methods:
 *
 * macOS:
 *   1. /Applications/hehehe-charging-desktop.app
 *   2. ~/Applications/hehehe-charging-desktop.app
 *   3. Homebrew cask list
 *
 * Linux:
 *   1. ~/.local/bin/hehehe-charging-desktop (AppImage)
 *   2. which hehehe-charging-desktop (system PATH)
 *   3. dpkg -l (Debian/Ubuntu)
 *   4. rpm -q (Fedora/RHEL)
 *
 * Windows:
 *   1. %LOCALAPPDATA%\Programs\hehehe-charging-desktop
 *   2. %ProgramFiles%\hehehe-charging-desktop
 */
export async function isCcSwitchInstalled(): Promise<boolean> {
  const platform = process.platform

  if (platform === 'darwin') {
    return isCcSwitchInstalledMacos()
  }
  else if (platform === 'linux') {
    return isCcSwitchInstalledLinux()
  }
  else if (platform === 'win32') {
    return isCcSwitchInstalledWindows()
  }

  return false
}

async function isCcSwitchInstalledMacos(): Promise<boolean> {
  // Check /Applications and ~/Applications
  const appPaths = [
    '/Applications/hehehe-charging-desktop.app',
    join(homedir(), 'Applications', 'hehehe-charging-desktop.app'),
  ]
  for (const p of appPaths) {
    if (existsSync(p)) return true
  }

  // Check brew cask
  try {
    const result = await x('brew', ['list', '--cask', CC_LAUNCH_BREW_CASK], {
      throwOnError: false,
    })
    if (result.exitCode === 0) return true
  }
  catch {
    // brew not available, skip
  }

  return false
}

async function isCcSwitchInstalledLinux(): Promise<boolean> {
  const home = homedir()

  // 1. AppImage in ~/.local/bin
  if (existsSync(join(home, '.local', 'bin', 'hehehe-charging-desktop'))) return true

  // 2. In system PATH
  try {
    const result = await x('which', ['hehehe-charging-desktop'], { throwOnError: false })
    if (result.exitCode === 0 && result.stdout.trim()) return true
  }
  catch { /* ignore */ }

  // 3. dpkg (Debian/Ubuntu)
  try {
    const result = await x('dpkg', ['-l', 'hehehe-charging-desktop'], { throwOnError: false })
    if (result.exitCode === 0 && result.stdout.includes('hehehe-charging-desktop')) return true
  }
  catch { /* ignore */ }

  // 4. rpm (Fedora/RHEL)
  try {
    const result = await x('rpm', ['-q', 'hehehe-charging-desktop'], { throwOnError: false })
    if (result.exitCode === 0) return true
  }
  catch { /* ignore */ }

  // 5. Flatpak
  try {
    const result = await x('flatpak', ['list', '--app'], { throwOnError: false })
    if (result.exitCode === 0 && result.stdout.includes('hehecharging')) return true
  }
  catch { /* ignore */ }

  return false
}

function isCcSwitchInstalledWindows(): boolean {
  const localAppData = process.env.LOCALAPPDATA ?? ''
  const programFiles = process.env.ProgramFiles ?? 'C:\\Program Files'
  const programFilesX86 = process.env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)'

  const candidates = [
    join(localAppData, 'Programs', 'hehehe-charging-desktop', 'hehehe-charging-desktop.exe'),
    join(programFiles, 'hehehe-charging-desktop', 'hehehe-charging-desktop.exe'),
    join(programFilesX86, 'hehehe-charging-desktop', 'hehehe-charging-desktop.exe'),
  ]

  return candidates.some(p => existsSync(p))
}
