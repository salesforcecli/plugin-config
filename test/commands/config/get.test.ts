/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { $$, expect, test } from '@salesforce/command/lib/test';
import { ConfigAggregator, SfdxPropertyKeys } from '@salesforce/core';
import { stubMethod } from '@salesforce/ts-sinon';
import { Plugin } from '@oclif/core';

describe('config:get', () => {
  async function prepareStubs(global = true) {
    const location = global ? 'Global' : 'Local';
    stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'getInfo')
      .withArgs(SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME)
      .returns({ key: SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME, value: 'MyDevhub', location })
      .withArgs(SfdxPropertyKeys.DEFAULT_USERNAME)
      .returns({ key: SfdxPropertyKeys.DEFAULT_USERNAME, value: 'MyUser', location })
      .withArgs(SfdxPropertyKeys.API_VERSION)
      .returns({ key: SfdxPropertyKeys.API_VERSION })
      .withArgs(SfdxPropertyKeys.DISABLE_TELEMETRY)
      .throws('FAILED');
  }

  test
    .do(async () => await prepareStubs(true))
    .stdout()
    .command(['config:get', SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME, SfdxPropertyKeys.DEFAULT_USERNAME, '--json'])
    .it('should return values for globally configured properties', (ctx) => {
      const result = JSON.parse(ctx.stdout).result;
      expect(result).to.deep.equal([
        { key: SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME, value: 'MyDevhub', location: 'Global' },
        { key: SfdxPropertyKeys.DEFAULT_USERNAME, value: 'MyUser', location: 'Global' },
      ]);
    });

  test
    .do(async () => await prepareStubs(false))
    .stdout()
    .command(['config:get', SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME, SfdxPropertyKeys.DEFAULT_USERNAME, '--json'])
    .it('should return values for locally configured properties', (ctx) => {
      const result = JSON.parse(ctx.stdout).result;
      expect(result).to.deep.equal([
        { key: SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME, value: 'MyDevhub', location: 'Local' },
        { key: SfdxPropertyKeys.DEFAULT_USERNAME, value: 'MyUser', location: 'Local' },
      ]);
    });

  test
    .do(async () => await prepareStubs())
    .stdout()
    .command(['config:get', SfdxPropertyKeys.API_VERSION, '--json'])
    .it('should gracefully handle unconfigured properties', (ctx) => {
      const result = JSON.parse(ctx.stdout).result;
      expect(result).to.deep.equal([{ key: SfdxPropertyKeys.API_VERSION }]);
    });

  test
    .do(async () => await prepareStubs())
    .stdout()
    .command(['config:get', '--json'])
    .it('should throw an error when no keys are provided', (ctx) => {
      const response = JSON.parse(ctx.stdout);
      expect(response.status).to.equal(1);
      expect(response.name).to.equal('NoConfigKeysFound');
    });

  test
    .do(async () => await prepareStubs())
    .stdout()
    .command(['config:get', SfdxPropertyKeys.DISABLE_TELEMETRY, '--json'])
    .it('should gracefully handle failed attempts to ConfigAggregator.getInfo', (ctx) => {
      const response = JSON.parse(ctx.stdout);
      expect(response.status).to.equal(1);
      expect(response.name).to.equal('FAILED');
    });

  describe('load custom config meta', () => {
    test
      .stdout()
      .command(['config:get', 'customKey', '--json'])
      .it('fails when there is no matching loaded custom key', (ctx) => {
        const response = JSON.parse(ctx.stdout);
        expect(response.exitCode).to.equal(1);
        expect(response.status).to.equal(1);
        expect(response.message).to.equal('Unknown config name: customKey.');
      });

    test
      .loadConfig()
      .do((ctx) => {
        const mockPluginRoot = path.resolve(__dirname, '../../config-meta-mocks/typescript-src');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ctx.config.commands.id = 'config:get';
        ctx.config.plugins.push({
          root: mockPluginRoot,
          hooks: {},
          pjson: require(path.resolve(mockPluginRoot, 'package.json')),
        } as Plugin);
      })
      .stdout()
      .stderr()
      .command(['config:get', 'customKey', '--json'])
      .it('should allow custom config meta for allowedProperties', (ctx) => {
        const response = JSON.parse(ctx.stdout);
        expect(response.status).to.equal(0);
        expect(response.result).to.deep.equal([
          {
            deprecated: false,
            key: 'customKey',
          },
        ]);
      });
  });
});
