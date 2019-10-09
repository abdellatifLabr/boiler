const progress = require('cli-progress');

const progressBar = new progress.Bar({
    format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}'
}, progress.Presets.legacy);

module.exports = progressBar;