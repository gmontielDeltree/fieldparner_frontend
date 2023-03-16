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
        }),
        JsExtractors.callExpression('v', {
            arguments: {
                text: 1,
            }
        }),
        JsExtractors.callExpression('[this].text_field', {
            arguments: {
                text: 0,
            }
        }),
        JsExtractors.callExpression('[this].variable_input', {
            arguments: {
                text: 1,
            }
        })
    ])
    .parseFilesGlob('./owncomponents/**/*.@(ts|js|tsx|jsx)');

extractor.savePotFile('./messages.pot');

extractor.printStats();
