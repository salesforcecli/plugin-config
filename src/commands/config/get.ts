/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import { flags, FlagsConfig } from '@salesforce/command';
import { ConfigAggregator, ConfigInfo, Messages, SfError } from '@salesforce/core';
import { ConfigCommand } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'get');

export class Get extends ConfigCommand {
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly strict = false;
  public static readonly flagsConfig: FlagsConfig = {
    verbose: flags.builtin(),
  };
  public static aliases = ['force:config:get'];

  public async run(): Promise<ConfigInfo[]> {
    const argv = await this.parseArgs();

    if (!argv || argv.length === 0) {
      throw messages.createError('NoConfigKeysFound');
    } else {
      const results: ConfigInfo[] = [];
      const aggregator = ConfigAggregator.getInstance();

      argv.forEach((configName) => {
        try {
          // search the sf config keys for the sfdx equivalent and use the sf version when accessing the config
          const resolvedKey =
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            (aggregator.allowedProperties.find((entry: { key: string }) => entry.key === configName)
              ?.newKey as string) || configName;
          const configInfo = aggregator.getInfo(resolvedKey);
          // replace the sf key with the sfdx variant
          configInfo.key = configName;
          results.push(configInfo);
          this.responses.push({
            name: configName,
            value: configInfo.value as string | undefined,
            deprecated: false,
            success: true,
            location: configInfo.location,
          });
        } catch (err) {
          this.responses.push({
            name: configName,
            success: false,
            error: err as SfError,
          });
        }
      });

      this.output('Get Config', this.flags.verbose as boolean);
      return results;
    }
  }
}
