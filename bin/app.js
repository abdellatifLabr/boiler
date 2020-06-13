#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const clc = require('cli-color');
const request = require('sync-request');
const cli = require('../lib/cli');
const cmd = require('../lib/cmd');
const { render, createDirIfNotExists } = require('../lib/utils');

/* Arguments parsing */
const projectDir = cli.directory;
const entries = cli.entries || ['main'];
const scripting = (cli.js) ? 'js' : 'ts';
const templating = (cli.html) ? 'html' : 'pug';
const styling = (cli.css) ? 'css' : 'scss';
const purgeCss = cli.purgeCss;
const git = cli.git;
const context = { projectDir, entries, scripting, styling, templating, purgeCss };

/* Creating project structure */
if (projectDir != '.') {
    fs.mkdirSync(projectDir);
}
fs.mkdirSync(path.join(projectDir, 'src'));
fs.mkdirSync(path.join(projectDir, 'src', 'assets'));

/* Write webpack.config.js file */
const wpConfigDir = path.join(projectDir, 'webpack.config.js');
console.log(clc.green('CREATE'), wpConfigDir);
fs.writeFileSync(
    wpConfigDir, 
    render(path.join(__dirname, '../lib/templates/webpack.config.js.hbs'), context)
);

/* Create entry module */
createDirIfNotExists(path.join(projectDir, `src/${scripting}`));
for (let entry of entries) {
    const script = path.join(projectDir, `src/${scripting}/${entry}.${scripting}`);
    console.log(clc.green('CREATE'), script);
    fs.writeFileSync(
        script,
        render(path.join(__dirname, '../lib/templates/script.hbs'), { ...context, entry })
    );
}
if (scripting == 'ts') {
    /* Generate tsconfig.json file */
    const tsConfigDir = path.join(projectDir, 'tsconfig.json');
    console.log(clc.green('CREATE'), tsConfigDir);
    fs.writeFileSync(
        tsConfigDir,
        render(path.join(__dirname, '../lib/templates/tsconfig.json.hbs'), {})
    );
}

/* Create styles file */
createDirIfNotExists(path.join(projectDir, `src/${styling}`));
const stylesDir = path.join(projectDir, `src/${styling}/styles.${styling}`);
console.log(clc.green('CREATE'), stylesDir);
fs.writeFileSync(
    stylesDir,
    '/* Main Styles File */'
);

/* Create templates files */
const templatesDir = path.join(projectDir, `src/index.${templating}`);
console.log(clc.green('CREATE'), templatesDir);
fs.writeFileSync(
    templatesDir, 
    render(path.join(__dirname, '../lib/templates/index.html.hbs'), context)    
);

/* Write package.json file */
console.log(clc.green('RETRIEVE'), 'Dependencie:version...');
const dependenciesTree = {
    'default': ['webpack', 'webpack-cli', 'copy-webpack-plugin', 'webpack-dev-server'],
    'html': ['html-webpack-plugin'],
    'pug': ['html-webpack-plugin', 'pug-html-loader'],
    'css': ['css-loader', 'style-loader'],
    'scss': ['css-loader', 'style-loader', 'node-sass', 'sass-loader'],
    'js': [],
    'ts': ['typescript', 'ts-loader']
};
const dependencies = [
    ...dependenciesTree['default'],
    ...dependenciesTree[templating],
    ...dependenciesTree[styling],
    ...dependenciesTree[scripting],
    (purgeCss) ? '@fullhuman/purgecss-loader' : null
]
.filter(dep => !!dep)
.reduce((prev, curr) => {
    const resp = request('GET', `https://registry.npmjs.org/${curr}`);
    const version = JSON.parse(resp.getBody())['dist-tags']['latest'];
    prev[curr] = version;
    return prev;
}, {});
const pkgJsonDir = path.join(projectDir, 'package.json');
console.log(clc.green('CREATE'), pkgJsonDir);
fs.writeFileSync(
    pkgJsonDir,
    render(path.join(__dirname, '../lib/templates/package.json.hbs'), { ...context, dependencies })
);
console.log('😊 Don\'t forget to run', clc.blue('npm install'));

/* Initialize a git repository */
(async function () {
    process.chdir(projectDir);
    if (git) {
        console.log('>', clc.blue('git init'));
        await cmd('git init');
        const gitignorePath = path.join(projectDir, '.gitignore')
        console.log(clc.green('CREATE'), gitignorePath);
        fs.copyFileSync(
            path.join(__dirname, '../lib/templates/.gitignore'),
            '.gitignore'
        );
        fs.writeFileSync('src/assets/.gitkeep', '');
    }
})();