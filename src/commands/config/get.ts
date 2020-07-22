/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, FlagsConfig } from '@salesforce/command';
import {
  ConfigAggregator,
  ConfigInfo,
  Messages,
  SfdxError
} from '@salesforce/core';
import { ConfigCommand } from '../../config';

Messages.importMessagesDirectory(__dirname);
// const messages = Messages.loadMessages('@salesforce/plugin-config', 'get');

export default class Get extends ConfigCommand {
  protected static supportsPerfLogLevelFlag = false;

  // public static readonly theDescription = messages.getMessage('description', []);
  // public static readonly longDescription = messages.getMessage('descriptionLong', []);
  // public static readonly help = messages.getMessage('help', []);
  public static readonly requiresProject = false;
  public static readonly strict = false;
  public static readonly flagsConfig: FlagsConfig = {
    verbose: flags.builtin()
  };

  async run(): Promise<ConfigInfo[]> {
    const { argv } = this.parse({
      flags: this.statics.flags,
      args: this.statics.args,
      strict: this.statics.strict
    });

    if (!argv || argv.length === 0) {
      throw SfdxError.create(
        '@salesforce/plugin-config',
        'get',
        'NoConfigKeysFound',
        []
      );
    } else {
      const results: ConfigInfo[] = [];
      const aggregator = await ConfigAggregator.create();

      argv.forEach(configName => {
        try {
          const configInfo = aggregator.getInfo(configName);
          results.push(configInfo);
          this.responses.push({
            name: configInfo.key,
            value: configInfo.value as string | undefined,
            success: true,
            location: configInfo.location
          });
        } catch (err) {
          this.responses.push({
            name: configName,
            success: false,
            error: err
          });
        }
      });

      this.output('Get Config');
      return results;
    }
  }
}
