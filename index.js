/* global require, module */
'use strict';
var Dispatcher = require('./lib/dispatcher');
var Store = require('./lib/store');
var WatchStoreMixin = require('./lib/watch-store-mixin');
Store.prototype.Dispatcher = Dispatcher;

module.exports = {
    Dispatcher: Dispatcher,
    Store: Store,
    WatchStoreMixin: WatchStoreMixin(Store),
    createStore: function (spec) {
        return new Store(spec);
    }
};