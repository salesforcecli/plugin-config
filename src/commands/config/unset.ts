/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Thirdparty
import * as _ from 'lodash';

import { flags, FlagsConfig } from '@salesforce/command';
import { Config, Messages, SfdxError } from '@salesforce/core';
import * as os from 'os';
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
      required: false
    })
  };

  public async run(): Promise<ConfigSetReturn> {
    const argv = this.parseArgs();

    if (!argv || argv.length === 0) {
      throw SfdxError.create(
        '@salesforce/plugin-config',
        'unset',
        'NoConfigKeysFound',
        []
      );
    } else {
      const config: Config = await Config.create(
        Config.getDefaultOptions(this.flags.global)
      );

      await config.read();
      argv.forEach(key => {
        try {
          config.unset(key);
          this.responses.push({ name: key, success: true });
        } catch (error) {
          process.exitCode = 1;
          this.responses.push({ name: key, success: false, error });
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
