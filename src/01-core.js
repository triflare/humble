class TfHumble {
  constructor() {
    // Dictionary to store our environment variables internally
    this.envVars = {};
  }

  // We <3 constructor before getInfo!

  getInfo() {
    return {
      id: 'tfHumble',
      name: Scratch.translate('Humble'),
      color1: '#8B4513',
      color2: '#6B340D',
      menuIconURI: mint.assets.get('icons/menu.svg'),
      blocks: [
        {
          opcode: 'setEnv',
          blockType: Scratch.BlockType.COMMAND,
          text: Scratch.translate('set environment variable named [NAME] to [VALUE]'),
          arguments: {
            NAME: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'HOME',
            },
            VALUE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '/home/user',
            },
          },
        },
        {
          opcode: 'removeEnv',
          blockType: Scratch.BlockType.COMMAND,
          text: Scratch.translate('remove environment variable named [NAME]'),
          arguments: {
            NAME: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'HOME',
            },
          },
        },
        {
          opcode: 'getEnv',
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate('get environment variable named [NAME]'),
          arguments: {
            NAME: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'HOME',
            },
          },
        },
        {
          opcode: 'allEnv',
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate('all environment variables'),
        },
        {
          opcode: 'importEnv',
          blockType: Scratch.BlockType.COMMAND,
          text: Scratch.translate('import environment variables from: [ENV]'),
          arguments: {
            ENV: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '{"HOME":"/home/user"}',
            },
          },
        },
        '---',
        {
          opcode: 'resolveString',
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate('resolve variables in [TEXT]'),
          arguments: {
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '$HOME/path/to/file.ext',
            },
          },
        },
      ],
    };
  }

  // Registers a new variable or modifies an existing one
  setEnv(args) {
    const name = Scratch.Cast.toString(args.NAME);
    const value = Scratch.Cast.toString(args.VALUE);
    if (name) {
      this.envVars[name] = value;
    }
  }

  // Deletes the specified variable
  removeEnv(args) {
    const name = Scratch.Cast.toString(args.NAME);
    delete this.envVars[name];
  }

  // Helper block to just grab the raw value of a single variable
  getEnv(args) {
    const name = Scratch.Cast.toString(args.NAME);
    if (Object.prototype.hasOwnProperty.call(this.envVars, name)) {
      return this.envVars[name];
    }
    return '';
  }

  allEnv() {
    return JSON.stringify(this.envVars);
  }

  importEnv(args) {
    const env = Scratch.Cast.toString(args.ENV);
    let parsed;
    try {
      parsed = JSON.parse(env);
    } catch {
      return;
    }

    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
      return;
    }

    const importedEnv = {};
    for (const [key, value] of Object.entries(parsed)) {
      const name = Scratch.Cast.toString(key);
      if (!name) {
        continue;
      }
      importedEnv[name] = Scratch.Cast.toString(value);
    }
    this.envVars = importedEnv;
  }

  // Resolves any $VAR or ${VAR} occurrences inside a string
  resolveString(args) {
    const text = Scratch.Cast.toString(args.TEXT);

    // Regex to match $VAR_NAME and ${VAR_NAME}
    // Variables must start with a letter or underscore, followed by alphanumeric characters and underscores
    return text.replace(
      /\$([A-Za-z_][A-Za-z0-9_]*)|\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g,
      (match, p1, p2) => {
        const varName = p1 || p2; // p1 is from $VAR, p2 is from ${VAR}

        if (Object.prototype.hasOwnProperty.call(this.envVars, varName)) {
          return this.envVars[varName];
        }

        // If the variable doesn't exist, we leave it as an empty string
        // (which matches standard Bash behavior)
        return '';
      }
    );
  }
}

// Literally so simple!

Scratch.extensions.register(new TfHumble());
