/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Command } from '@oclif/core';
import { cli } from 'cli-ux';
import type { table } from 'cli-ux/lib/styled/table';
import { ConfigInfo, SfdxError } from '@salesforce/core';
import * as chalk from 'chalk';

export interface Msg {
  name: string;
  value?: string;
  success: boolean;
  location?: string;
  path?: string;
  message?: string;
  error?: Error;
}

export type ConfigResponses = Msg[];

export abstract class ConfigCommand extends Command {
  protected responses: ConfigResponses = [];

  protected pushSuccess(configInfo: ConfigInfo): void {
    this.responses.push({
      name: configInfo.key,
      value: configInfo.value as string | undefined,
      success: true,
      location: configInfo.location,
    });
  }

  protected pushFailure(name: string, err: string | Error, value?: string): void {
    const error = SfdxError.wrap(err);
    this.responses.push({
      name,
      success: false,
      value,
      error,
      message: error.message.replace(/\.\.$/, '.'),
    });
    process.exitCode = 1;
  }

  protected output(header: string, verbose: boolean): void {
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

    if (this.responses.find((msg) => msg.error)) {
      columns.message = { header: 'Message' };
      this.responses.map((msg) => (msg.message = msg.error?.message));
    }

    cli.table(this.responses, columns);

    this.responses.forEach((response) => {
      if (response.error) {
        // TODO I think throwing here is weird. I think instead, we should set the exitCode to 1
        // but this breaks unit tests and should be discussed with the team.
        // throw response.error;
      }
    });
  }
}
