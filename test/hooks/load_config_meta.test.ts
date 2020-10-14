/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { $$, expect, test } from '@salesforce/command/lib/test';
import { Config } from '@salesforce/core';
import { stubMethod } from '@salesforce/ts-sinon';
import { IPlugin } from '@oclif/config';
import { SinonStub } from 'sinon';
import tsSrcConfigMetaMock from '../config-meta-mocks/typescript-src/src/config-meta';
import jsLibConfigMetaMock from '../config-meta-mocks/javascript-lib/lib/config-meta';

describe('hooks', () => {
  beforeEach(() => {
    stubMethod($$.SANDBOX, Config, 'addAllowedProperties');
  });

  test
    .stdout()
    .loadConfig()
    .do((ctx) => {
      const mockPluginRoot = path.resolve(__dirname, '../config-meta-mocks/typescript-src');
      ctx.config.plugins.push(({
        root: mockPluginRoot,
        hooks: {},
        pjson: require(path.resolve(mockPluginRoot, 'package.json')),
      } as unknown) as IPlugin);
    })
    .hook('init')
    .do(() => {
      expect(tsSrcConfigMetaMock).to.deep.equal([
        {
          key: 'customKey',
        },
      ]);
      expect((Config.addAllowedProperties as SinonStub).firstCall.args[0]).to.deep.equal(tsSrcConfigMetaMock);
    })
    .it('loads config metas from a ts src directory');

  test
    .stdout()
    .loadConfig()
    .do((ctx) => {
      const mockPluginRoot = path.resolve(__dirname, '../config-meta-mocks/javascript-lib');
      ctx.config.plugins.push(({
        root: mockPluginRoot,
        hooks: {},
        pjson: require(path.resolve(mockPluginRoot, 'package.json')),
      } as unknown) as IPlugin);
    })
    .hook('init')
    .do(() => {
      expect(jsLibConfigMetaMock).to.deep.equal([
        {
          key: 'customKey',
        },
      ]);
      expect((Config.addAllowedProperties as SinonStub).firstCall.args[0]).to.deep.equal(jsLibConfigMetaMock);
    })
    .it('loads config metas from a js lib directory');
});
