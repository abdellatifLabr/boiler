const hbs = require('handlebars');

hbs.registerHelper('if_eq', function(a, b, opts) {
    if (a == b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});

hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

module.exports = hbs;