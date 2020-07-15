/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { JsonMap } from '@salesforce/ts-types';
import chalk from 'chalk';
import { UX } from '@salesforce/command';
import { SfdxError } from '@salesforce/core';

export interface Msg extends JsonMap {
  name: string;
  value?: string;
  success: boolean;
  location?: string;
}

// add success to SuccessMsg
export function output(
  header: string,
  ux: UX,
  responses: Msg[],
  verbose?: boolean
) {
  if (!responses || responses.length == 0) {
    ux.log('noResultsFound');
    return;
  }

  ux.styledHeader(chalk.blue(header));
  let values = {
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'value', label: 'Value' },
      // check to see if success column outputs if no success info given
      { key: 'success', label: 'Success' }
    ]
  };

  if (verbose) {
    values.columns.push({ key: 'location', label: 'Location' });
  }

  ux.table(responses, values);

  responses.forEach(response => {
    if (!response.success) {
      throw SfdxError.create(
        '@salesforce/plugin-config',
        'set',
        response.value!,
        [response.name]
      );
    }
  });
}
