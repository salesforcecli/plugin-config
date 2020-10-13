/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfdxCommand } from '@salesforce/command';
import { SfdxError } from '@salesforce/core';
import { Optional } from '@salesforce/ts-types';
import chalk from 'chalk';

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

export abstract class ConfigCommand extends SfdxCommand {
  protected responses: Msg[] = [];

  public output(header: string, verbose: boolean): void {
    if (this.responses.length === 0) {
      this.ux.log('No results found');
      return;
    }

    this.ux.styledHeader(chalk.blue(header));
    const values = {
      columns: [{ key: 'name', label: 'Name' }],
    };

    if (!header.includes('Unset')) {
      values.columns.push({ key: 'value', label: 'Value' });
    }

    if (!header.includes('List')) {
      values.columns.push({ key: 'success', label: 'Success' });
    }

    if (verbose) {
      values.columns.push({ key: 'location', label: 'Location' });
    }

    this.ux.table(this.responses, values);

    this.responses.forEach((response) => {
      if (response.error) {
        throw response.error;
      }
    });
  }

  public parseArgs(): string[] {
    const { argv } = this.parse({
      flags: this.statics.flags,
      args: this.statics.args,
      strict: this.statics.strict,
    });
    return argv;
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
