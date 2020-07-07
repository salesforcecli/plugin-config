/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Thirdparty
import * as _ from 'lodash';

import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import {
  Messages,
  SfdxError,
  Config,
  Org,
  ConfigContents
} from '@salesforce/core';
import { Dictionary } from '@salesforce/ts-types';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'set');

const VALID_CONFIG: Dictionary<
  (key: string, value: string, isGlobal: boolean) => Promise<ConfigContents>
> = {};

interface SuccessMsg {
  name: string;
  value: string;
}

interface FailureMsg {
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

  public async run(): Promise<unknown> {
    await this.validate();
    for (const name of Object.keys(this.varargs!)) {
      const value: string = (this.varargs![name] as unknown) as string;
      try {
        await VALID_CONFIG[name]!(name, value, this.flags.global);
        this.successes.push({ name, value });
      } catch (err) {
        this.failures.push({ name, message: err.message });
      }
    }
    return {};
  }

  async validate() {
    [Config.DEFAULT_DEV_HUB_USERNAME, Config.DEFAULT_USERNAME].forEach(type => {
      VALID_CONFIG[type] = this.setOrgDefault;
    });

    Config.getAllowedProperties().forEach(prop => {
      if (_.isNil(VALID_CONFIG[prop.key])) {
        VALID_CONFIG[prop.key] = this.setConfig;
      }
    });

    Object.keys(this.varargs!).forEach(key => {
      if (!_.isFunction(VALID_CONFIG[key])) {
        throw SfdxError.create(
          '@salesforce/core',
          'config',
          'UnknownConfigKey',
          [key]
        );
      }
    });

    return;
  }

  async setConfig(key: string, value: string, isGlobal: boolean = false) {
    let config: Config;
    try {
      config = await Config.create(Config.getDefaultOptions(isGlobal));
    } catch (err) {
      if (err.name === 'InvalidProjectWorkspace') {
        err['message'] = `${err.message} ${messages.getMessage(
          'en_US.globalHelp'
        )}`;
      }
      throw err;
    }
    return config
      .read()
      .then(result => {
        config.set(key, value);
      })
      .then(() => config.write());
  }

  setOrgDefault(type: string, username: string, isGlobal: boolean) {
    if (_.isNil(username)) {
      return this.setConfig(type, username, isGlobal);
    } else {
      // Ensure the username exits by getting the config.
      return Org.create({ aliasOrUsername: username }).then(() =>
        this.setConfig(type, username, isGlobal)
      );
    }
  }
}
