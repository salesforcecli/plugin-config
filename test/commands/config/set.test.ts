/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Thirdparty

// import { IConfig } from '@oclif/config';
// import { strictEqual } from 'assert';

import * as sinon from 'sinon';
// import { stubMethod } from '@salesforce/ts-sinon';
// import {
//   testSetup,
//   MockTestOrgData,
//   stubContext,
//   restoreContext
// } from '@salesforce/core/lib/testSetup';
import { expect, test } from '@salesforce/command/lib/test';

// import { test, expect } from '@salesforce/command/lib/test';

// import { assert } from 'chai';
// import { Set } from '../../../src/commands/config/set';
import { Config } from '@salesforce/core';
// import { Helper } from '../../../src/helper';
// import { afterEach } from 'mocha';
// import { AuthInfoConfig } from '@salesforce/core';

// Messages.importMessagesDirectory(__dirname);
// const messages = Messages.loadMessages('@salesforce/plugin-config', 'set');

// const $$ = testSetup();

describe('config:set', () => {
  // let command;

  beforeEach(async () => {
    // stubContext($$);
    // stubMethod($$.SANDBOX, Config.prototype, 'read').callsFake(function() {
    //   return Promise.resolve({});
    // });
    // stubMethod($$.SANDBOX, Config.prototype, 'write').callsFake(function() {
    //   return Promise.resolve({});
    // });
    // stubMethod($$.SANDBOX, Helper, 'output').callsFake(function() {
    //   return {};
    // });
    // const username = 'foo@bar.com';
    // const testData = new MockTestOrgData();
    // testData.username = username;
    // $$.configStubs.AuthInfoConfig = { contents: await testData.getConfig() };
    // await Org.create({ aliasOrUsername: testData.username });
    // $$.setConfigStubContents('AuthInfoConfig', {
    //   contents: await testData.getConfig()
    // });
    // await Connection.create({
    //   authInfo: await AuthInfo.create({
    //     username: testData.username
    //   })
    // });
    // testData.createUser('test@org.com');
    // console.log(testData.getMockUserInfo());
  });

  // afterEach(() => {
  //   restoreContext($$);
  // });

  // const set = (argv: string[]) => {
  //   command = new Set(argv, {} as IConfig);
  //   // command.run()
  //   return command._run();
  // };

  // it('example fail check', async () => {
  //   try {
  //     set(['defaultusername=' + 'hello', '-g']);
  //     assert.fail;
  //   } catch (err) {
  //     console.log('Error?');
  //   }
  // });

  // it('passing config:set command', () => {
  //   const command = new S();
  // });
});

describe('config:set', () => {
  const configSpy = sinon.spy(Config.prototype, 'set');

  // test
  //   // .withOrg({ username: 'abc@test.com' }, true)
  //   .command(['config:set', 'apiVersion=49.0', '-g'])
  //   .it('sets apiVersion', () => {
  //     expect(configSpy.callCount).to.equal(1);
  //     expect(configSpy.args[0][0]).to.equal('apiVersion');
  //     expect(configSpy.args[0][1]).to.equal('49.0');
  //   });

  test
    // .withOrg({ username: 'abc@test.com' }, true)
    .command(['config:set', 'apiVersion=49', '-g'])
    .it('sets apiVersion and fails', () => {
      expect(configSpy.threw()).to.be.true;
      // expect(ctx.error.name).to.be.equal('Invalid Config Value');
    });
});
