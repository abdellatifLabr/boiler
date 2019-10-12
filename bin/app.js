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
const devServer = cli.devServer;
const git = cli.git;
const context = { projectDir, entries, scripting, styling, templating, purgeCss, devServer };

/* Creating project structure */
if (fs.existsSync(projectDir)) {
    console.log(clc.yellow('Project directory already exists.'));
    process.exit();
} else {
    if (projectDir != '.') {
        fs.mkdirSync(projectDir);
    }
    fs.mkdirSync(path.join(projectDir, 'src'));
    fs.mkdirSync(path.join(projectDir, 'src', 'assets'));
    fs.mkdirSync(path.join(projectDir, 'dist'));
}

/* Write webpack.config.js file */
const wpConfigDir = path.join(projectDir, 'webpack.config.js');
console.log(clc.green('CREATE'), wpConfigDir);
fs.writeFileSync(
    wpConfigDir, 
    render(path.join(__dirname, '../lib/templates/webpack.config.js.hbs'), context)
);

/* Create entry module */
createDirIfNotExists(path.join(projectDir, `src/${scripting}`));
for (let entrie of entries) {
    const script = path.join(projectDir, `src/${scripting}/${entrie}.${scripting}`);
    console.log(clc.green('CREATE'), script);
    fs.writeFileSync(
        script,
        render(path.join(__dirname, '../lib/templates/script.hbs'), { ...context, entrie })
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

/* Create tempaltes files */
const templatesDir = path.join(projectDir, `src/index.${templating}`);
console.log(clc.green('CREATE'), templatesDir);
fs.writeFileSync(
    templatesDir, 
    render(path.join(__dirname, '../lib/templates/index.hbs'), context)    
);

/* Write package.json file */
console.log(clc.green('RETRIEVE'), 'Dependencie:version...');
const dependencies = [
    'copy-webpack-plugin',
    'css-loader',
    'html-webpack-plugin',
    'pug-html-loader',
    'node-sass',
    'sass-loader',
    'style-loader',
    '@fullhuman/purgecss-loader',
    'ts-loader',
    'webpack',
    'webpack-dev-server',
    'webpack-cli',
    'typescript'
].filter(dep => {
    if (styling == 'css' && (dep == 'sass-loader' || dep == 'node-sass')) return false;
    if (!purgeCss && dep == '@fullhuman/purgecss-loader') return false;
    if (templating == 'html' && dep == 'pug-html-loader') return false;
    if (scripting == 'js' && dep == 'ts-loader') return false;
    if (scripting == 'js' && dep == 'typescript') return false;
    if (!devServer && dep == 'webpack-dev-server') return false;
    return true;
}).reduce((prev, curr) => {
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