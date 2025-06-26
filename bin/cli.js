#!/usr/bin/env node

// Check node version before requiring/doing anything else
// The user may be on a very old node version
const chalk = require('chalk');
const semver = require('semver');
const requiredVersion = require('../package.json').engines.node;
const leven = require('leven');

function checkNodeVersion(wanted, id) {
  if (!semver.satisfies(process.version, wanted, { includePrerelease: true })) {
    /* prettier-ignore */
    console.log(chalk.red(
      'You are using Node ' + process.version + ', but this version of ' + id +
      ' requires Node ' + wanted + '.\nPlease upgrade your Node version.'
    ))
    process.exit(1);
  }
}

const minimist = require('minimist');

checkNodeVersion(requiredVersion, 'ruico-cli');

const program = require('commander');

// 允许用户通过 --version 或 -V 选项查看版本信息。
program.name('ruico').version(`ruico-cli ${require('../package').version}`);

// 定义命令行工具的基础使用格式，并在用户请求帮助信息（如执行 --help 或 -h）时显示。
program.usage('<command> [options]');

program
  .command('create <app-name>')
  .description('create a new project powered by ruico-cli')
  .option('-t, --type <projectType>', 'Use specified type when creating project')
  // .option('-p, --preset <presetName>', 'Skip prompts and use saved or remote preset')
  // .option('-d, --default', 'Skip prompts and use default preset')
  // .option('-i, --inlinePreset <json>', 'Skip prompts and use inline JSON string as preset')
  // .option('-m, --packageManager <command>', 'Use specified npm client when installing dependencies')
  // .option('-r, --registry <url>', 'Use specified npm registry when installing dependencies (only for npm)')
  // .option('-g, --git [message]', 'Force git initialization with initial commit message')
  // .option('-n, --no-git', 'Skip git initialization')
  .option('-f, --force', 'Overwrite target directory if it exists')
  .option('--merge', 'Merge target directory if it exists')
  // .option('-c, --clone', 'Use git clone when fetching remote preset')
  // .option('-x, --proxy <proxyUrl>', 'Use specified proxy when creating project')
  // .option('-b, --bare', 'Scaffold project without beginner instructions')
  // .option('--skipGetStarted', 'Skip displaying "Get started" instructions')
  .action((name, options) => {
    if (minimist(process.argv.slice(3))._.length > 1) {
      /* prettier-ignore */
      console.log(chalk.yellow('\n Info: You provided more than one argument. The first one will be used as the app\'s name, the rest are ignored.'))
    }
    // --git makes commander to default git to true
    if (process.argv.includes('-g') || process.argv.includes('--git')) {
      options.forceGit = true;
    }
    require('../lib/create')(name, options);
  });

// output help information on unknown commands
program.on('command:*', ([cmd]) => {
  program.outputHelp();
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
  console.log();
  suggestCommands(cmd);
  process.exitCode = 1;
});

// add some useful info on help
program.on('--help', () => {
  console.log();
  console.log(`  Run ${chalk.cyan(`ruico <command> --help`)} for detailed usage of given command.`);
  console.log();
});

program.commands.forEach(c => c.on('--help', () => console.log()));

program.parse(process.argv);

function suggestCommands(unknownCommand) {
  const availableCommands = program.commands.map(cmd => cmd._name);

  let suggestion;

  availableCommands.forEach(cmd => {
    const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand);
    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd;
    }
  });

  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`));
  }
}
