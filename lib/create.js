const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { stopSpinner } = require('../utils/spinner');
const inquirer = require('inquirer');
const Creator = require('./Creator');
const validateProjectName = require('validate-npm-package-name');

async function create(projectName, options) {
  const cwd = options.cwd || process.cwd();
  const inCurrent = projectName === '.';
  const name = inCurrent ? path.relative('../', cwd) : projectName;
  const targetDir = path.resolve(cwd, projectName || '.');

  const result = validateProjectName(name);
  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${name}"`));
    result.errors &&
      result.errors.forEach(err => {
        console.error(chalk.red.dim('Error: ' + err));
      });
    result.warnings &&
      result.warnings.forEach(warn => {
        console.error(chalk.red.dim('Warning: ' + warn));
      });
    process.exit(1);
  }

  if (fs.existsSync(targetDir) && !options.merge) {
    if (options.force) {
      await fs.remove(targetDir);
    } else {
      // await clearConsole()
      if (inCurrent) {
        const { ok } = await inquirer.prompt([
          {
            name: 'ok',
            type: 'confirm',
            message: `Generate project in current directory?`
          }
        ]);
        if (!ok) {
          return;
        }
      } else {
        const { action } = await inquirer.prompt([
          {
            name: 'action',
            type: 'list',
            message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
            choices: [
              { name: 'Overwrite', value: 'overwrite' },
              { name: 'Merge', value: 'merge' },
              { name: 'Cancel', value: false }
            ]
          }
        ]);
        if (!action) {
          return;
        } else if (action === 'overwrite') {
          console.log(`\nRemoving ${chalk.cyan(targetDir)}...`);
          await fs.remove(targetDir);
        }
      }
    }
  }

  // const creator = new Creator(name, targetDir, getPromptModules());
  const creator = new Creator(name, targetDir, null);
  await creator.create(options);
}

module.exports = (...args) => {
  return create(...args).catch(err => {
    stopSpinner(false); // do not persist
    console.error(err);
    // if (!process.env.VUE_CLI_TEST) {
    //   process.exit(1);
    // }
  });
};
