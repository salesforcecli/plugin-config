/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfCommand } from '@salesforce/sf-plugins-core';
import { CliUx } from '@oclif/core';
import { ConfigInfo, OrgConfigProperties, SfdxError, SfdxPropertyKeys } from '@salesforce/core';
import { toHelpSection } from '@salesforce/sf-plugins-core';

export type Msg = {
  name: string;
  value?: string;
  success: boolean;
  location?: string;
  path?: string;
  message?: string;
  error?: Error;
};

export type ConfigResponses = Msg[];

export const CONFIG_HELP_SECTION = toHelpSection(
  'CONFIGURATION VARIABLES',
  SfdxPropertyKeys.API_VERSION,
  SfdxPropertyKeys.DISABLE_TELEMETRY,
  SfdxPropertyKeys.INSTANCE_URL,
  SfdxPropertyKeys.MAX_QUERY_LIMIT,
  SfdxPropertyKeys.REST_DEPLOY,
  OrgConfigProperties.TARGET_ORG,
  OrgConfigProperties.TARGET_DEV_HUB
);

export abstract class ConfigCommand<T> extends SfCommand<T> {
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

  protected output(title: string, verbose: boolean): void {
    if (this.responses.length === 0) {
      this.log('No results found');
      return;
    }

    const columns: CliUx.Table.table.Columns<Msg> = {
      name: { header: 'Name' },
    };

    if (!title.includes('Unset')) {
      columns.value = {
        header: 'Value',
        get: (row): string => row.value ?? '',
      };
    }

    if (!title.includes('List')) {
      columns.success = { header: 'Success' };
    }

    if (verbose) {
      columns.location = {
        header: 'Location',
        get: (row): string => row.location ?? '',
      };
    }

    if (this.responses.find((msg) => msg.error)) {
      columns.message = {
        header: 'Message',
        get: (row): string => row.message ?? '',
      };
      this.responses.map((msg) => (msg.message = msg.error?.message));
    }

    this.table(this.responses, columns, { title });
  }
}
