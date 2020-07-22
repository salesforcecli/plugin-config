/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Thirdparty

import * as sinon from 'sinon';
import { test, expect } from '@salesforce/command/lib/test';
import { Config } from '@salesforce/core';
import { Set } from '../../../src/commands/config/set';

describe('config:set', () => {
  const sandbox = sinon.createSandbox();

  sandbox.stub(Set.prototype, 'output').callsFake(() => {
    return {};
  });

  let configSpy: sinon.SinonSpy;

  beforeEach(() => {
    configSpy = sinon.spy(Config.prototype, 'set');
  });

  afterEach(() => {
    configSpy.restore();
  });

  test
    .command(['config:set', 'apiVersion=49.0', '-g'])
    .it('sets Api Version', () => {
      expect(configSpy.callCount).to.equal(1);
      expect(configSpy.args[0][0]).to.equal('apiVersion');
      expect(configSpy.args[0][1]).to.equal('49.0');
    });

  test
    .command(['config:set', 'apiVersion=49', '-g'])
    .it('fails to set Api Version', ctx => {
      expect(configSpy.threw()).to.be.true;
    });

  it('setting api wrong', () => {
    test.command(['config:set', 'apiV=49.0', '-g']).catch((err: Error) => {
      console.log(err);
    });
  });
});
