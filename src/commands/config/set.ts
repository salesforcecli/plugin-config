/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags } from '@oclif/core';
import { Config, Messages, Org, SfdxPropertyKeys, SfdxError } from '@salesforce/core';
import { ConfigCommand, ConfigResponses } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'set');

export class Set extends ConfigCommand {
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly strict = false;

  public static readonly flags = {
    global: Flags.boolean({
      char: 'g',
      summary: messages.getMessage('global'),
      description: messages.getMessage('globalLong'),
    }),
  };

  public async run(): Promise<ConfigResponses> {
    const { flags } = await this.parse(Set);
    const config: Config = await this.loadConfig(flags.global);
    let value = '';
    const configs = await this.parseConfigKeysAndValues();
    for (const name of Object.keys(configs)) {
      try {
        value = configs[name];
        const isOrgKey =
          name === SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME || name === SfdxPropertyKeys.DEFAULT_USERNAME;
        if (isOrgKey && value) {
          await Org.create({ aliasOrUsername: value });
        }
        config.set(name, value);
        this.responses.push({ name, value, success: true });
      } catch (err) {
        this.pushFailure(name, err, value);
      }
    }
    await config.write();
    if (!this.jsonEnabled()) {
      this.output('Set Config', false);
    }
    return this.responses;
  }

  protected async resolveArguments(): Promise<string[]> {
    const { args, argv } = await this.parse(Set);

    const argVals = Object.values(args);
    return argv.filter((val) => !argVals.includes(val));
  }

  protected async parseConfigKeysAndValues(): Promise<{ [index: string]: string }> {
    const configs: { [index: string]: string } = {};
    const args = await this.resolveArguments();

    if (!args.length) {
      throw messages.createError('ArgumentsRequired');
    }

    // Support `config set key value`
    if (args.length === 2 && !args[0].includes('=')) {
      return { [args[0]]: args[1] };
    }

    // Ensure that all args are in the right format (e.g. key=value key1=value1)
    args.forEach((arg) => {
      const split = arg.split('=');

      if (split.length !== 2) {
        throw messages.createError('InvalidArgumentFormat', [arg]);
      }

      const [name, value] = split;

      if (configs[name]) {
        throw messages.createError('DuplicateArgument', [name]);
      }

      configs[name] = value || undefined;
    });

    return configs;
  }

  protected async loadConfig(global: boolean): Promise<Config> {
    try {
      const config = await Config.create(Config.getDefaultOptions(global));
      await config.read();
      return config;
    } catch (error) {
      if (error instanceof SfdxError) {
        error.actions = error.actions || [];
        error.actions.push('Run with --global to set for your entire workspace.');
      }
      throw error;
    }
  }
}
