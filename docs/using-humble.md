# Using Humble

Humble's approach to environment variable registration is rather simple.

## Setting an Environment Variable

To set an environment variable (or create one), follow these steps.

- Define a name and value for your environment variable.
- Run the "set environment variable" block.
- You're done!

## Using Environment Variables

You can resolve environment variables by wrapping a string (example: `$HOME/path/to/file.ext`) in the "resolve variables" reporter block.

If an environment variable referenced by a placeholder is missing or is set to nothing, that placeholder in the text will be replaced by an empty string ('').
