/* global require, module */
'use strict';

module.exports = {
    Dispatcher: require('./lib/dispatcher'),
    createStore: require('./lib/create-store'),
    addons: {
        windowStore: require('./lib/addons/window-store')
    }
};