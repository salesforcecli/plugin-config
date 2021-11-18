# plugin-config

[![NPM](https://img.shields.io/npm/v/@salesforce/plugin-config.svg?label=@salesforce/plugin-config)](https://www.npmjs.com/package/@salesforce/plugin-config) [![CircleCI](https://circleci.com/gh/salesforcecli/plugin-config/tree/main.svg?style=shield)](https://circleci.com/gh/salesforcecli/plugin-config/tree/main) [![Downloads/week](https://img.shields.io/npm/dw/@salesforce/plugin-config.svg)](https://npmjs.org/package/@salesforce/plugin-config) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/plugin-config/main/LICENSE.txt)

Config commands for Salesforce CLI

This plugin is bundled with the [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli). For more information on the CLI, read the [getting started guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm).

We always recommend using the latest version of these commands bundled with the CLI, however, you can install a specific version or tag if needed.

## Install

```bash
sfdx plugins:install config@x.y.z
```

## Issues

Please report any issues at https://github.com/forcedotcom/cli/issues

## Contributing

1. Please read our [Code of Conduct](CODE_OF_CONDUCT.md)
2. Create a new issue before starting your project so that we can keep track of
   what you are trying to add/fix. That way, we can also offer suggestions or
   let you know if there is already an effort in progress.
3. Fork this repository.
4. [Build the plugin locally](#build)
5. Create a _topic_ branch in your fork. Note, this step is recommended but technically not required if contributing using a fork.
6. Edit the code in your fork.
7. Write appropriate tests for your changes. Try to achieve at least 95% code coverage on any new code. No pull request will be accepted without unit tests.
8. Sign CLA (see [CLA](#cla) below).
9. Send us a pull request when you are done. We'll review your code, suggest any needed changes, and merge it in.

### CLA

External contributors will be required to sign a Contributor's License
Agreement. You can do so by going to https://cla.salesforce.com/sign-cla.

### Build

To build the plugin locally, make sure to have yarn installed and run the following commands:

```bash
# Clone the repository
git clone git@github.com:salesforcecli/plugin-config

# Install the dependencies and compile
yarn install
yarn build
```

To use your plugin, run using the local `./bin/run` or `./bin/run.cmd` file.

```bash
# Run using local run file.
./bin/run config
```

There should be no differences when running via the Salesforce CLI or using the local run file. However, it can be useful to link the plugin to do some additional testing or run your commands from anywhere on your machine.

```bash
# Link your plugin to the sfdx cli
sfdx plugins:link .
# To verify
sfdx plugins
```

# Commands

<!-- commands -->

- [plugin-config](#plugin-config)
  - [Install](#install)
  - [Issues](#issues)
  - [Contributing](#contributing)
    - [CLA](#cla)
    - [Build](#build)
- [Commands](#commands)
  - [`sf config get`](#sf-config-get)
  - [`sf config list`](#sf-config-list)
  - [`sf config set`](#sf-config-set)
  - [`sf config unset`](#sf-config-unset)

## `sf config get`

Get the value of a configuration variable.

```
USAGE
  $ sf config get [--json] [--verbose]

FLAGS
  --verbose  Display whether the configuration variables are set locally or globally.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Get the value of a configuration variable.

  Run "sf config list" to see all the configuration variables you've set. Global configuration variable are always
  displayed; local ones are displayed if you run the command in a project directory. Run "sf config set" to set a
  configuration variable.

EXAMPLES
  Get the value of the "target-org" configuration variable.

    $ sf config get target-org

  Get multiple configuration variables and display whether they're set locally or globally:

    $ sf config get target-org api-version --verbose
```

## `sf config list`

List the configuration variables that you've previously set.

```
USAGE
  $ sf config list [--json]

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List the configuration variables that you've previously set.

  Global configuration variables apply to any directory and are always displayed. If you run this command from a project
  directory, local configuration variables are also displayed.

EXAMPLES
  List both global configuration variables and those local to your project:

    $ sf config list
```

## `sf config set`

Set one or more configuration variables, such as your default org.

```
USAGE
  $ sf config set [--json] [-g]

FLAGS
  -g, --global  Set the configuration variables globally, so they can be used from any directory.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Set one or more configuration variables, such as your default org.

  Use configuration variables to set CLI defaults, such as your default org or the API version you want the CLI to use.
  For example, if you set the "target-org" configuration variable, you don't need to specify it as a "sf deploy
  metadata" flag if you're deploying to your default org.

  Local configuration variables apply only to your current project. Global variables, specified with the --global flag,
  apply in any directory.

  The resolution order if you've set a flag value in multiple ways is as follows:

  1. Flag value specified at the command line.

  2. Local (project-level) configuration variable.

  3. Global configuration variable.

  Run "sf config list" to see the configuration variables you've already set and their level (local or global).

EXAMPLES
  Set the local target-org configuration variable to an org username:

    $ sf config set target-org=me@my.org

  Set the local target-org configuration variable to an alias:

    $ sf config set target-org=my-scratch-org

  Set the global target-org configuration variable:

    $ sf config set --global target-org=my-scratch-org
```

## `sf config unset`

Unset local or global configuration variables.

```
USAGE
  $ sf config unset [--json] [-g]

FLAGS
  -g, --global  Unset the configuration variables globally, so they can no longer be used from any directory.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Unset local or global configuration variables.

  Local configuration variables apply only to your current project. Global configuration variables apply in any
  directory.

EXAMPLES
  Unset the local "target-org" configuration variable:

    $ sf config unset target-org

  Unset multiple configuration variables globally:

    $ sf config unset target-org api-version --global
```

<!-- commandsstop -->
