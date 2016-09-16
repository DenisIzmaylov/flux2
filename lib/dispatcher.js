/* global require, module */
'use strict';
var _forOwn = require('lodash.forown');
var _forEach = require('lodash.foreach');

/**
 * @param {object} [spec]
 * @param {boolean} [spec.debugLog=false] turn on to see log, useful in dev mode
 * @constructor
 */
var Dispatcher = function (spec) {
    var spec = (typeof spec === 'object') ? spec : {};
    this.debugLog = Boolean(spec.debugLog);
    /**
     * Hash of registered stores (indexed by `name` property)
     * @type {object}
     * @private
     */
    this._registeredStoresByName = {};
    /**
     * Hash of registered stores (indexed by `_ID` property)
     * @type {object}
     * @private
     */
    this._registeredStoresByID = {};
    /**
     * @type {number}
     * @private
     */
    this._lastRegisteredStoreID = 0;
};

/**
 * @param {string} action
 * @param {function} callback which can return Promise object
 * @param {object} [context]
 * @param {object} [options]
 * @param {boolean} [options.once=false]
 * @param {boolean} [options.fullState=false]
 * @returns {Dispatcher} this
 */
Dispatcher.prototype.register = function (action, callback, context, options) {
    this._callbacks = this._callbacks || {};
    var lastCallbackID = this._lastCallbackID || 0;
    var exists = false;
    var collection = this._callbacks[action] || {};
    _forOwn(collection, function (collectionItem) {
        if (collectionItem && collectionItem.callback === callback) {
            exists = true;
        }
    });
    if (!exists) {
        collection[++lastCallbackID] = {
            callback: callback,
            context: context || this,
            options: (typeof options === 'object') ? options : {}
        };
        this._callbacks[action] = collection;
        this._lastCallbackID = lastCallbackID;
    }
    return this;
};
/**
 * @param {string} action
 * @param {function} callback
 * @param {object} [context]
 * @returns {Dispatcher} this
 */
Dispatcher.prototype.registerOnce = function (action, callback, context) {
    this.register(action, callback, context, {
        once: true
    });
};
/**
 * @param {string} action
 * @param {object} [data]
 * @returns {object} this
 * @todo support promises as a return value
 */
Dispatcher.prototype.dispatch = function (action, data) {
    if (this._callbacks && this._callbacks[action]) {
        var collection = this._callbacks[action];
        var garbage = [];
        _forOwn(collection, function (item, id) {
            if (item && typeof item.callback === 'function') {
                item.callback.apply(item.context, data && [data]);
                if (item.options.once) {
                    garbage.push(callbackId);
                }
            }
        });
        _forEach(garbage, function (callbackId) {
            delete collection[callbackId];
        });
    }
    return this;
};
/**
 * @param {string} action
 * @param {function} callback
 * @returns {Dispatcher} this
 */
Dispatcher.prototype.unregister = function (action, callback) {
    if (this._callbacks && this._callbacks[action]) {
        var collection = this._callbacks[action];
        _forOwn(collection, function (item, id) {
            if (item.callback === callback) {
                delete collection[id];
            }
        });
    }
    return this;
};
/**
 * Provides wait for store changes feature
 * @param {object|object[]} chains
 * @param {Store} [chains.store] store object
 * @param {function} [chains.ready] callback which should return true when params are accepted
 * @param {function} callback - calls when all parts in chain are accepted
 * @example
 *   Dispatcher.waitFor([{
 *     store: commentsStore,
 *     ready: function (params) {
 *       return Array.isArray(params.comments);
  *    }
  *  }, {
  *    store: activeUsersStore,
  *    ready: function (params) {
  *      return Array.isArray(params.users);
  *    }
  *  }], function () {
  *    React.render(
  *      React.createElement(MainPage, null),
  *      document.body
  *    );
  *  });
 */
Dispatcher.prototype.waitFor = function (chains, callback) {
    var chains = Array.isArray(chains) ? chains : [chains];
    var context = {
        counter: 0,
        chains: chains,
        callback: callback
    };
    for (var index = 0, length = chains.length; index < length; index++) {
        context.counter++;
        context.store = chains[index].store;
        chains[index].store.on('change', _onWaitForStoreChange, context);
    }
    if (context.counter === 0 && typeof callback === 'function') {
        callback();
    }
};
/**
 * Using by waitFor() method
 * @param {Object} changes
 * @private
 */
var _onWaitForStoreChange = function (changes) {
    var self = this;
    _forOwn(this.chains, function (chain) {
        if (chain.store === self.store && chain.ready(changes)) {
            chain.store.off('change', _onWaitForStoreChange);
            self.counter--;
            if (self.counter < 1 && typeof self.callback === 'function') {
                self.callback();
            }
        }
    });
};
/**
 * For internal use only. This method is using by Store to register it (IoC).
 * @param {object} store
 * @returns {number} id of registered store
 * @private
 */
Dispatcher.prototype._registerStore = function (store) {
    if (this.debugLog && console && console.debug) {
        console.debug('Dispatcher.registerStore(%s)', store.name || 'unknown', store);
    }
    this._lastRegisteredStoreID++;
    this._registeredStoresByID[this._lastRegisteredStoreID] = store;
    if (typeof store.name !== 'undefined') {
        var name = store.name;
        if (this._registeredStoresByName[name]) {
            if (this._registeredStoresByName[name] !== store) {
                if (console && console.warn) {
                    console.warn(
                        'Dispatcher: another store with specified name "%s" is already registered.' +
                        ' Specified name was ignored.',
                        name,
                        this._registeredStoresByName[name]
                    );
                }
            }
        } else {
            this._registeredStoresByName[name] = store;
        }
    }
    return this._lastRegisteredStoreID;
};
/**
 * For internal use only. This method is using by Store to unregister it (IoC).
 * @param {number} storeID
 * @private
 */
Dispatcher.prototype._unregisterStore = function (storeID) {
    if (this.debugLog && console && console.debug) {
        console.debug('Dispatcher.unregisterStore(%s)', storeID);
    }
    if (this._registeredStoresByID[storeID] &&
        this._registeredStoresByID[storeID].name) {
        var storeName = this._registeredStoresByID[storeID].name;
        delete this._registeredStoresByName[storeName];
    }
    delete this._registeredStoresByID[storeID];
};
/**
 * Get store by name or registered ID
 * @param {string|number} identifier - name or id of store
 * @returns {object} found store or false
 */
Dispatcher.prototype.getStore = function (identifier) {
    if (typeof identifier === 'number' && this._registeredStoresByID[identifier]) {
        return this._registeredStoresByID[identifier];
    } else if (this._registeredStoresByName[identifier]) {
        return this._registeredStoresByName[identifier];
    } else {
        return false;
    }
};
/**
 * Returns `state` property of specified store
 * @param {string|number} identifier - name or id of store
 */
Dispatcher.prototype.getState = function (identifier) {
    var foundStore = this.getStore(identifier);
    if (typeof foundStore === 'object') {
        return foundStore.state;
    } else {
        return false;
    }
};
/**
 * Set state of specified store
 * @param {string|number} identifier - name or id of store
 * @param {object} state
 * @returns {boolean}
 */
Dispatcher.prototype.setState = function (identifier, state) {
    if (this.debugLog && console && console.debug) {
        console.debug('Dispatcher.setState(%s)', identifier, state);
    }
    var foundStore = this.getStore(identifier);
    if (foundStore) {
        if (foundStore.name) {
            this.dispatch('set' + foundStore.name + 'State', state);
        }
        this.dispatch('setStore' + foundStore._registeredStoreID + 'State', state);
        return foundStore.setState(state);
    } else {
        if (console && console.warn) {
            console.warn(
                'Dispatcher: specified store "%s" for setState() is not found.',
                identifier
            );
        }
        return false;
    }
};
/**
 * Append properties when it's array
 * and just set it in other cases
 * @param {string|number} identifier - name or id of store
 * @param {object} state
 * @returns {boolean}
 */
Dispatcher.prototype.appendState = function (identifier, state) {
    if (this.debugLog && console && console.debug) {
        console.debug('Dispatcher.appendState(%s)', identifier, state);
    }
    var foundStore = this.getStore(identifier);
    if (foundStore) {
        var prevState = foundStore.state;
        var newState = {};
        var sourceArr;
        _forOwn(state, function (value, key) {
            if (Array.isArray(value)) {
                sourceArr = (Array.isArray(prevState[key])) ? prevState : [];
                newState[key] = sourceArr.concat(value);
            } else {
                newState[key] = value;
            }
        });
        return this.setState(identifier, newState);
    } else {
        if (console && console.warn) {
            console.warn(
                'Dispatcher: specified store "%s" for appendState() is not found.',
                identifier
            );
        }
        return false;
    }
};

module.exports = Dispatcher;
