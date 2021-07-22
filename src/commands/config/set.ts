/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig } from '@salesforce/command';
import { Config, Messages, Org, SfdxPropertyKeys, SfdxError } from '@salesforce/core';
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
    const config: Config = await this.loadConfig();
    let value = '';
    for (const name of Object.keys(this.varargs)) {
      try {
        value = getString(this.varargs, name);
        const isOrgKey =
          name === SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME || name === SfdxPropertyKeys.DEFAULT_USERNAME;
        if (isOrgKey && value) {
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
          error: err as SfdxError,
        });
      }
    }
    await config.write();
    if (!this.flags.json) {
      this.output('Set Config', false);
    }
    return this.formatResults();
  }

  protected async loadConfig(): Promise<Config> {
    try {
      const config = await Config.create(Config.getDefaultOptions(this.flags.global));
      await config.read();
      return config;
    } catch (error) {
      if (error instanceof SfdxError) {
        error.actions = error.actions || [];
        error.actions.push('Run with --global to set for your entire workspace.');
      }
      throw error;
    }
  }
}
