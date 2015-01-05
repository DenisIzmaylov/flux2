var Flux2 = require('flux2');
var Dispatcher = Flux2.Dispatcher;

module.exports = {
    requestTime: function () {
        Dispatcher.dispatch('setRootState', {
            timestamp: Date.now()
        });
    }
};