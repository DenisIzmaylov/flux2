/* global require, module */
var EventEmitter = require('eventemitter3');
var inherites = require('inherits');
var _assign = require('lodash.assign');

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
    this.Dispatcher._registerStore(this);
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
};
//Store.prototype.appendStore = function (changes) {
//    var state = this._stateMap.toJS();
//    var mergedArrays = {};
//    for (var key in changes) {
//        if (!changes.hasOwnProperty(key)) continue;
//        if (Array.isArray(changes[key]) &&
//            Array.isArray(state[key])) {
//            var mergedValue = state[key].concat(changes[key]);
//            mergedArrays[key] = mergedValue;
//        }
//    }
//    var newState = this._stateMap.merge(state, changes, mergedArrays);
//    this.setState(newState);
//};

module.exports = Store;