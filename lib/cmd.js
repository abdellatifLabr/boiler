const util = require('util');
const cmd = util.promisify(require('child_process').exec);

module.exports = cmd;