/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, FlagsConfig } from '@salesforce/command';
import { Config, Messages, Org } from '@salesforce/core';
import { JsonMap } from '@salesforce/ts-types';
import { ConfigCommand } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'set');

export class Set extends ConfigCommand {
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

  public async run(): Promise<JsonMap> {
    const config: Config = await Config.create(
      Config.getDefaultOptions(this.flags.global)
    );
    await config.read();
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
        this.responses.push({ name, value, success: true });
      } catch (error) {
        process.exitCode = 1;
        this.responses.push({ name, value, success: false, error });
      }
    }
    await config.write();
    if (!this.flags.json) {
      this.output('Set Config', false);
    }
    return {
      successes: this.responses
        .filter(response => response.success)
        .map(success => ({
          name: success.name,
          value: success.value
        })),
      failures: this.responses
        .filter(response => !response.success)
        .map(failure => ({
          name: failure.name,
          message: failure.error!.message
        }))
    };
  }
}
