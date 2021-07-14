/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Command } from '@oclif/core';
import { cli } from 'cli-ux';
import type { table } from 'cli-ux/lib/styled/table';
import { SfdxError } from '@salesforce/core';
import { Optional } from '@salesforce/ts-types';
import * as chalk from 'chalk';

export interface Msg {
  name: string;
  value?: string;
  success: boolean;
  location?: string;
  error?: SfdxError;
}

export type ConfigSetReturn = {
  successes: Array<{ name: string; value: Optional<string> }>;
  failures: Array<{ name: string; message: string }>;
};

export abstract class ConfigCommand extends Command {
  protected responses: Msg[] = [];

  public output(header: string, verbose: boolean): void {
    if (this.responses.length === 0) {
      this.log('No results found');
      return;
    }

    cli.styledHeader(chalk.blue(header));
    const columns: table.Columns<Msg> = {
      name: { header: 'Name' },
    };

    if (!header.includes('Unset')) {
      columns.value = { header: 'Value' };
    }

    if (!header.includes('List')) {
      columns.success = { header: 'Success' };
    }

    if (verbose) {
      columns.location = { header: 'Location' };
    }

    cli.table(this.responses, columns);

    this.responses.forEach((response) => {
      if (response.error) {
        throw response.error;
      }
    });
  }

  public formatResults(): ConfigSetReturn {
    return {
      successes: this.responses
        .filter((response) => response.success)
        .map((success) => ({
          name: success.name,
          value: success.value,
        })),
      failures: this.responses
        .filter((response) => !response.success)
        .map((failure) => ({
          name: failure.name,
          message: failure.error.message,
        })),
    };
  }
}
