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
import { Dictionary } from '@salesforce/ts-types';
import { ConfigCommand, Msg } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'unset');

export class UnSet extends ConfigCommand {
  public static readonly theDescription = messages.getMessage(
    'en_US.description'
  );
  public static readonly longDescription = messages.getMessage(
    'en_US.descriptionLong'
  );
  public static readonly help = messages.getMessage('en_US.help');
  public static readonly requiresProject = false;
  public static readonly strict = false;
  public static readonly flagsConfig: FlagsConfig = {
    global: flags.boolean({
      char: 'g',
      description: messages.getMessage('en_US.global'),
      longDescription: messages.getMessage('en_US.globalLong'),
      required: false
    })
  };

  public async run(): Promise<Dictionary<Msg[]>> {
    const { argv } = this.parse({
      flags: this.statics.flags,
      args: this.statics.args,
      strict: this.statics.strict
    });

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
          this.responses.push({ name: key, success: false, error });
        }
      });
      await config.write();
      this.output('Unset Config', false);
    }

    return {
      successes: this.responses.filter(response => response.success),
      failures: this.responses.filter(response => !response.success)
    };
  }
}
