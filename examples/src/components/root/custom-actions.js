'use strict';
var Flux2 = require('../../../..');
var Dispatcher = Flux2.Dispatcher;

module.exports = {
    applyCustomAction: function () {
        Dispatcher.setState('Custom', {
            test3: new Date()
        });
    }
};