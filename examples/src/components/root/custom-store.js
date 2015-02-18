'use strict';
var Flux2 = require('../../../..');

module.exports = Flux2.createStore({name: 'Custom',
    getInitialState: function () {
        return {
            startTime: new Date()
        };
    }
});