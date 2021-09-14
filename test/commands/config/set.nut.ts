/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { ConfigResponses } from '../../../src/config';

let testSession: TestSession;

function verifyValidationError(key: string, value: string | number, message: string) {
  const expected = [
    {
      name: key,
      value: `${value}`,
      message,
      success: false,
    },
  ];
  const { result } = execCmd<Array<{ error: unknown }>>(`config set ${key}=${value} --json`, { cli: 'sf' }).jsonOutput;
  delete result[0].error;
  expect(result).to.deep.equal(expected);
  execCmd(`config unset ${key}`);
}

function verifyKeysAndValuesJson(key: string, value: string | boolean) {
  const { result } = execCmd(`config set ${key}=${value} --json`, { ensureExitCode: 0 }).jsonOutput;
  const expected = [{ name: key, success: true }] as ConfigResponses;
  if (value !== '') expected[0].value = `${value}`;
  expect(result).to.deep.equal(expected);
  execCmd(`config unset ${key}`);
}

function verifyKeysAndValuesStdout(key: string, value: string | boolean, assertions: string[]) {
  const res = execCmd(`config set ${key}=${value}`).shellOutput.stdout;
  expect(res).to.include('Set Config');
  assertions.forEach((assertion) => {
    expect(res).to.include(assertion);
  });

  execCmd(`config unset ${key}`);
}

describe('config set NUTs', async () => {
  testSession = await TestSession.create({
    project: { name: 'configSetNUTs' },
    authStrategy: 'NONE',
  });

  describe('config set errors', () => {
    it('fails to set a randomKey with InvalidArgumentFormat error', () => {
      const res = execCmd('config set randomKey --json', {
        cli: 'sf',
        ensureExitCode: 1,
      }).jsonOutput;
      expect(res.name).to.include('InvalidArgumentFormat');
    });

    it('fails to set randomKey=randomValue', () => {
      const { result } = execCmd<ConfigResponses>('config set randomKey=randomValue --json', {
        ensureExitCode: 1,
        cli: 'sf',
      }).jsonOutput;
      expect(result[0].name).to.equal('randomKey');
      expect(result[0].message).to.equal('Unknown config name: randomKey.');
      expect(result[0].success).to.be.false;
    });
  });

  describe('setting valid configs and values', () => {
    describe('apiVersion', () => {
      it('will set apiVersion correctly', () => {
        verifyKeysAndValuesJson('apiVersion', '50.0');
        verifyKeysAndValuesStdout('apiVersion', '50.0', ['apiVersion', '50.0']);
      });

      it('will fail to validate apiVersion', () => {
        verifyValidationError(
          'apiVersion',
          '50',
          'Invalid config value: Specify a valid Salesforce API version, for example, 42.0.'
        );
      });
    });

    describe('maxQueryLimit', () => {
      it('will set maxQueryLimit correctly', () => {
        verifyKeysAndValuesJson('maxQueryLimit', '50');
        verifyKeysAndValuesStdout('maxQueryLimit', '50', ['maxQueryLimit', '50']);
      });

      it('will fail to validate maxQueryLimit', () => {
        verifyValidationError(
          'maxQueryLimit',
          '-2',
          'Invalid config value: Specify a valid positive integer, for example, 150000.'
        );
      });
    });

    describe('instanceUrl', () => {
      it('will set instanceUrl correctly', () => {
        verifyKeysAndValuesJson('instanceUrl', 'https://test.my.salesforce.com');
        verifyKeysAndValuesStdout('instanceUrl', 'https://test.my.salesforce.com', [
          'instanceUrl',
          'https://test.my.salesforce.com',
        ]);
      });

      it('will fail to validate instanceUrl when non-Salesforce URL', () => {
        verifyValidationError(
          'instanceUrl',
          'abc.com',
          'Invalid config value: Specify a valid Salesforce instance URL.'
        );
      });
    });

    describe('target-org', () => {
      it('will fail to validate target-org', () => {
        verifyValidationError('target-org', 'ab', 'Invalid config value: org "ab" is not authenticated.');
      });
    });

    describe('target-dev-hub', () => {
      it('will fail to validate target-dev-hub', () => {
        verifyValidationError('target-dev-hub', 'ab', 'Invalid config value: org "ab" is not authenticated.');
      });
    });

    describe('isvDebuggerSid', () => {
      it('will set isvDebuggerSid correctly', () => {
        verifyKeysAndValuesJson('isvDebuggerSid', '12');
      });
    });

    describe('isvDebuggerUrl', () => {
      it('will set isvDebuggerUrl correctly', () => {
        verifyKeysAndValuesJson('isvDebuggerUrl', '12');
      });
    });

    describe('disableTelemetry', () => {
      it('will set disableTelemetry correctly', () => {
        verifyKeysAndValuesJson('disableTelemetry', 'true');
        verifyKeysAndValuesJson('disableTelemetry', false);
        verifyKeysAndValuesStdout('disableTelemetry', 'true', ['disableTelemetry', 'true']);
        verifyKeysAndValuesStdout('disableTelemetry', false, ['disableTelemetry', 'false']);
      });

      it('will fail to validate disableTelemetry', () => {
        verifyValidationError(
          'disableTelemetry',
          'ab',
          'Invalid config value: The config value can only be set to true or false.'
        );
      });
    });

    describe('restDeploy', () => {
      it('will set restDeploy correctly', () => {
        verifyKeysAndValuesJson('restDeploy', 'true');
        verifyKeysAndValuesJson('restDeploy', false);
        verifyKeysAndValuesStdout('restDeploy', 'true', ['restDeploy', 'true']);
        verifyKeysAndValuesStdout('restDeploy', false, ['restDeploy', 'false']);
      });

      it('will fail to validate restDeploy', () => {
        verifyValidationError(
          'restDeploy',
          'ab',
          'Invalid config value: The config value can only be set to true or false.'
        );
      });
    });
  });

  describe('set two keys and values properly', () => {
    it('will set both apiVersion and maxQueryLimit in one command', () => {
      const { result } = execCmd('config set apiVersion=51.0 maxQueryLimit=100 --json').jsonOutput;
      expect(result).to.deep.equal([
        {
          name: 'apiVersion',
          value: '51.0',
          success: true,
        },
        {
          name: 'maxQueryLimit',
          value: '100',
          success: true,
        },
      ]);
      execCmd('config unset apiVersion maxQueryLimit');

      const res2 = execCmd('config set apiVersion=51.0 maxQueryLimit=100', { ensureExitCode: 0 }).shellOutput.stdout;
      expect(res2).to.include('Set Config');
      expect(res2).to.include('apiVersion');
      expect(res2).to.include('51.0');
      expect(res2).to.include('maxQueryLimit');
      expect(res2).to.include('100');

      execCmd('config unset apiVersion maxQueryLimit');
    });
  });

  describe('use set to unset a config key', () => {
    it('should unset config key when no value is provided', () => {
      execCmd<ConfigResponses>('config set apiVersion=50.0 --json', { cli: 'sf', ensureExitCode: 0 }).jsonOutput;
      verifyKeysAndValuesJson('apiVersion', '');
    });
  });
});

after(async () => {
  await testSession?.clean();
});
