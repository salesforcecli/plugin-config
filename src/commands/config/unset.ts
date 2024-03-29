/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'os';

import { flags, FlagsConfig } from '@salesforce/command';
import { Config, Messages, SfError } from '@salesforce/core';
import { ConfigCommand, ConfigSetReturn } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'unset');

export class UnSet extends ConfigCommand {
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly strict = false;
  public static readonly flagsConfig: FlagsConfig = {
    global: flags.boolean({
      char: 'g',
      description: messages.getMessage('global'),
      longDescription: messages.getMessage('globalLong'),
      required: false,
    }),
  };
  public static aliases = ['force:config:unset'];

  public async run(): Promise<ConfigSetReturn> {
    const argv = await this.parseArgs();

    if (!argv || argv.length === 0) {
      throw messages.createError('NoConfigKeysFound');
    } else {
      const config = await Config.create(Config.getDefaultOptions(this.flags.global as boolean));

      await config.read();
      argv.forEach((key) => {
        try {
          const configKey = Config.getPropertyConfigMeta(key)?.key || key;
          config.unset(configKey);
          this.responses.push({ name: key, success: true });
        } catch (err) {
          process.exitCode = 1;
          this.responses.push({
            name: key,
            success: false,
            error: err as SfError,
          });
        }
      });
      await config.write();
      if (!this.flags.json) {
        this.output('Unset Config', false);
      }
    }
    return this.formatResults();
  }
}
