'use strict';
var Flux2 = require('../../../..');

module.exports = Flux2.createStore({name: 'Root',
    getInitialState: function () {
        return {
            appId: 'f0f46eac9253fd49f1d9'
        };
    }
});