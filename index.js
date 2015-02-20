/* global require, module */
'use strict';
var Dispatcher = require('./lib/dispatcher');
var Store = require('./lib/store');
var WatchStoreMixin = require('./lib/watch-store-mixin');
var defaultDispatcher = new Dispatcher();
Store.prototype.defaultDispatcher = defaultDispatcher;

module.exports = {
    Dispatcher: defaultDispatcher,
    WatchStoreMixin: WatchStoreMixin(Store),
    createStore: function (spec) {
        return new Store(spec);
    },
    createDispatcher: function (spec) {
        return new Dispatcher(spec);
    }
};