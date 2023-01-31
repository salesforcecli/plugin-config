/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfdxCommand } from '@salesforce/command';
import { SfError } from '@salesforce/core';
import { Optional } from '@salesforce/ts-types';
import * as chalk from 'chalk';
import { ux } from '@oclif/core';

export interface Msg {
  name: string;
  value?: string;
  success: boolean;
  location?: string;
  error?: SfError;
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
    const columns: ux.Table.table.Columns<Record<string, unknown>> = {
      name: { header: 'Name' },
    };

    if (!header.includes('Unset')) {
      columns['value'] = { header: 'Value' };
    }

    if (!header.includes('List')) {
      columns['success'] = { header: 'Success' };
    }

    if (verbose) {
      columns['location'] = { header: 'Location' };
    }

    this.ux.table(this.responses, columns);

    this.responses.forEach((response) => {
      if (response.error) {
        throw response.error;
      }
    });
  }

  public async parseArgs(): Promise<string[]> {
    const { argv } = await this.parse({
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
