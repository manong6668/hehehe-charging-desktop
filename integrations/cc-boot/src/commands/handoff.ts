import { t } from '../i18n/index.js'
import { heading, success, fail, info, spinner } from '../utils/ui.js'
import { readConfig } from '../utils/config-store.js'
import { isCcSwitchInstalled } from '../handoff/detector.js'
import { installCcSwitch } from '../handoff/installer.js'
import { buildProviderDeepLink, buildMcpDeepLink, openDeepLink } from '../handoff/deep-link.js'
import type { ProviderConfig, McpServerEntry } from '../tools/types.js'

export interface HandoffOptions {
  install?: boolean
}

/**
 * Hand off current configuration to hehehe-charging-desktop via deep links.
 */
export async function handoff(options: HandoffOptions): Promise<void> {
  heading(t('hehecharging.handoff'))

  // Check if hehehe-charging-desktop is installed
  const installed = await isCcSwitchInstalled()

  if (!installed) {
    if (options.install) {
      await installCcSwitch()
    }
    else {
      fail(t('hehecharging.not_found'))
      info('Run with --install to install hehehe-charging-desktop first')
      return
    }
  }

  const config = readConfig()
  const s = spinner(t('hehecharging.handoff'))
  s.start()

  // Build and open provider deep link if configured
  if (config.provider) {
    const providerConfig: ProviderConfig = {
      name: config.provider,
      apiKey: '',
      apiUrl: '',
      authType: 'api_key',
    }
    const providerLink = buildProviderDeepLink(providerConfig)
    try {
      await openDeepLink(providerLink)
    }
    catch {
      s.stop()
      fail('Failed to open provider deep link')
      return
    }
  }

  s.stop()
  success(t('hehecharging.done'))
}
