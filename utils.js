const fs = require('fs');
const hbs = require('./hbs');

module.exports = {
    render: (templatePath, context) => {
        const fileContent = fs.readFileSync(templatePath);
        const template = hbs.compile(fileContent.toString());
        const result = template(context);
        return result;
    },
    createDirIfNotExists: (path) => {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    }
}