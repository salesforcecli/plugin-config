/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags } from '@oclif/core';
import { Config, Messages, Org, SfdxError, OrgConfigProperties } from '@salesforce/core';
import { CONFIG_HELP_SECTION, ConfigCommand, ConfigResponses } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'set');

export class Set extends ConfigCommand<ConfigResponses> {
  public static readonly description = messages.getMessage('description');
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');

  public static readonly strict = false;

  public static readonly flags = {
    global: Flags.boolean({
      char: 'g',
      summary: messages.getMessage('flags.global.summary'),
    }),
  };

  public static configurationVariablesSection = CONFIG_HELP_SECTION;

  public async run(): Promise<ConfigResponses> {
    const { flags } = await this.parse(Set);
    const config: Config = await this.loadConfig(flags.global);
    let value = '';
    const configs = await this.parseConfigKeysAndValues();
    for (const name of Object.keys(configs)) {
      try {
        value = configs[name];
        // core's builtin config validation requires synchronous functions but there's
        // currently no way to validate an org synchronously. Therefore, we have to manually
        // validate the org here and manually set the error message if it fails
        if (this.isOrgKey(name) && value) await this.validateOrg(value);
        config.set(name, value);
        this.responses.push({ name, value, success: true });
      } catch (err) {
        this.pushFailure(name, err as Error, value);
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
      throw messages.createError('error.ArgumentsRequired');
    }

    // Support `config set key value`
    if (args.length === 2 && !args[0].includes('=')) {
      return { [args[0]]: args[1] };
    }

    // Ensure that all args are in the right format (e.g. key=value key1=value1)
    args.forEach((arg) => {
      const split = arg.split('=');

      if (split.length !== 2) {
        throw messages.createError('error.InvalidArgumentFormat', [arg]);
      }

      const [name, value] = split;

      if (configs[name]) {
        throw messages.createError('error.DuplicateArgument', [name]);
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

  private isOrgKey(name: string): boolean {
    const orgKeys = [OrgConfigProperties.TARGET_DEV_HUB, OrgConfigProperties.TARGET_ORG] as string[];
    return orgKeys.includes(name);
  }

  private async validateOrg(value: string): Promise<void> {
    try {
      await Org.create({ aliasOrUsername: value });
    } catch {
      throw new Error(`Invalid config value: org "${value}" is not authenticated.`);
    }
  }
}
