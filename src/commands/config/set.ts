/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Thirdparty
import * as _ from 'lodash';

import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Config, Messages, Org } from '@salesforce/core';
import { JsonMap } from '@salesforce/ts-types';
import chalk from 'chalk';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'set');

interface SuccessMsg extends JsonMap {
  name: string;
  value: string;
}

interface FailureMsg extends JsonMap {
  name: string;
  message: string;
}

export class Set extends SfdxCommand {
  public static readonly theDescription = messages.getMessage(
    'en_US.description'
  );
  public static readonly longDescription = messages.getMessage(
    'en_US.descriptionLong'
  );
  public static readonly help = messages.getMessage('en_US.help');
  public static readonly requiresProject = false;
  public static readonly varargs = { required: true };
  public static readonly flagsConfig: FlagsConfig = {
    global: flags.boolean({
      char: 'g',
      description: messages.getMessage('en_US.global'),
      longDescription: messages.getMessage('en_US.globalLong'),
      required: false
    })
  };

  private successes: SuccessMsg[] = [];
  private failures: FailureMsg[] = [];

  public async run(): Promise<JsonMap> {
    for (const name of Object.keys(this.varargs!)) {
      try {
        const value: string = (this.varargs![name] as unknown) as string;
        if (
          name === Config.DEFAULT_DEV_HUB_USERNAME ||
          name === Config.DEFAULT_USERNAME
        ) {
          if (value) await Org.create({ aliasOrUsername: value });
        }
        await this.setConfig(name, value, this.flags.global);
        this.successes.push({ name, value });
      } catch (err) {
        this.failures.push({ name, message: err.message });
      }
    }
    this.output();
    return { successes: this.successes, failures: this.failures };
  }

  async setConfig(key: string, value: string, isGlobal: boolean = false) {
    let config: Config;
    config = await Config.create(Config.getDefaultOptions(isGlobal));
    return config
      .read()
      .then(result => {
        config.set(key, value);
      })
      .then(() => config.write());
  }

  public output() {
    if (this.successes.length > 0) {
      this.ux.styledHeader(chalk.blue('Set Config'));
      this.ux.table(this.successes, {
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'value', label: 'Value' }
        ]
      });
    }

    if (this.failures.length > 0) {
      if (this.successes.length > 0) {
        this.log('');
      }

      this.ux.styledHeader(chalk.red('Failures'));
      this.ux.table(this.failures, {
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'message', label: 'Message' }
        ]
      });
    }
  }
}
