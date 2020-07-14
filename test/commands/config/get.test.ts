// /*
//  * Copyright (c) 2018, salesforce.com, inc.
//  * All rights reserved.
//  * SPDX-License-Identifier: BSD-3-Clause
//  * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
//  */

// // Node
// import * as util from 'util';

// // Thirdparty
// const { expect, assert } = require('chai');
// import * as _ from 'lodash';

// // Local
// import * as TestWorkspace from 'salesforce-alm';
// import ConfigGetCommand = require('../../../lib/commands/config/get');
// import ConfigSetCommand = require('../../../lib/commands/config/set');
// import { Org, Config, srcDevUtil } from '@salesforce/core';

// const urlGenerator = (function* urlGenerator() {
//   // notice this is a function generator
//   let index = 0;
//   for (; ;) {
//     yield `https://www${(index += 1)}.salesforce.com`;
//   }
// })();

// const apiVersionGenerator = (function* () {
//   // notice this is a function generator
//   for (; ;) {
//     let random = Math.floor(Math.random() * 90);
//     random = Math.floor(random) + 10;
//     yield `${random}.0`;
//   }
// })();

// const booleanGenerator = (function* () {
//   // notice this is a function generator
//   for (; ;) {
//     const random = Math.floor(Math.random() * 2);
//     yield random === 0 ? 'false' : 'true';
//   }
// })();

// const stringGenerator = (function* () {
//   // notice this is a function generator
//   for (; ;) {
//     yield 'test';
//   }
// })();

// // map a list of properties into name then filter the list to non-org defaults.
// const PROPS = Config.getAllowedProperties()
//   .map(property => {
//     const returnObj = Object.assign({}, property);
//     switch (property.key) {
//       case 'instanceUrl':
//         _.set(returnObj, 'valueGenerator', urlGenerator);
//         break;
//       case 'apiVersion':
//         _.set(returnObj, 'valueGenerator', apiVersionGenerator);
//         break;
//       case 'restDeploy':
//         _.set(returnObj, 'valueGenerator', booleanGenerator);
//         break;
//       case 'disableTelemetry':
//         _.set(returnObj, 'valueGenerator', booleanGenerator);
//         break;
//       default:
//         _.set(returnObj, 'valueGenerator', stringGenerator);
//     }
//     return returnObj;
//   })
//   .filter(
//     property => property.key !== Config.OrgDefaults.DEVHUB && property.key !== Config.OrgDefaults.USERNAME
//   );

// describe('ConfigGetCommand', () => {
//   let workspace;

//   const get = (key, json?) => {
//     const command = new ConfigGetCommand();
//     const args: any = {
//       args: util.isArray(key) ? key : [`${key}`]
//     };
//     if (json) {
//       args.json = true;
//     }
//     return command.validate(args).then(flags => command.execute(flags));
//   };

//   before(() => {
//     workspace = new TestWorkspace();
//   });

//   after(() => {
//     workspace.clean();
//   });

//   beforeEach(() => Config.clear());

//   describe('property tests', () => {
//     const set = (key, value, isGlobal = true) => {
//       const command = new ConfigSetCommand();
//       return command
//         .validate({
//           flags: { global: isGlobal },
//           args: [`${key}=${value}`],
//           varargs: { [key]: value }
//         })
//         .then(flags => command.execute(flags));
//     };

//     PROPS.forEach(PROP => {
//       describe(`${PROP.key}`, () => {
//         describe('execute - global config', () => {
//           it('get config value', () => {
//             const value = PROP['valueGenerator'].next().value;
//             return set(PROP.key, value)
//               .then(() => {
//                 if (PROP.encrypted) {
//                   return srcDevUtil.readJSON(new Config(true).path).then(configJson => {
//                     // Value is encrypted, so they don't match
//                     expect(configJson)
//                       .to.have.property(PROP.key)
//                       .and.not.equal(value);
//                   });
//                 }
//                 return null;
//               })
//               .then(() => get(PROP.key))
//               .then(result => {
//                 assert.isTrue(result && result.length && result.length === 1);
//                 expect(result[0])
//                   .to.have.property('key')
//                   .and.equal(PROP.key);
//                 expect(result[0])
//                   .to.have.property('value')
//                   .and.equal(value);
//               });
//           });
//           it('get config values', () => {
//             const HUB_USER = 'hub@test.com';
//             const WORKSPACE_USER = 'workspace@test.com';

//             const value = PROP['valueGenerator'].next().value;
//             return workspace
//               .configureScratchOrg(null, HUB_USER)
//               .then(() => workspace.configureScratchOrg(null, WORKSPACE_USER))
//               .then(() => set(PROP.key, value))
//               .then(() => set(Org.Defaults.DEVHUB, HUB_USER))
//               .then(() => get([PROP.key, Org.Defaults.DEVHUB]))
//               .then(result => {
//                 assert.isTrue(result && result.length && result.length === 2);
//                 expect(result[0])
//                   .to.have.property('key')
//                   .and.equal(PROP.key);
//                 expect(result[0])
//                   .to.have.property('value')
//                   .and.equal(value);
//                 expect(result[0])
//                   .to.have.property('location')
//                   .and.equal('Global');
//                 expect(result[1])
//                   .to.have.property('key')
//                   .and.equal(Org.Defaults.DEVHUB);
//                 expect(result[1])
//                   .to.have.property('value')
//                   .and.equal(HUB_USER);
//                 expect(result[1])
//                   .to.have.property('location')
//                   .and.equal('Global');
//               });
//           });
//           it('get config value w/ name not set', () => {
//             return get(PROP.key).then(result => {
//               assert.isTrue(result && result.length && result.length === 1);
//               expect(result[0])
//                 .to.have.property('key')
//                 .and.equal(PROP.key);
//               expect(result[0])
//                 .to.have.property('value')
//                 .and.equal(undefined);
//               expect(result[0])
//                 .to.have.property('location')
//                 .and.equal(undefined);
//               expect(result[0])
//                 .to.have.property('path')
//                 .and.equal(undefined);
//             });
//           });
//         });

//         describe('execute - local config', () => {
//           it('get config values', () => {
//             const HUB_USER = 'hub@test.com';
//             const WORKSPACE_USER = 'workspace@test.com';

//             const value = PROP['valueGenerator'].next().value;
//             return workspace
//               .configureScratchOrg(null, HUB_USER)
//               .then(() => workspace.configureScratchOrg(null, WORKSPACE_USER))
//               .then(() => set(PROP.key, value, false))
//               .then(() => set(Org.Defaults.DEVHUB, HUB_USER, false))
//               .then(() => get([PROP.key, Org.Defaults.DEVHUB]))
//               .then(result => {
//                 assert.isTrue(result && result.length && result.length === 2);
//                 expect(result[0])
//                   .to.have.property('key')
//                   .and.equal(PROP.key);
//                 expect(result[0])
//                   .to.have.property('value')
//                   .and.equal(value);
//                 expect(result[0])
//                   .to.have.property('location')
//                   .and.equal('Local');
//                 expect(result[1])
//                   .to.have.property('key')
//                   .and.equal(Org.Defaults.DEVHUB);
//                 expect(result[1])
//                   .to.have.property('value')
//                   .and.equal(HUB_USER);
//                 expect(result[1])
//                   .to.have.property('location')
//                   .and.equal('Local');
//               });
//           });
//         });
//       });
//     });
//   });

//   describe('validate', () => {
//     it('no args', async () => {
//       const command = new ConfigGetCommand();
//       try {
//         await command.validate({
//           args: []
//         });
//         assert.fail('Expected NoConfigKeysFound error');
//       } catch (e) {
//         expect(e.name).to.equal('NoConfigKeysFound');
//       }
//     });

//     it('unknown key', async () => {
//       const testArgs = ['foo=bar'];
//       const command = new ConfigGetCommand();
//       try {
//         await command.execute({ flags: {}, args: testArgs });
//         assert.fail('Expected UnknownConfigKey error');
//       } catch (e) {
//         expect(e).to.have.property('name', 'UnknownConfigKey');
//         expect(e).to.have.property('message', `Unknown config key: ${testArgs[0]}`);
//       }
//     });
//   });
// });
