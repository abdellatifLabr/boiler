const path = require('path');
const fs = require('fs');
const clc = require('cli-color');
const cli = require('./cli');
const cmd = require('./cmd');
const progressBar = require('./progress-bar');
const { render, createDirIfNotExists } = require('./utils');

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
    console.log('Project directory already exists.');
} else {
    if (projectDir != '.') {
        fs.mkdirSync(projectDir);
    }
    fs.mkdirSync(path.resolve(projectDir, 'src'));
    fs.mkdirSync(path.resolve(projectDir, 'src', 'assets'));
    fs.mkdirSync(path.resolve(projectDir, 'dist'));
}

/* Write config file */
const wpConfigDir = path.resolve(projectDir, 'webpack.config.js');
console.log(clc.green('CREATE'), wpConfigDir);
fs.writeFileSync(
    wpConfigDir, 
    render('./templates/webpack.config.js.hbs', context)
);

/* Create entry module */
createDirIfNotExists(path.resolve(projectDir, `src/${scripting}`));
for (let entrie of entries) {
    const script = path.resolve(projectDir, `src/${scripting}/${entrie}.${scripting}`);
    console.log(clc.green('CREATE'), script);
    fs.writeFileSync(
        script,
        render('./templates/script.hbs', { ...context, entrie })
    );
}
if (scripting == 'ts') {
    /* Generate tsconfig.json file */
    const tsConfigDir = path.resolve(projectDir, 'tsconfig.json');
    console.log(clc.green('CREATE'), tsConfigDir);
    fs.writeFileSync(
        tsConfigDir,
        render('./templates/tsconfig.json.hbs', {})
    );
}

/* Create styles file */
createDirIfNotExists(path.resolve(projectDir, `src/${styling}`));
const stylesDir = path.resolve(projectDir, `src/${styling}/styles.${styling}`);
console.log(clc.green('CREATE'), stylesDir);
fs.writeFileSync(
    stylesDir,
    '/* Main Styles File */'
);

/* Create tempaltes files */
const templatesDir = path.resolve(projectDir, `src/index.${templating}`);
console.log(clc.green('CREATE'), templatesDir);
fs.writeFileSync(
    templatesDir, 
    render('./templates/index.hbs', context)    
);

/* Write package.json file */
const pkgJsonDir = path.resolve(projectDir, 'package.json');
console.log(clc.green('CREATE'), pkgJsonDir);
fs.writeFileSync(
    pkgJsonDir,
    render('./templates/package.json.hbs', context)
);

/* Filtering & installing dependencies */
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
});
console.log(dependencies);
process.exit()
(async function () {
    process.chdir(projectDir);
    console.log('> npm install');
    progressBar.start(dependencies.length, 0);
    for (let [i, dep] of dependencies.entries()) {
        await cmd(`npm install -D ${dep}`);
        progressBar.update(i+1);
    }
    progressBar.stop();
    if (git) {
        console.log('> git init');
        await cmd('git init');
        fs.copyFileSync('../templates/.gitignore', '.gitignore');
        fs.writeFileSync('src/assets/.gitkeep', '');
    }
})();