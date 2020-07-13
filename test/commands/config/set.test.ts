/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Thirdparty
import * as _ from 'lodash';
import { expect, test } from '@salesforce/command/lib/test';

describe('SetConfigCommand', () => {
  describe('execute', () => {
    test
      .withOrg({ username: 'test@org.com' }, true)
      .stdout()
      .command(['config:set', 'defaultusernames=fail@org.com', '-g', '--json'])
      .it('set test', ctx => {
        expect(ctx.stdout).to.includes('Unknown config name');
      });
  });
});
