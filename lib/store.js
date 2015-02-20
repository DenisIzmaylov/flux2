/* global require, module */
var EventEmitter = require('eventemitter3');
var inherites = require('inherits');
var _assign = require('lodash.assign');
var Dispatcher = require('./dispatcher');

/**
 * Creates a store instance
 * @constructor
 * @param {object} spec
 * @param {string} [spec.name]
 * @param {Dispatcher} [spec.dispatcher]
 * @param {function} [spec.getInitialState]
 * @parma {function} [spec.storeWillRegister]
 * @parma {function} [spec.storeDidRegister]
 * @param {function} [spec.shouldStoreUpdate]
 * @param {function} [spec.storeWillUpdate]
 * @param {function} [spec.storeDidUpdate]
 */
var Store = function (spec, Dispatcher) {
    _assign(this, spec);
    if (typeof this.getInitialState === 'function') {
        this.state = _assign({}, this.getInitialState());
    } else {
        this.state = {};
    }
    if (typeof this.dispatcher === 'undefined') {
        this.dispatcher = this.defaultDispatcher;
    }
    if (typeof this.init !== 'undefined') {
        this.init();
        if (console && console.warn) {
            console.warn(
                'Store: you use deprecated property init() to construct store. ' +
                'Please use getInitialState() instead.',
                this
            );
        }
    }
    if (typeof this.storeWillRegister === 'function') {
        var cancel = this.storeWillRegister();
        if (cancel) {
            return null;
        }
    }
    this._registeredStoreID = this.dispatcher._registerStore(this);
    if (typeof this.storeDidRegister === 'function') {
        this.storeDidRegister();
    }
};
inherites(Store, EventEmitter);
/**
 * @param {Boolean} state
 * @returns {boolean}
 */
Store.prototype.setState = function (state) {
    if (typeof this.shouldStoreUpdate === 'function') {
        if (!this.shouldStoreUpdate(state)) {
            return false;
        }
    }
    var prevState = this.state;
    var newState = _assign({}, prevState, state);
    if (typeof this.storeWillUpdate === 'function') {
        this.storeWillUpdate(newState);
    }
    this.state = newState;
    this.emit('change', newState);
    if (typeof this.storeDidUpdate === 'function') {
        this.storeDidUpdate(prevState);
    }
    return true;
};
Store.prototype.destroy = function () {
    if (typeof this.storeWillUnregister === 'function') {
        this.storeWillUnregister();
    }
    this.dispatcher._unregisterStore(this._registeredStoreID);
    this.state = {};
};

module.exports = Store;