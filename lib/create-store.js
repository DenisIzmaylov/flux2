/* global require, module */
var EventEmitter = require('eventemitter3');
var inherites = require('inherits');
var assign = require('lodash.assign');
var Immutable = require('immutable');

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
        assign(this, spec);
        if (typeof this.getInitialState === 'function') {
            this._stateMap = Immutable.Map(this.getInitialState());
            this.state = this._stateMap.toJS();
        } else {
            this._stateMap = Immutable.Map({});
            this.state = {};
        }
        if (typeof this.init !== 'undefined') {
            this.init();
            if (console.warn) {
                console.warn(
                    'You use deprecated property init() to construct store. ' +
                    'Please use getInitialState() instead.',
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
     * @param {Boolean} state
     * @returns {boolean}
     */
    Store.prototype.setState = function (state) {
        if (typeof this.shouldStoreUpdate === 'function') {
            if (!this.shouldStoreUpdate(state)) {
                return false;
            }
        }
        var prevState = this._stateMap;
        var newState = prevState.merge(state);
        if (typeof this.storeWillUpdate === 'function') {
            this.storeWillUpdate(newState);
        }
        this._stateMap = newState;
        this.state = newState.toJS();
        this.emit('change', newState);
        if (typeof this.storeDidUpdate === 'function') {
            this.storeDidUpdate(prevState.toJS());
        }
    };
    Store.prototype.appendStore = function (changes) {
        var state = this._stateMap.toJS();
        var mergedArrays = {};
        for (var key in changes) {
            if (!changes.hasOwnProperty(key)) continue;
            if (Array.isArray(changes[key]) &&
                Array.isArray(state[key])) {
                var mergedValue = state[key].concat(changes[key]);
                mergedArrays[key] = mergedValue;
            }
        }
        var newState = this._stateMap.merge(state, changes, mergedArrays);
        this.setState(newState);
    };
    return function (spec) {
        return new Store(spec);
    };
};