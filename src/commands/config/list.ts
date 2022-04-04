/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { ConfigAggregator, ConfigInfo, Messages, SfdxPropertyKeys } from '@salesforce/core';
import { ConfigCommand } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'list');

export default class List extends ConfigCommand {
  public static readonly description = messages.getMessage('description');
  public static aliases = ['force:config:list'];

  // no async methods
  // eslint-disable-next-line @typescript-eslint/require-await
  public async run(): Promise<ConfigInfo[]> {
    const aggregator = ConfigAggregator.getInstance();

    const results = aggregator.getConfigInfo().map((c) => {
      // hide sf-only config values
      if (Object.values(SfdxPropertyKeys).includes(c.key as SfdxPropertyKeys)) {
        this.responses.push({
          name: c.key,
          value: c.value as string | undefined,
          location: c.location,
          success: true,
        });
      }

      delete c.path;
      delete c.deprecated;
      return c;
    });
    this.output('List Config', true);
    return results;
  }
}
