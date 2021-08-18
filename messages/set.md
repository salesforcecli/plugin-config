# summary

Set one or more configuration variables, such as your default org.

# description

Use configuration variables to set CLI defaults, such as your default org or the API version you want the CLI to use. For example, if you set the "target-org" configuration variable, you don't need to specify it as a "sf deploy metadata" flag if you're deploying to your default org.

Local configuration variables apply only to your current project. Global variables, specified with the --global flag, apply in any directory.

The resolution order if you've set a flag value in multiple ways is as follows:

    1. Flag value specified at the command line.
    2. Local (project-level) configuration variable.
    3. Global configuration variable.

Run "sf config list" to see the configuration variables you've already set and their level (local or global).

# examples

- Set the local target-org configuration variable to an org username:

  <%= config.bin %> <%= command.id %> target-org=me@my.org

- Set the local target-org configuration variable to an alias:

  <%= config.bin %> <%= command.id %> target-org=my-scratch-org

- Set the global target-org configuration variable:

  <%= config.bin %> <%= command.id %> --global target-org=my-scratch-org

# flags.global.summary

Set the configuration variables globally, so they can be used from any directory.

# error.InvalidArgumentFormat

Setting variables must be in the format <key>=<value> or <key>=\"<value with spaces>\" but found %s.

# error.DuplicateArgument

Found duplicate argument %s

# error.ArgumentsRequired

Please provide config name(s) to set.
