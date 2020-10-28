/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect, test } from '@oclif/test';
import { Config } from '@salesforce/core';

describe('config:set', () => {
  test
    .stdout()
    .command(['config:set', `${Config.DEFAULT_USERNAME}=NonExistentOrg`, '--global', '--json'])
    .it('should handle failed org create with --json flag', (ctx) => {
      const response = JSON.parse(ctx.stdout);
      expect(response.status).to.equal(1);
      expect(response.result.failures).to.deep.equal([
        { name: Config.DEFAULT_USERNAME, message: 'No AuthInfo found for name NonExistentOrg' },
      ]);
    });

  test
    .stdout()
    .command(['config:set', `${Config.DEFAULT_USERNAME}=NonExistentOrg`, '--global'])
    .it('should handle failed org create with no --json flag', (ctx) => {
      expect(ctx.stdout).to.include(Config.DEFAULT_USERNAME);
      expect(ctx.stdout).to.include('NonExistentOrg');
      expect(ctx.stdout).to.include('false');
    });
});
