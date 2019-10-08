const program = require('commander');

function commaSeparatedList(value, dummyPrevious) {
    return value.split(',');
}

program
    .option('-d, --directory <directory>', 'Project creation directory')
    .option('-e, --entries <entries>', 'Project entry files names', commaSeparatedList)
    .option('--js', 'Set scripting language to Javascript')
    .option('--ts', 'Set scripting language to Typescript')
    .option('--html', 'Set templating language to HTML')
    .option('--pug', 'Set templating language to PUG (HTML preprocessor)')
    .option('--css', 'Set styling language to CSS')
    .option('--scss', 'Set styling language to SCSS/SASS')
    .option('--purge-css', 'Enable purge-css plugin (get rid of unused css styles)')
    .option('--dev-server', 'Enable development live server')
    .option('--git', 'Initialize a git repository with a custom .gitignore file')
    .parse(process.argv);

module.exports = program;