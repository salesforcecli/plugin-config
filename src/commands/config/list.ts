/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { ConfigAggregator, Messages } from '@salesforce/core';
import { ConfigCommand, Msg } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'list');
export default class List extends ConfigCommand {
  public static readonly description = messages.getMessage('description');

  public static flags = {};

  public async run(): Promise<Msg[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const { flags } = await this.parse(List);
    const aggregator = await ConfigAggregator.create();

    aggregator.getConfigInfo().forEach((c) => {
      this.pushSuccess(c);
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!flags.json) {
      this.output('List Config', true);
    }
    return this.responses;
  }
}
