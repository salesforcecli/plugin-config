/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import chalk from 'chalk';
import { SfdxCommand } from '@salesforce/command';
import { SfdxError } from '@salesforce/core';

export interface Msg {
  name: string;
  value?: string;
  success: boolean;
  location?: string;
  error?: SfdxError;
}

export abstract class ConfigCommand extends SfdxCommand {
  protected responses: Msg[] = [];

  output(header: string) {
    if (this.responses.length == 0) {
      this.ux.log('noResultsFound');
      return;
    }

    this.ux.styledHeader(chalk.blue(header));
    let values = {
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'value', label: 'Value' },
        { key: 'success', label: 'Success' }
      ]
    };

    if (this.flags.verbose) {
      values.columns.push({ key: 'location', label: 'Location' });
    }

    this.ux.table(this.responses, values);

    this.responses.forEach(response => {
      if (response.error) {
        throw response.error;
      }
    });
  }
}
