const { GettextExtractor, JsExtractors, HtmlExtractors } = require('gettext-extractor');

let extractor = new GettextExtractor();

extractor
    .createJsParser([
        JsExtractors.callExpression('get', {
            arguments: {
                text: 0,
            }
        }),
        JsExtractors.callExpression('translate', {
            arguments: {
                text: 0,
            }
        })
    ])
    .parseFilesGlob('./owncomponents/**/*.@(ts|js|tsx|jsx)');

extractor.savePotFile('./messages.pot');

extractor.printStats();
