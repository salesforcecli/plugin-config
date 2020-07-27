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

describe('config:get', () => {

  describe('Testing calls made to core\'s ConfigAggregator.getInfo() method', () => {
    const sandbox = sinon.createSandbox();

    let getInfoSpy: sinon.SinonSpy;

    beforeEach(() => {
      getInfoSpy = sandbox.spy(ConfigAggregator.prototype, 'getInfo');
    });

    afterEach(() => {
      sandbox.restore();
    });

    test
      .stdout()
      .command(['config:list'])
      .it('Gets info for correct arguments', () => {
        expect(getInfoSpy.callCount).to.equal(3);
        expect(getInfoSpy.args[0][0]).to.equal('apiVersion');
        expect(getInfoSpy.args[1][0]).to.equal('defaultdevhubusername');
        expect(getInfoSpy.args[2][0]).to.equal('defaultusername');
      });

    test
      .stdout()
      .stderr()
      .command([
        'config:list',
        '--json',
        '--loglevel=warn'
      ])
      .it('Does not get info for flag arguements', () => {
        expect(getInfoSpy.callCount).to.equal(3);
        expect(getInfoSpy.args[0][0]).to.equal('apiVersion');
        expect(getInfoSpy.args[1][0]).to.equal('defaultdevhubusername');
        expect(getInfoSpy.args[2][0]).to.equal('badarg');
      });
  });

  describe('Testing errors that can be thrown', () => {
    //Unexpected argument test
  });

  describe('Testing console output', () => {

  });

  describe('Testing JSON output', () => {

  });

});
