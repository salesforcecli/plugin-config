/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Thirdparty
import * as _ from 'lodash';

import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Config, Messages, Org } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'set');

// interface SuccessMsg {
//   name: string;
//   value: string;
// }

// interface FailureMsg {
//   name: string;
//   message: string;
// }

export class Set extends SfdxCommand {
  public static readonly theDescription = messages.getMessage(
    'en_US.description'
  );
  public static readonly longDescription = messages.getMessage(
    'en_US.descriptionLong'
  );
  public static readonly help = messages.getMessage('en_US.help');
  public static readonly requiresProject = false;
  public static readonly varargs = { required: true };
  public static readonly flagsConfig: FlagsConfig = {
    global: flags.boolean({
      char: 'g',
      description: messages.getMessage('en_US.global'),
      longDescription: messages.getMessage('en_US.globalLong'),
      required: false
    })
  };

  // private successes: SuccessMsg[] = [];
  // private failures: FailureMsg[] = [];

  public async run(): Promise<void> {
    for (const name of Object.keys(this.varargs!)) {
      const value: string = (this.varargs![name] as unknown) as string;
      if (
        name === Config.DEFAULT_DEV_HUB_USERNAME ||
        name === Config.DEFAULT_USERNAME
      ) {
        await Org.create({ aliasOrUsername: value });
      }
      await Set.setConfig(name, value, this.flags.global);
    }
  }
  static async setConfig(
    key: string,
    value: string,
    isGlobal: boolean = false
  ) {
    let config: Config;
    try {
      config = await Config.create(Config.getDefaultOptions(isGlobal));
    } catch (err) {
      if (err.name === 'InvalidProjectWorkspace') {
        err['message'] = `${err.message} ${messages.getMessage(
          'en_US.globalHelp'
        )}`;
      }
      throw err;
    }
    return config
      .read()
      .then(result => {
        config.set(key, value);
      })
      .then(() => config.write());
  }
}
