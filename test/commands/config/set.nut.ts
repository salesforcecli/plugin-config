/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from '@salesforce/command/lib/test';
import { Config } from '../../../../sfdx-core';

let testSession: TestSession;

function verifyKeysAndValues(key: string, value: string | number, result) {
  const res = execCmd(`config:set ${key}=${value} --json`).jsonOutput;
  expect(res).to.deep.equal(result);
  execCmd(`config:unset ${key}`);
}

function verifyKeysAndValuesSuccess(key: string, value: string | boolean) {
  const res = execCmd(`config:set ${key}=${value} --json`, { ensureExitCode: 0 }).jsonOutput;
  expect(res).to.deep.equal({
    status: 0,
    result: {
      successes: [
        {
          name: key,
          // value will always be a string
          value: `${value}`,
        },
      ],
      failures: [],
    },
  });
  execCmd(`config:unset ${key}`);
}
function verifyKeysAndValuesStdout(key: string, value: string | boolean, assertions: string[]) {
  const res = execCmd(`config:set ${key}=${value}`).shellOutput.stdout;
  expect(res).to.include('=== Set Config');
  assertions.forEach((assertion) => {
    expect(res).to.include(assertion);
  });

  execCmd(`config:unset ${key}`);
}

describe('config:set NUTs', () => {
  testSession = TestSession.create({
    project: { name: 'configSetNUTs' },
  });

  describe('config:set errors', () => {
    it('fails to set a randomKey with InvalidVarargsFormat error', () => {
      const res = execCmd('config:set randomKey --json');
      expect(res.jsonOutput.stack).to.include('InvalidVarargsFormat');
      delete res.jsonOutput.stack;
      expect(res.jsonOutput).to.deep.equal({
        status: 1,
        name: 'InvalidVarargsFormat',
        message:
          'Setting variables must be in the format <key>=<value> or <key>="<value with spaces>" but found randomKey.',
        exitCode: 1,
        commandName: 'Set',
        warnings: [],
      });
    });

    it('fails to set randomKey=randomValue', () => {
      const res = execCmd('config:set randomKey=randomValue --json').jsonOutput;
      expect(res).to.deep.equal({
        status: 1,
        result: {
          successes: [],
          failures: [
            {
              name: 'randomKey',
              message: 'Unknown config name "randomKey"',
            },
          ],
        },
      });
    });
  });

  describe('setting valid configs and values', () => {
    describe('apiVersion', () => {
      it('will set apiVersion correctly', () => {
        verifyKeysAndValuesSuccess('apiVersion', '50.0');
        verifyKeysAndValuesStdout('apiVersion', '50.0', ['apiVersion', '50.0']);
      });

      it('will fail to validate apiVersion', () => {
        verifyKeysAndValues('apiVersion', '50', {
          status: 1,
          result: {
            successes: [],
            failures: [
              {
                name: 'apiVersion',
                message: 'Invalid config value. Specify a valid Salesforce API version, for example, 42.0',
              },
            ],
          },
        });
      });
    });

    describe('maxQueryLimit', () => {
      it('will set maxQueryLimit correctly', () => {
        verifyKeysAndValuesSuccess('maxQueryLimit', '50');
        verifyKeysAndValuesStdout('maxQueryLimit', '50', ['maxQueryLimit', '50']);
      });

      it('will fail to validate maxQueryLimit', () => {
        verifyKeysAndValues('maxQueryLimit', '-2', {
          status: 1,
          result: {
            successes: [],
            failures: [
              {
                name: 'maxQueryLimit',
                message: 'Invalid config value. Specify a valid positive integer, for example, 150000',
              },
            ],
          },
        });
      });
    });

    describe('instanceUrl', () => {
      it('will set instanceUrl correctly', () => {
        verifyKeysAndValuesSuccess('instanceUrl', 'https://test.my.salesforce.com');
        verifyKeysAndValuesStdout('instanceUrl', 'https://test.my.salesforce.com', [
          'instanceUrl',
          'https://test.my.salesforce.com',
        ]);
      });

      it('will fail to validate instanceUrl', () => {
        verifyKeysAndValues('instanceUrl', 'abc.com', {
          status: 1,
          result: {
            successes: [],
            failures: [
              {
                name: 'instanceUrl',
                message: 'Invalid config value. Specify a valid Salesforce instance URL',
              },
            ],
          },
        });
      });
    });

    describe('defaultdevhubusername', () => {
      it('will fail to validate defaultdevhubusername', () => {
        verifyKeysAndValues('defaultdevhubusername', 'ab', {
          status: 1,
          result: {
            successes: [],
            failures: [
              {
                name: 'defaultdevhubusername',
                message: 'No AuthInfo found for name ab',
              },
            ],
          },
        });
      });
    });

    describe('defaultusername', () => {
      it('will fail to validate defaultusername', () => {
        verifyKeysAndValues('defaultusername', 'ab', {
          status: 1,
          result: {
            successes: [],
            failures: [
              {
                name: 'defaultusername',
                message: 'No AuthInfo found for name ab',
              },
            ],
          },
        });
      });
    });

    describe('isvDebuggerSid', () => {
      it('will set isvDebuggerSid correctly', () => {
        verifyKeysAndValuesSuccess('isvDebuggerSid', '12');
      });
    });

    describe('isvDebuggerUrl', () => {
      it('will set isvDebuggerUrl correctly', () => {
        verifyKeysAndValuesSuccess('isvDebuggerUrl', '12');
      });
    });

    describe('disableTelemetry', () => {
      it('will set disableTelemetry correctly', () => {
        verifyKeysAndValuesSuccess('disableTelemetry', 'true');
        verifyKeysAndValuesSuccess('disableTelemetry', false);
        verifyKeysAndValuesStdout('disableTelemetry', 'true', ['disableTelemetry', 'true']);
        verifyKeysAndValuesStdout('disableTelemetry', false, ['disableTelemetry', 'false']);
      });

      it('will fail to validate disableTelemetry', () => {
        verifyKeysAndValues('disableTelemetry', 'ab', {
          status: 1,
          result: {
            successes: [],
            failures: [
              {
                name: 'disableTelemetry',
                message: 'Invalid config value. The config value can only be set to true or false.',
              },
            ],
          },
        });
      });
    });

    describe('restDeploy', () => {
      it('will set restDeploy correctly', () => {
        verifyKeysAndValuesSuccess('restDeploy', 'true');
        verifyKeysAndValuesSuccess('restDeploy', false);
        verifyKeysAndValuesStdout('restDeploy', 'true', ['restDeploy', 'true']);
        verifyKeysAndValuesStdout('restDeploy', false, ['restDeploy', 'false']);
      });

      it('will fail to validate restDeploy', () => {
        Config.getAllowedProperties()[0].input.failedMessage;
        verifyKeysAndValues('restDeploy', 'ab', {
          status: 1,
          result: {
            successes: [],
            failures: [
              {
                name: 'restDeploy',
                message: 'Invalid config value. The config value can only be set to true or false.',
              },
            ],
          },
        });
      });
    });
  });

  describe('set two keys and values properly', () => {
    it('will set both apiVersion and maxQueryLimit in one command', () => {
      const res = execCmd('config:set apiVersion=51.0 maxQueryLimit=100 --json').jsonOutput;
      expect(res).to.deep.equal({
        status: 0,
        result: {
          successes: [
            {
              name: 'apiVersion',
              value: '51.0',
            },
            {
              name: 'maxQueryLimit',
              value: '100',
            },
          ],
          failures: [],
        },
      });
      execCmd('config:unset apiVersion maxQueryLimit');

      const res2 = execCmd('config:set apiVersion=51.0 maxQueryLimit=100', { ensureExitCode: 0 }).shellOutput.stdout;
      expect(res2).to.include('=== Set Config');
      expect(res2).to.include('apiVersion');
      expect(res2).to.include('51.0');
      expect(res2).to.include('maxQueryLimit');
      expect(res2).to.include('100');

      execCmd('config:unset apiVersion maxQueryLimit');
    });
  });
});

after(async () => {
  await testSession?.clean();
});
