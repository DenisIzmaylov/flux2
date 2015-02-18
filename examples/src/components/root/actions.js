'use strict';
var Flux2 = require('../../../..');
var Dispatcher = Flux2.Dispatcher;

module.exports = {
    requestTime: function () {
        console.log(Dispatcher.getState('Root'))
        Dispatcher.setState('Root', {
            timestamp: Date.now()
        });
    }
};