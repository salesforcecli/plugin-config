/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags } from '@oclif/core';
import { Config, Messages } from '@salesforce/core';
import { CONFIG_HELP_SECTION, ConfigCommand, ConfigResponses } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'unset');

export class UnSet extends ConfigCommand<ConfigResponses> {
  public static readonly description = messages.getMessage('description');
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly strict = false;

  public static configurationVariablesSection = CONFIG_HELP_SECTION;

  public static readonly flags = {
    global: Flags.boolean({
      char: 'g',
      summary: messages.getMessage('flags.global.summary'),
    }),
  };

  public async run(): Promise<ConfigResponses> {
    const { argv, flags } = await this.parse(UnSet);

    if (!argv || argv.length === 0) {
      throw messages.createError('error.NoConfigKeysFound');
    } else {
      const config: Config = await Config.create(Config.getDefaultOptions(flags.global));

      await config.read();
      argv.forEach((key) => {
        try {
          config.unset(key);
          this.responses.push({ name: key, success: true });
        } catch (err) {
          this.pushFailure(key, err as Error);
        }
      });
      await config.write();
      if (!this.jsonEnabled()) {
        this.output('Unset Config', false);
      }
    }
    return this.responses;
  }
}
