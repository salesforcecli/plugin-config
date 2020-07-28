/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Thirdparty
import * as _ from 'lodash';

import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Config, Messages } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'unset');

export class UnSet extends SfdxCommand {
  // public static readonly theDescription = messages.getMessage(
  //   'en_US.description'
  // );
  // public static readonly longDescription = messages.getMessage(
  //   'en_US.descriptionLong'
  // );
  // public static readonly help = messages.getMessage('en_US.help');
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

  public async run(): Promise<void> {
    let config: Config;
    config = await Config.create(Config.getDefaultOptions(this.flags.global));
    config
      .read()
      .then(result => {
        config.unsetAll(this.argv.filter(val => !val.includes('-')));
      })
      .then(() => config.write());
  }
}
