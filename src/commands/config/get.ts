/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Flags } from '@oclif/core';
import { ConfigAggregator, Messages, SfdxError } from '@salesforce/core';
import { ConfigCommand, ConfigResponses } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'get');

export class Get extends ConfigCommand {
  public static readonly description = messages.getMessage('description');
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static readonly strict = false;
  public static readonly flags = {
    verbose: Flags.boolean({
      summary: messages.getMessage('flags.verbose.summary'),
    }),
  };

  public async run(): Promise<ConfigResponses> {
    const { argv, flags } = await this.parse(Get);

    if (!argv || argv.length === 0) {
      const errorMessage = messages.getMessage('error.NoConfigKeysFound');
      throw new SfdxError(errorMessage, 'NoConfigKeysFound');
    } else {
      const aggregator = await ConfigAggregator.create();

      argv.forEach((configName) => {
        try {
          this.pushSuccess(aggregator.getInfo(configName));
        } catch (err) {
          this.pushFailure(configName, err);
        }
      });

      if (!this.jsonEnabled()) {
        this.output('Get Config', flags.verbose);
      }
      return this.responses;
    }
  }
}
