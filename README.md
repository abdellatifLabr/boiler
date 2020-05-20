# Boiler
Project boilerplate generator with **Webpack**.

## Install
```bash
$ npm install -g @tifo18/boiler
```

## Usage
```bash
$ boiler --help
Usage: app [options]

Options:
  -d, --directory <directory>  Project creation directory
  -e, --entries <entries>      Project entry files names, default: main
  --js                         Set scripting language to Javascript
  --ts                         Set scripting language to Typescript
  --html                       Set templating language to HTML
  --pug                        Set templating language to PUG (HTML preprocessor)
  --css                        Set styling language to CSS
  --scss                       Set styling language to SCSS/SASS
  --purge-css                  Enable purge-css plugin (get rid of unused css styles)
  --dev-server                 Enable development live server
  --git                        Initialize a git repository with a custom .gitignore file
  -h, --help                   output usage information
```

## Example
```bash
$ boiler -d example --html --scss --ts --purge-css --git
CREATE example\webpack.config.js
CREATE example\src\ts\main.ts
CREATE example\tsconfig.json
CREATE example\src\scss\styles.scss
CREATE example\src\index.html
RETRIEVE Dependencie:version...
CREATE example\package.json
😊 Don't forget to run npm install
> git init
CREATE example\.gitignore
```

## License
**Boiler** is freely distributable under the terms of the [MIT License](https://github.com/labTifo/boiler/blob/master/LICENSE).