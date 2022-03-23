/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { test, expect } from '@oclif/test';
import { ConfigAggregator, OrgConfigProperties } from '@salesforce/core';
import { stubMethod } from '@salesforce/ts-sinon';
import { SinonSandbox } from 'sinon';
import * as sinon from 'sinon';
import { SfConfigProperties } from '@salesforce/core/lib/config/config';

describe('config:list', () => {
  let sandbox: SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  test
    .do(() => {
      stubMethod(sandbox, ConfigAggregator.prototype, 'getConfigInfo').returns([
        { key: OrgConfigProperties.TARGET_DEV_HUB, value: 'MyDevhub', location: 'Global' },
        { key: SfConfigProperties.DISABLE_TELEMETRY, value: true, location: 'Global' },
        { key: OrgConfigProperties.TARGET_ORG, value: 'MyUser', location: 'Local' },
        { key: OrgConfigProperties.ORG_API_VERSION, value: '49.0', location: 'Local' },
      ]);
    })
    .stdout()
    .command(['config:list', '--json'])
    .it('should return values for all configured properties', (ctx) => {
      const { result } = JSON.parse(ctx.stdout);
      expect(result).to.deep.equal([
        { name: OrgConfigProperties.TARGET_DEV_HUB, value: 'MyDevhub', location: 'Global', success: true },
        { name: SfConfigProperties.DISABLE_TELEMETRY, value: true, location: 'Global', success: true },
        { name: OrgConfigProperties.TARGET_ORG, value: 'MyUser', location: 'Local', success: true },
        { name: OrgConfigProperties.ORG_API_VERSION, value: '49.0', location: 'Local', success: true },
      ]);
    });

  test
    .do(() => {
      stubMethod(sandbox, ConfigAggregator.prototype, 'getConfigInfo').returns([]);
    })
    .stdout()
    .command(['config:list', '--json'])
    .it('should handle no results found', (ctx) => {
      const { result } = JSON.parse(ctx.stdout);
      expect(result).to.deep.equal([]);
    });
});
