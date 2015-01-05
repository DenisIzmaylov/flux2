/* global require, module */
var Flux2 = require('flux2');
var Dispatcher = Flux2.Dispatcher;

module.exports = Flux2.createStore({
    getInitialState: function () {
        return {
            appId: 'f0f46eac9253fd49f1d9'
        };
    },
    init: function () {
        console.log('App ID [%s]', this.state.appId);
        Dispatcher.register('setRootState', this._onChange, this);
    },

    _onChange: function (changes) {
        this.setState(changes);
    }
});