const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const debug = require('debug');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { logWithSpinner, stopSpinner } = require('../utils/spinner');
const { log } = require('../utils/logger');
const EventEmitter = require('events');
const writeFileTree = require('../utils/writeFileTree');
const download = require('download-git-repo');
const GeneratorsAPI = require('./GeneratorAPI');
const defaultPresetsOptions = require('./presetOptions');
const promptChoices = Object.keys(defaultPresetsOptions);

module.exports = class Creator extends EventEmitter {
  constructor(name, context, promptModules) {
    super();
    this.name = name;
    this.context = context; //targetDir

    this.injectedPrompts = [];
    this.promptCompleteCbs = [];

    this.run = this.run.bind(this);
  }

  async create(cliOptions = {}, preset = null) {
    const { run, name, context, afterInvokeCbs, afterAnyInvokeCbs } = this;

    // TODO PackageManager
    log(`✨  Creating project in ${chalk.yellow(context)}.`);
    this.emit('creation', { event: 'creating' });

    // 获得预设
    preset = await this.promptAndResolvePreset();
    // console.log('preset:', preset);

    // 下载模板
    log();
    logWithSpinner('Download the template. This might take a while...');
    const tmpdir = path.join(os.tmpdir(), 'ruico-cli-template');
    fs.emptyDirSync(tmpdir);
    const repository = preset.repository;
    await new Promise((resolve, reject) => {
      download(repository, tmpdir, { clone: true }, err => {
        if (err) return reject(err);
        resolve();
      });
    });
    stopSpinner(true);

    // 下载完成后处理模板生成项目
    log();
    log(`🚀  Invoking generators...`);
    const generatorsAPI = new GeneratorsAPI();
    const files = await generatorsAPI.render(tmpdir, { projectName: name });
    // save the file system before applying plugin for comparison
    const initialFiles = Object.assign({}, files);
    await writeFileTree(context, files, initialFiles);

    // 生成完成
    log();
    log(`🎉  Successfully created project ${chalk.yellow(name)}.`);
    log(`👉  Get started with the following commands:`);
    log();
    if (this.context !== process.cwd()) {
      log(chalk.cyan(` ${chalk.gray('$')} cd ${name}`));
    }
    if (preset.endCommand.length) {
      for (const cmd of preset.endCommand) {
        log(chalk.cyan(` ${chalk.gray('$')} ${cmd}`));
      }
    }
    log();
  }

  run(command, args) {
    if (!args) {
      [command, ...args] = command.split(/\s+/);
    }
    return execa(command, args, { cwd: this.context });
  }

  async promptAndResolvePreset(answers = null) {
    const presetPrompt = {
      name: 'preset',
      type: 'list',
      message: `Please pick a preset:`,
      choices: promptChoices
    };
    // prompt
    if (!answers) {
      // await clearConsole(true);
      answers = await inquirer.prompt([presetPrompt]);
    }
    return defaultPresetsOptions[answers.preset];
  }
};
