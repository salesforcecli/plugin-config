/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { $$, expect, test } from '@salesforce/command/lib/test';
import { ConfigAggregator, SfdxPropertyKeys } from '@salesforce/core';
import { stubMethod } from '@salesforce/ts-sinon';

describe('config:list', () => {
  test
    .do(() => {
      stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'getConfigInfo').returns([
        { key: SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME, value: 'MyDevhub', location: 'Global' },
        { key: SfdxPropertyKeys.DISABLE_TELEMETRY, value: true, location: 'Global' },
        { key: SfdxPropertyKeys.DEFAULT_USERNAME, value: 'MyUser', location: 'Local' },
        { key: SfdxPropertyKeys.API_VERSION, value: '49.0', location: 'Local' },
      ]);
    })
    .stdout()
    .command(['config:list', '--json'])
    .it('should return values for all configured properties', (ctx) => {
      const result = JSON.parse(ctx.stdout).result;
      expect(result).to.deep.equal([
        { key: SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME, value: 'MyDevhub', location: 'Global' },
        { key: SfdxPropertyKeys.DISABLE_TELEMETRY, value: true, location: 'Global' },
        { key: SfdxPropertyKeys.DEFAULT_USERNAME, value: 'MyUser', location: 'Local' },
        { key: SfdxPropertyKeys.API_VERSION, value: '49.0', location: 'Local' },
      ]);
    });

  test
    .do(() => {
      stubMethod($$.SANDBOX, ConfigAggregator.prototype, 'getConfigInfo').returns([]);
    })
    .stdout()
    .command(['config:list', '--json'])
    .it('should handle no results found', (ctx) => {
      const result = JSON.parse(ctx.stdout).result;
      expect(result).to.deep.equal([]);
    });
});
