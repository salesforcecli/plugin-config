/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags } from '@oclif/core';
import { Config, Messages, SfdxError } from '@salesforce/core';
import { ConfigCommand, ConfigSetReturn } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'unset');

export class UnSet extends ConfigCommand {
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly strict = false;

  public static readonly flags = {
    global: Flags.boolean({
      char: 'g',
      summary: messages.getMessage('global'),
      description: messages.getMessage('globalLong'),
    }),
  };

  public async run(): Promise<ConfigSetReturn> {
    const { argv, flags } = await this.parse(UnSet);

    if (!argv || argv.length === 0) {
      const errorMessage = messages.getMessage('NoConfigKeysFound');
      throw new SfdxError(errorMessage, 'NoConfigKeysFound');
    } else {
      const config: Config = await Config.create(Config.getDefaultOptions(flags.global));

      await config.read();
      argv.forEach((key) => {
        try {
          config.unset(key);
          this.responses.push({ name: key, success: true });
        } catch (err) {
          process.exitCode = 1;
          this.responses.push({
            name: key,
            success: false,
            error: err as SfdxError,
          });
        }
      });
      await config.write();
      if (!flags.json) {
        this.output('Unset Config', false);
      }
    }
    return this.formatResults();
  }
}
