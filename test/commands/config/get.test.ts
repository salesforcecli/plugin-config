/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Thirdparty

import * as sinon from 'sinon';
import { test, expect } from '@salesforce/command/lib/test';
import { ConfigAggregator } from '@salesforce/core';
import Get from '../../../src/commands/config/get';

describe('config:get', () => {
  const sandbox = sinon.createSandbox();

  sinon.stub(Get.prototype, 'output').callsFake(() => {
    return {};
  });

  let getInfoSpy: sinon.SinonSpy;

  beforeEach(() => {
    getInfoSpy = sandbox.spy(ConfigAggregator.prototype, 'getInfo');
  });

  afterEach(() => {
    sandbox.restore();
  });

  test
    .command(['config:get', 'defaultdevhubusername', 'defaultusername'])
    .it('Gets info with correct arguments', () => {
      expect(getInfoSpy.callCount).to.equal(2);
      expect(getInfoSpy.args[0][0]).to.equal('defaultdevhubusername');
      expect(getInfoSpy.args[1][0]).to.equal('defaultusername');
    });

  test
    .command([
      'config:get',
      'defaultdevhubusername',
      '--json',
      '--verbose',
      '--loglevel=warn'
    ])
    .it('Does not get info for flag arguements', () => {
      expect(getInfoSpy.callCount).to.equal(1);
      expect(getInfoSpy.args[0][0]).to.equal('defaultdevhubusername');
    });

  test
    .command(['config:get', 'apiVersion=49', '-g'])
    .it('fails to set Api Version', ctx => {
      expect(getInfoSpy.threw()).to.be.true;
    });

  it('setting api wrong', () => {
    test.command(['config:set', 'apiV=49.0', '-g']).catch((err: Error) => {
      console.log(err);
    });
  });
});
