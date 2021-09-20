# summary

Get the value of a configuration variable.

# description

Run "sf config list" to see all the configuration variables you've set. Global configuration variable are always displayed; local ones are displayed if you run the command in a project directory. Run "sf config set" to set a configuration variable.

# examples

- Get the value of the "target-org" configuration variable.

  <%= config.bin %> <%= command.id %> target-org

- Get multiple configuration variables and display whether they're set locally or globally:

  <%= config.bin %> <%= command.id %> target-org api-version --verbose

# flags.verbose.summary

Display whether the configuration variables are set locally or globally.

# error.NoConfigKeysFound

You must provide one or more configuration variables to get. Run 'sf config list' to see the configuration variables you've previously set. 
