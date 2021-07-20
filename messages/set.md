# summary
  
Set one or more configuration variables, such as your default environment. 

# description

Use configuration variables to set CLI defaults, such as your default environment or the API version you want the CLI to use. For example, if you set the "target-org" configuration variable, you don't need to specify it as a "sf deploy metadata" flag if you're deploying to your default org.

Local configuration variables apply only to your current project. Global variables, specified with the --global flag, apply in any directory.

The resolution order if you've set a flag value in multiple ways is as follows:

	1. Flag value specified at the command line.
	2. Local (project-level) configuration variable.
	3. Global configuration variable.

Run "sf <command> --help" to get a list of configuration variables used by that command. Run "sf config list" to see the configuration variables you've already set and their level (local or global).

If you set a configuration variable and then run a command that uses it, the command output displays this information at runtime.

# examples

- Set the local target-org configuration variable to an org username:

  <%= config.bin %> <%= command.id %> target-org=me@my.org

- Set the local target-org configuration variable to an alias:

  <%= config.bin %> <%= command.id %> target-org=my-scratch-org

- Set the global target-org configuration variable:

  <%= config.bin %> <%= command.id %> --global target-org=my-scratch-org

# flags.global.summary

Set the configuration variables globally, so they can be used from any directory.
