const fs = require('fs-extra');
const path = require('path');

function deleteRemovedFiles(directory, newFiles, previousFiles) {
  // get all files that are not in the new filesystem and are still existing
  const filesToDelete = Object.keys(previousFiles).filter(filename => !newFiles[filename]);

  // delete each of these files
  return Promise.all(
    filesToDelete.map(filename => {
      return fs.unlink(path.join(directory, filename));
    })
  );
}

/**
 *
 * @param {string} dir
 * @param {Record<string,string|Buffer>} files
 * @param {Record<string,string|Buffer>} [previousFiles]
 * @param {Set<string>} [include]
 */
module.exports = async function writeFileTree(dir, files, previousFiles) {
  if (previousFiles) {
    await deleteRemovedFiles(dir, files, previousFiles);
  }
  const projectName = path.basename(dir);
  Object.keys(files).forEach(name => {
    const filePath = path.join(dir, name);
    const targetPath = path.join(dir, name.replace(/(ruico-template)/, projectName));
    // console.log(targetPath);
    fs.ensureDirSync(path.dirname(targetPath));
    fs.writeFileSync(targetPath, files[name]);
  });
};
