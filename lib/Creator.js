const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { chalk, log } = require('../utils');
const EventEmitter = require('events');
const writeFileTree = require('../utils/writeFileTree');
const download = require('download-git-repo');
const GeneratorsAPI = require('./GeneratorAPI');

module.exports = class Creator extends EventEmitter {
  constructor(name, context, promptModules) {
    super();
    this.name = name;
    this.context = context; //targetDir

    this.run = this.run.bind(this);
  }

  async create(cliOptions = {}, preset = null) {
    const { run, name, context, afterInvokeCbs, afterAnyInvokeCbs } = this;

    // TODO PackageManager
    log(`✨  Creating project in ${chalk.yellow(context)}.`);
    this.emit('creation', { event: 'creating' });

    // 下载模板
    log(`🗃  Initializing git repository...`);
    const tmpdir = path.join(os.tmpdir(), 'ruico-cli-template');
    fs.emptyDirSync(tmpdir);
    const repository = 'github:yxy9022/ruico-template#sf-01';
    await new Promise((resolve, reject) => {
      download(repository, tmpdir, { clone: true }, err => {
        if (err) return reject(err);
        resolve();
      });
    });

    // 下载完成后处理模板生成项目
    log(`🚀  Invoking generators...`);
    const bedir = path.join(tmpdir, 'packages/ruico-template-be/');
    if (fs.existsSync(bedir)) {
      fs.moveSync(bedir, path.join(tmpdir, `packages/${name}-be/`));
    }
    const fedir = path.join(tmpdir, 'packages/ruico-template-fe/');
    if (fs.existsSync(fedir)) {
      fs.moveSync(fedir, path.join(tmpdir, `packages/${name}-fe/`));
    }
    const generatorsAPI = new GeneratorsAPI();
    const files = await generatorsAPI.render(tmpdir, { projectName: name });
    // save the file system before applying plugin for comparison
    const initialFiles = Object.assign({}, files);
    // write/update file tree to disk
    const filesModifyRecord = new Set();
    await writeFileTree(context, files, initialFiles, filesModifyRecord);

    // 生成完成
  }

  run(command, args) {
    if (!args) {
      [command, ...args] = command.split(/\s+/);
    }
    return execa(command, args, { cwd: this.context });
  }
};
