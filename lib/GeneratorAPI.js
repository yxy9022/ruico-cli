const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const ejs = require('ejs');
const { isBinaryFileSync } = require('isbinaryfile');

class GeneratorAPI {
  constructor() {}

  async render(source, additionalData = {}, ejsOptions = {}) {
    const files = [];
    // https://www.npmjs.com/package/globby
    const globby = require('globby');
    const _files = await globby(['**/*'], {
      cwd: source,
      dot: true,
      ignore: ['**/node_modules/**', '**/.git/**', '**/.svn/**', '**/.DS_Store', 'LICENSE']
    });
    // console.log('_files:', _files);
    for (const rawPath of _files) {
      const targetPath = rawPath
        .split('/')
        .map(filename => {
          // dotfiles are ignored when published to npm, therefore in templates
          // we need to use underscore instead (e.g. "_gitignore")
          if (filename.charAt(0) === '_' && filename.charAt(1) !== '_') {
            return `.${filename.slice(1)}`;
          }
          if (filename.charAt(0) === '_' && filename.charAt(1) === '_') {
            return `${filename.slice(1)}`;
          }
          return filename;
        })
        .join('/');
      const sourcePath = path.resolve(source, rawPath);
      // console.log(sourcePath);
      const content = this.renderFile(sourcePath, additionalData, ejsOptions);
      // only set file if it's not all whitespace, or is a Buffer (binary files)
      if (Buffer.isBuffer(content) || /[^\s]/.test(content)) {
        files[targetPath] = content;
      }
    }
    return files;
  }

  renderFile(name, data, ejsOptions) {
    if (isBinaryFileSync(name)) {
      return fs.readFileSync(name); // return buffer
    }
    const template = fs.readFileSync(name, 'utf-8');
    const yaml = require('yaml-front-matter');
    const parsed = yaml.loadFront(template);
    const content = parsed.__content;
    let finalTemplate = content.trim() + `\n`;
    return ejs.render(finalTemplate, data, ejsOptions);
  }
}

module.exports = GeneratorAPI;
