/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Hook, IPlugin } from '@oclif/config';
import { tsPath } from '@oclif/config/lib/ts-node';
import { ConfigPropertyMeta, Logger } from '@salesforce/core';
import { Config } from '@salesforce/core';
import { isObject, get } from '@salesforce/ts-types';

const log = Logger.childFromRoot('plugin-config:load_config_meta');
const OCLIF_META_PJSON_KEY = 'configMeta';

function loadConfigMeta(plugin: IPlugin): ConfigPropertyMeta | undefined {
  let configMetaRequireLocation: string | undefined;

  try {
    const configMetaPath = get(plugin, `pjson.oclif.${OCLIF_META_PJSON_KEY}`, null);

    if (typeof configMetaPath !== 'string') {
      return;
    }

    const relativePath = tsPath(plugin.root, configMetaPath);

    // use relative path if it exists, require string as is
    configMetaRequireLocation = relativePath ?? configMetaPath;
  } catch {
    return;
  }

  if (!configMetaRequireLocation) {
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
    const configMetaPathModule = require(configMetaRequireLocation);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return configMetaPathModule?.default ?? configMetaPathModule;
  } catch {
    log.error(`Error trying to load config meta from ${configMetaRequireLocation}`);
    return;
  }
}

const hook: Hook<'init'> = ({ config: oclifConfig }) => {
  const loadedConfigMetas = (oclifConfig.plugins || [])
    .map((plugin) => {
      const configMeta = loadConfigMeta(plugin);
      if (!configMeta) {
        log.info(`No config meta found for ${plugin.name}`);
      }

      return configMeta;
    })
    .filter(isObject);

  const flattenedConfigMetas = [...loadedConfigMetas];

  if (flattenedConfigMetas.length) {
    Config.addAllowedProperties(flattenedConfigMetas);
  }
};

export default hook;
