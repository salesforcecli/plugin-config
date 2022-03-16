/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig } from '@salesforce/command';
import {
  Config,
  Messages,
  Org,
  ORG_CONFIG_ALLOWED_PROPERTIES,
  OrgConfigProperties,
  SFDX_ALLOWED_PROPERTIES,
  SfdxPropertyKeys,
  SfError,
} from '@salesforce/core';
import { getString } from '@salesforce/ts-types';
import { ConfigCommand, ConfigSetReturn } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'set');

export class Set extends ConfigCommand {
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly varargs = { required: true };
  public static readonly flagsConfig: FlagsConfig = {
    global: flags.boolean({
      char: 'g',
      description: messages.getMessage('global'),
      longDescription: messages.getMessage('globalLong'),
      required: false,
    }),
  };
  public static aliases = ['force:config:set'];

  public async run(): Promise<ConfigSetReturn> {
    /**
     * override the coreV3 allowedProperties to allow all sfdx config values,
     * regardless of if they're deprecated in 'sf' or not
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Config.allowedProperties = [
      ...ORG_CONFIG_ALLOWED_PROPERTIES,
      ...SFDX_ALLOWED_PROPERTIES.map((entry) => {
        entry.deprecated = false;
        return entry;
      }),
    ];
    const config: Config = await Config.create(Config.getDefaultOptions(this.flags.global as boolean));

    await config.read();
    let value = '';
    for (const name of Object.keys(this.varargs)) {
      try {
        value = getString(this.varargs, name);
        if (
          name === SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME ||
          name === SfdxPropertyKeys.DEFAULT_USERNAME ||
          ((name === OrgConfigProperties.TARGET_ORG || name === OrgConfigProperties.TARGET_DEV_HUB) && value)
        ) {
          await Org.create({ aliasOrUsername: value });
        }
        config.set(name, value);
        this.responses.push({ name, value, success: true });
      } catch (err) {
        process.exitCode = 1;
        this.responses.push({
          name,
          value,
          success: false,
          error: err as SfError,
        });
      }
    }
    await config.write();
    if (!this.flags.json) {
      this.output('Set Config', false);
    }
    return this.formatResults();
  }
}
