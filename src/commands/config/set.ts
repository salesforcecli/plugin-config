/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Config, Messages, Org } from '@salesforce/core';
// import { JsonMap } from '@salesforce/ts-types';
// import { Helper, Msg } from '../../helper';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'set');

export class Set extends SfdxCommand {
  public static readonly theDescription = messages.getMessage('description');
  public static readonly longDescription = messages.getMessage(
    'descriptionLong'
  );
  public static readonly help = messages.getMessage('help');
  public static readonly requiresProject = false;
  public static readonly varargs = { required: true };
  public static readonly flagsConfig: FlagsConfig = {
    global: flags.boolean({
      char: 'g',
      description: messages.getMessage('global'),
      longDescription: messages.getMessage('globalLong'),
      required: false
    })
  };

  // private responses: Msg[] = [];

  public async run(): Promise<void> {
    const config: Config = await Config.create(
      Config.getDefaultOptions(this.flags.global)
    );
    config.read();
    let value: string = '';
    for (const name of Object.keys(this.varargs!)) {
      try {
        value = (this.varargs![name] as unknown) as string;
        if (
          (name === Config.DEFAULT_DEV_HUB_USERNAME ||
            name === Config.DEFAULT_USERNAME) &&
          value
        ) {
          await Org.create({ aliasOrUsername: value });
        }
        config.set(name, value);
        // this.responses.push({ name, value, success: true });
      } catch (err) {
        // this.responses.push({ name, value, success: false, error: err.name });
      }
    }
    config.write();
    // Helper.output('Set Config', this.ux, this.responses);
    // return {
    //   successes: this.responses.filter(response => response.success),
    //   failures: this.responses.filter(response => !response.success)
    // };
  }
}
