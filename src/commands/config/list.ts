/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { ConfigAggregator, Messages } from '@salesforce/core';
import { ConfigCommand, ConfigResponses } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'list');

export default class List extends ConfigCommand {
  public static readonly description = messages.getMessage('description');
  public static flags = {};
  public async run(): Promise<ConfigResponses> {
    const aggregator = await ConfigAggregator.create();

    aggregator.getConfigInfo().forEach((c) => {
      this.pushSuccess(c);
    });

    if (!this.jsonEnabled()) {
      this.output('List Config', true);
    }
    return this.responses;
  }
}
