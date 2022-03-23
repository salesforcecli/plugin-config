/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { test, expect } from '@oclif/test';
import { ConfigAggregator, OrgConfigProperties } from '@salesforce/core';
import { stubMethod } from '@salesforce/ts-sinon';
import { Plugin } from '@oclif/core';
import * as sinon from 'sinon';
import { SinonSandbox } from 'sinon';
import { SfConfigProperties } from '@salesforce/core/lib/config/config';

process.env.NODE_ENV = 'development';

describe('config:get', () => {
  let sandbox: SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  async function prepareStubs(global = true) {
    const location = global ? 'Global' : 'Local';
    stubMethod(sandbox, ConfigAggregator.prototype, 'getInfo')
      .withArgs(OrgConfigProperties.TARGET_DEV_HUB)
      .returns({ key: OrgConfigProperties.TARGET_DEV_HUB, value: 'MyDevhub', location })
      .withArgs(OrgConfigProperties.TARGET_ORG)
      .returns({ key: OrgConfigProperties.TARGET_ORG, value: 'MyUser', location })
      .withArgs(OrgConfigProperties.ORG_API_VERSION)
      .returns({ key: OrgConfigProperties.ORG_API_VERSION })
      .withArgs(SfConfigProperties.DISABLE_TELEMETRY)
      .throws('FAILED');
  }

  test
    .do(async () => await prepareStubs(true))
    .stdout()
    .command(['config:get', OrgConfigProperties.TARGET_DEV_HUB, OrgConfigProperties.TARGET_ORG, '--json'])
    .it('should return values for globally configured properties', (ctx) => {
      const { result } = JSON.parse(ctx.stdout);
      expect(result).to.deep.equal([
        { name: OrgConfigProperties.TARGET_DEV_HUB, value: 'MyDevhub', location: 'Global', success: true },
        { name: OrgConfigProperties.TARGET_ORG, value: 'MyUser', location: 'Global', success: true },
      ]);
    });

  test
    .do(async () => await prepareStubs(false))
    .stdout()
    .command(['config:get', OrgConfigProperties.TARGET_DEV_HUB, OrgConfigProperties.TARGET_ORG, '--json'])
    .it('should return values for locally configured properties', (ctx) => {
      const { result } = JSON.parse(ctx.stdout);
      expect(result).to.deep.equal([
        { name: OrgConfigProperties.TARGET_DEV_HUB, value: 'MyDevhub', location: 'Local', success: true },
        { name: OrgConfigProperties.TARGET_ORG, value: 'MyUser', location: 'Local', success: true },
      ]);
    });

  test
    .do(async () => await prepareStubs())
    .stdout()
    .command(['config:get', OrgConfigProperties.ORG_API_VERSION, '--json'])
    .it('should gracefully handle unconfigured properties', (ctx) => {
      const { result } = JSON.parse(ctx.stdout);
      expect(result).to.deep.equal([
        {
          name: OrgConfigProperties.ORG_API_VERSION,
          success: true,
        },
      ]);
    });

  test
    .do(async () => await prepareStubs())
    .stdout()
    .command(['config:get', '--json'])
    .it('should throw an error when no keys are provided', (ctx) => {
      const response = JSON.parse(ctx.stdout);
      expect(response.name).to.equal('NoConfigKeysFoundError');
    });

  test
    .do(async () => await prepareStubs())
    .stdout()
    .command(['config:get', SfConfigProperties.DISABLE_TELEMETRY, '--json'])
    .it('should gracefully handle failed attempts to ConfigAggregator.getInfo', (ctx) => {
      const response = JSON.parse(ctx.stdout);
      expect(response.result[0].error.name).to.equal('FAILED');
    });

  describe('load custom config meta', () => {
    test
      .stdout()
      .command(['config:get', 'customKey', '--json'])
      .it('fails when there is no matching loaded custom key', (ctx) => {
        const response = JSON.parse(ctx.stdout);
        expect(response.result[0].message).to.equal('Unknown config name: customKey.');
      });

    test
      .loadConfig()
      .do((ctx) => {
        const mockPluginRoot = path.resolve(__dirname, '../../config-meta-mocks/typescript-src');
        ctx.config.plugins.push({
          root: mockPluginRoot,
          hooks: {},
          pjson: require(path.resolve(mockPluginRoot, 'package.json')),
          commands: [],
        } as Plugin);
      })
      .stdout()
      .stderr()
      .command(['config:get', 'customKey', '--json'])
      .it('should allow custom config meta for allowedProperties', (ctx) => {
        const response = JSON.parse(ctx.stdout);
        expect(response.result).to.deep.equal([
          {
            name: 'customKey',
            success: true,
          },
        ]);
      });
  });
});
