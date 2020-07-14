/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { JsonMap } from '@salesforce/ts-types';
import chalk from 'chalk';
import { UX } from '@salesforce/command';

export interface SuccessMsg extends JsonMap {
  name: string;
  value?: string;
  location?: string;
}

export interface FailureMsg extends JsonMap {
  name: string;
  message: string;
}

export function output(
  header: string,
  ux: UX,
  successes: SuccessMsg[],
  failures?: FailureMsg[],
  verbose?: boolean
) {
  console.log(failures);
  console.log(verbose);

  if (successes.length > 0) {
    ux.styledHeader(chalk.blue(header));
    let values = {
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'value', label: 'Value' }
      ]
    };
    if (verbose) {
      values.columns.push({ key: 'location', label: 'Location' });
    }
    ux.table(successes, values);
  }

  if (failures && failures.length > 0) {
    if (successes.length > 0) {
      ux.log('');
    }

    ux.styledHeader(chalk.red('Failures'));
    ux.table(failures, {
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'message', label: 'Message' }
      ]
    });
  }
}
