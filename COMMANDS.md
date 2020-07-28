## Commands

A list of the available commands

- [`sfdx hello:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-helloorg--n-string--f--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx config:list [--json] [--loglevel]`](#sfdx-configlist)
- [`sfdx config:get [<string> ...] [--json] [--verbose] [--loglevel]`](#sfdx-configget)
- [`sfdx config:set [<string>=<string> ...] [--json] [-g] [--loglevel]`](#sfdx-configset)
- [`sfdx config:unset [<string> ...] [--json] [-g] [--loglevel]`](#sfdx-configunset)

## `sfdx hello:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

print a greeting and your org IDs

```
USAGE
  $ sfdx hello:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --force                                                                       example boolean flag
  -n, --name=name                                                                   name to print

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -v, --targetdevhubusername=targetdevhubusername                                   username or alias for the dev hub
                                                                                    org; overrides default dev hub org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx hello:org --targetusername myOrg@example.com --targetdevhubusername devhub@org.com
     Hello world! This is org: MyOrg and I will be around until Tue Mar 20 2018!
     My hub org id is: 00Dxx000000001234

  $ sfdx hello:org --name myname --targetusername myOrg@example.com
     Hello myname! This is org: MyOrg and I will be around until Tue Mar 20 2018!
```

## `sfdx config:list`

Lists the configuration variables for the Salesforce CLI

```
USAGE
$ sfdx config:list [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx config:list

  $ sfdx config:list --json
```

## `sfdx config:get`

Gets the Salesforce CLI configuration values for your default scratch org, your default Dev Hub org, and more.

```
USAGE
$ sfdx config:get [<string> ...] [--json] [--verbose] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  --verbose                                                                         also output locations to stdout
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx force:config:get defaultusername

  $ sfdx force:config:get defaultdevhubusername instanceUrl --json

  $ sfdx force:config:get apiVersion defaultdevhubusername --verbose
```

## `sfdx config:set`

Sets the local and global configuration variables for the Salesforce CLI.

```
USAGE
$ sfdx config:set [<string>=<string> ...] [--json] [-g] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -g                                                                                sets the variables globally
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx force:config:set defaultusername=me@my.org defaultdevhubusername=me@myhub.org

  $ sfdx force:config:set defaultdevhubusername=me@myhub.org -g
```

## `sfdx config:unset`

Unsets the configuration variables for the Salesforce CLI.

```
USAGE
$ sfdx config:unset [<string> ...] [--json] [-g] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -g                                                                                unsets the variables globally
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx force:config:unset defaultusername defaultdevhubusername

  $ sfdx force:config:set apiVersion -g
```
