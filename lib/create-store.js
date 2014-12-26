/* global require, module */
var _ = require('lodash');
var eventEmitter = require('./utils/event-emitter');

/**
 * Creates a store instance
 * @param {object} spec
 * @param {function} [spec.getInitialState]
 * @returns {object} instance
 */
module.exports = function (spec) {
    var instance = _.extend({
        setState: function (partialState) {
            _.extend(this.state, partialState);
            this.emit('change', partialState);
        }
    }, eventEmitter, spec);
    if (typeof instance.getInitialState === 'function') {
        instance.state = instance.getInitialState();
    }
    if (typeof instance.state !== 'object') {
        instance.state = {};
    }
    if (typeof instance.init === 'function') {
        instance.init();
    }
    return instance;
};