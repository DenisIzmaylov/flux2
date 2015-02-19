/* global require, module */
var EventEmitter = require('eventemitter3');
var inherites = require('inherits');
var _assign = require('lodash.assign');
var _forOwn = require('lodash.forown');

/**
 * @param {Object} Dispatcher
 * @returns {Function}
 */
module.exports = function (Dispatcher) {
    /**
     * Creates a store instance
     * @constructor
     * @param {object} spec
     * @param {string} [spec.name]
     * @param {function} [spec.getInitialState]
     * @parma {function} [spec.storeWillMount]
     * @parma {function} [spec.storeDidMount]
     * @param {function} [spec.shouldStoreUpdate]
     * @param {function} [spec.storeWillUpdate]
     * @param {function} [spec.storeDidUpdate]
     * @returns {object} instance
     */
    var Store = function (spec) {
        _assign(this, spec);
        if (typeof this.getInitialState === 'function') {
            this.state = _assign({}, this.getInitialState());
        } else {
            this.state = {};
        }
        if (typeof this.init !== 'undefined') {
            this.init();
            if (console && console.warn) {
                console.warn(
                    'You use deprecated property init() to construct store. ' +
                    'Please use getInitialState() or storeWillMount() instead.',
                    this
                );
            }
        }
        if (typeof this.storeWillMount === 'function') {
            var cancel = this.storeWillMount();
            if (cancel) {
                return null;
            }
        }
        Dispatcher._registerStore(this);
        if (typeof this.storeDidMount === 'function') {
            this.storeDidMount();
        }
    };
    inherites(Store, EventEmitter);
    /**
     * @param {Object} state
     * @returns {boolean}
     */
    Store.prototype.setState = function (state) {
        if (typeof this.shouldStoreUpdate === 'function') {
            if (!this.shouldStoreUpdate(state)) {
                return false;
            }
        }
        var prevState = this.state;
        var changes = _assign({}, state);
        var newState = _assign({}, this.state, changes);
        if (typeof this.storeWillUpdate === 'function') {
            this.storeWillUpdate(newState);
        }
        this.state = newState;
        this.emit('change', changes);
        if (typeof this.storeDidUpdate === 'function') {
            this.storeDidUpdate(prevState);
        }
    };
    /**
     * Append properties which defined as an array
     * and just set as-is for other properties
     * @param {Object} state
     * @returns {boolean}
     */
    Store.prototype.appendStore = function (state) {
        var prevState = this.state;
        var newState = {};
        var sourceArr;
        _forOwn(newState, function (value, key) {
            if (Array.isArray(value)) {
                sourceArr = (Array.isArray(prevState[key])) ? prevState : [];
                newState[key] = sourceArr.concat(value);
            } else {
                newState[key] = value;
            }
        });
        return this.setState(newState);
    };
    return function (spec) {
        return new Store(spec);
    };
};