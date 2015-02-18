/* global require, module */
'use strict';
var Dispatcher = require('./lib/dispatcher');
var createStore = require('./lib/create-store');

module.exports = {
    Dispatcher: Dispatcher,
    createStore: createStore(Dispatcher)
};