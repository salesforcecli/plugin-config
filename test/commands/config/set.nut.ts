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
    describe('org-api-version', () => {
      it('will set org-api-version correctly', () => {
        verifyKeysAndValuesJson('org-api-version', '50.0');
        verifyKeysAndValuesStdout('org-api-version', '50.0', ['org-api-version', '50.0']);
      });

      it('will fail to validate org-api-version', () => {
        verifyValidationError(
          'org-api-version',
          '50',
          'Invalid config value: Specify a valid Salesforce API version, for example, 42.0.'
        );
      });
    });

    describe('org-max-query-limit', () => {
      it('will set org-max-query-limit correctly', () => {
        verifyKeysAndValuesJson('org-max-query-limit', '50');
        verifyKeysAndValuesStdout('org-max-query-limit', '50', ['org-max-query-limit', '50']);
      });

      it('will fail to validate org-max-query-limit', () => {
        verifyValidationError(
          'org-max-query-limit',
          '-2',
          'Invalid config value: Specify a valid positive integer, for example, 150000.'
        );
      });
    });

    describe('org-instance-url', () => {
      it('will set org-instance-url correctly', () => {
        verifyKeysAndValuesJson('org-instance-url', 'https://test.my.salesforce.com');
        verifyKeysAndValuesStdout('org-instance-url', 'https://test.my.salesforce.com', [
          'org-instance-url',
          'https://test.my.salesforce.com',
        ]);
      });

      it('will fail to validate org-instance-url when non-Salesforce URL', () => {
        verifyValidationError(
          'org-instance-url',
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

    describe('org-isv-debugger-sid', () => {
      it('will set org-isv-debugger-sid correctly', () => {
        verifyKeysAndValuesJson('org-isv-debugger-sid', '12');
      });
    });

    describe('org-isv-debugger-url', () => {
      it('will set org-isv-debugger-url correctly', () => {
        verifyKeysAndValuesJson('org-isv-debugger-url', '12');
      });
    });

    describe('disable-telemetry', () => {
      it('will set disable-telemetry correctly', () => {
        verifyKeysAndValuesJson('disable-telemetry', 'true');
        verifyKeysAndValuesJson('disable-telemetry', false);
        verifyKeysAndValuesStdout('disable-telemetry', 'true', ['disable-telemetry', 'true']);
        verifyKeysAndValuesStdout('disable-telemetry', false, ['disable-telemetry', 'false']);
      });

      it('will fail to validate disable-telemetry', () => {
        verifyValidationError(
          'disable-telemetry',
          'ab',
          'Invalid config value: The config value can only be set to true or false.'
        );
      });
    });

    describe('disable-telemetry', () => {
      it('will set disable-telemetry correctly', () => {
        verifyKeysAndValuesJson('disable-telemetry', 'true');
        verifyKeysAndValuesJson('disable-telemetry', false);
        verifyKeysAndValuesStdout('disable-telemetry', 'true', ['disable-telemetry', 'true']);
        verifyKeysAndValuesStdout('disable-telemetry', false, ['disable-telemetry', 'false']);
      });

      it('will fail to validate disable-telemetry', () => {
        verifyValidationError(
          'disable-telemetry',
          'ab',
          'Invalid config value: The config value can only be set to true or false.'
        );
      });
    });
  });

  describe('set two keys and values properly', () => {
    it('will set both org-api-version and org-max-query-limit in one command', () => {
      const { result } = execCmd('config set org-api-version=51.0 org-max-query-limit=100 --json').jsonOutput;
      expect(result).to.deep.equal([
        {
          name: 'org-api-version',
          value: '51.0',
          success: true,
        },
        {
          name: 'org-max-query-limit',
          value: '100',
          success: true,
        },
      ]);
      execCmd('config unset org-api-version org-max-query-limit');

      const res2 = execCmd('config set org-api-version=51.0 org-max-query-limit=100', { ensureExitCode: 0 }).shellOutput
        .stdout;
      expect(res2).to.include('Set Config');
      expect(res2).to.include('org-api-version');
      expect(res2).to.include('51.0');
      expect(res2).to.include('org-max-query-limit');
      expect(res2).to.include('100');

      execCmd('config unset org-api-version org-max-query-limit');
    });
  });

  describe('use set to unset a config key', () => {
    it('should unset config key when no value is provided', () => {
      execCmd<ConfigResponses>('config set org-api-version=50.0 --json', { cli: 'sf', ensureExitCode: 0 }).jsonOutput;
      verifyKeysAndValuesJson('org-api-version', '');
    });
  });
});

after(async () => {
  await testSession?.clean();
});
