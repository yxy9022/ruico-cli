async function create(projectName, options) {
  console.log('----------create-------');
}

module.exports = (...args) => {
  return create(...args).catch(err => {
    // stopSpinner(false); // do not persist
    console.error(err);
    // if (!process.env.VUE_CLI_TEST) {
    //   process.exit(1);
    // }
  });
};
