/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags } from '@oclif/core';
import { ConfigAggregator, ConfigInfo, Messages, SfdxError } from '@salesforce/core';
import { ConfigCommand } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'get');

export class Get extends ConfigCommand {
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static readonly strict = false;
  public static readonly flags = {
    verbose: Flags.boolean(),
  };

  public async run(): Promise<ConfigInfo[]> {
    const { argv, flags } = await this.parse(Get);

    if (!argv || argv.length === 0) {
      const errorMessage = messages.getMessage('NoConfigKeysFound');
      throw new SfdxError(errorMessage, 'NoConfigKeysFound');
    } else {
      const results: ConfigInfo[] = [];
      const aggregator = await ConfigAggregator.create();

      argv.forEach((configName) => {
        try {
          const configInfo = aggregator.getInfo(configName);
          results.push(configInfo);
          this.responses.push({
            name: configInfo.key,
            value: configInfo.value as string | undefined,
            success: true,
            location: configInfo.location,
          });
        } catch (err) {
          this.responses.push({
            name: configName,
            success: false,
            error: err as SfdxError,
          });
        }
      });

      this.output('Get Config', flags.verbose);
      return results;
    }
  }
}
