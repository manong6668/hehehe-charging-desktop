import { x } from 'tinyexec'
import { info } from '../utils/ui.js'
import { CC_LAUNCH_RELEASES_URL } from '../constants.js'

/** Private releases use the user's authenticated GitHub browser session. */
export async function installCcSwitch(): Promise<void> {
  info('禾禾充电桩下载页面 ' + CC_LAUNCH_RELEASES_URL)
  if (process.platform === 'darwin') {
    await x('open', [CC_LAUNCH_RELEASES_URL])
  }
  else if (process.platform === 'win32') {
    await x('powershell', ['-NoProfile', '-Command', "Start-Process '" + CC_LAUNCH_RELEASES_URL + "'"])
  }
  else {
    await x('xdg-open', [CC_LAUNCH_RELEASES_URL])
  }
}
