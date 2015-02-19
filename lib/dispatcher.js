/* global require, module */
'use strict';
var _forOwn = require('lodash.forown');

// @todo make [id] argument as an optional
module.exports = {
    /**
     * Turn on to enable logging
     * @type {boolean}
     */
    debugLog: false,
    /**
     * Hash of registered stores (indexed by `name` property)
     * @type {object}
     * @private
     */
    _registeredStoresByName: {},
    /**
     * Hash of registered stores (indexed by `_ID` property)
     * @type {object}
     * @private
     */
    _registeredStoresByID: {},
    /**
     * @type {number}
     * @private
     */
    _lastRegisteredStoreID: 0,
    /**
     * @param {string} id of collection
     * @param {function} callback which can return Promise object
     * @param {object} [context]
     * @param {object} [options]
     * @param {boolean} [options.once=false]
     * @param {boolean} [options.fullState=false]
     * @returns {object} this
     */
    register: function (id, callback, context, options) {
        this['callbacks'] = this['callbacks'] || {};
        var itemIdCounter = this['callbacksSubscriberIdCounter'] || 1;
        var exists = false;
        var collection = this['callbacks'][id] || {};
        _forOwn(collection, function (collectionItem) {
            if (collectionItem && collectionItem.callback === callback) {
                exists = true;
            }
        });
        if (!exists) {
            collection[itemIdCounter++] = {
                callback: callback,
                context: context || this,
                options: (typeof options === 'object') || {}
            };
            this['callbacks'][id] = collection;
            this['callbacksSubscriberIdCounter'] = itemIdCounter;
        }
        return this;
    },

    /**
     * @param {string} id of collection
     * @param {function} callback
     * @param {object} [context]
     * @returns {object} this
     */
    registerOnce: function (id, callback, context) {
        this.register(id, callback, context, {once: true});
    },

    /**
     * @param {string|object[]} id of action or a collection {action: '', data: {}}
     * @param {object} [data] to action
     * @returns {object} this
     * @todo support promises as a return value
     */
    dispatch: function (id, data) {
        if (this['callbacks'] && this['callbacks'][id]) {

            var collection = this['callbacks'][id];
            var itemsToDelete = [];

            _forOwn(collection, function (collectionItem, collectionItemId) {
                if (collectionItem && typeof collectionItem.callback === 'function') {
                    collectionItem.callback.apply(collectionItem.context, data && [data]);
                    if (collectionItem.options.once) {
                        itemsToDelete.push(collectionItemId);
                    }
                }
            });
            for (var index = 0, length = itemsToDelete.length; index < length; index++) {
                delete collection[itemsToDelete[index]];
            }
        }
        return this;
    },

    /**
     * @param {string} id of collection
     * @param {function} callback
     * @returns {object} this
     */
    unregister: function (id, callback) {
        if (this['callbacks'] && this['callbacks'][id]) {
            var collection = this['callbacks'][id];
            _forOwn(collection, function (collectionItem, id) {
                if (collectionItem.callback === callback) {
                    delete collection[id];
                }
            });
        }
        return this;
    },

    /**
     * Provides wait for store changes feature
     * @param {object|object[]} chains
     * @param {object} [chains.store] store object
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
    waitFor: function (chains, callback) {
        var chains = Array.isArray(chains) ? chains : [chains];
        var context = {
            counter: 0,
            chains: chains,
            callback: callback
        };
        for (var index = 0, length = chains.length; index < length; index++) {
            context.counter++;
            chains[index].store.on('change', _onWaitForStoreChange, context);
        }
        if (context.counter === 0 && typeof callback === 'function') {
            callback();
        }
    },
    /**
     * @param {object} store
     * @returns {number} id of registered store
     */
    _registerStore: function (store) {
        if (this.debugLog && console && console.debug) {
            console.debug('Dispatcher.registerStore(%s)', store.name || 'unknown', store);
        }
        this._lastRegisteredStoreID++;
        store._registeredStoreID = this._lastRegisteredStoreID;
        this._registeredStoresByID[store._registeredStoreID] = store;
        if (typeof store.name !== 'undefined') {
            var name = store.name;
            if (this._registeredStoresByName[name]) {
                if (this._registeredStoresByName[name] !== store) {
                    if (console && console.warn) {
                        console.warn(
                            'Dispatcher: another store with specified name "%s" is already registered.',
                            name,
                            this._registeredStoresByName[name]
                        );
                    }
                }
            } else {
                this._registeredStoresByName[name] = store;
            }
        }
    },
    /**
     * @param {string|number} identifier - name or id of store
     */
    _unregisterStore: function (identifier) {
        var store = this.getStore(identifier);
        if (this.debugLog && console && console.debug) {
            console.debug('Dispatcher.unregisterStore(%s)', store.name || 'unknown', store);
        }
        if (store.name) {
            delete this._registeredStoresByName[store.name];
        }
        if (store._registeredStoreID) {
            delete this._registeredStoresByID[store._registeredStoreID];
        }
    },
    /**
     * Returns object of specified store
     * @param {string|number} identifier - name or id of store
     * @returns {object} found store or false
     */
    getStore: function (identifier) {
        if (typeof identifier === 'number' &&
                this._registeredStoresByID[identifier]) {
            return this._registeredStoresByID[identifier];
        } else if (this._registeredStoresByName[identifier]) {
            return this._registeredStoresByName[identifier];
        } else {
            return false;
        }
    },
    /**
     * Returns `state` property of specified store
     * @param {string|number} identifier - name or id of store
     */
    getState: function (identifier) {
        var foundStore = this.getStore(identifier);
        if (typeof foundStore === 'object') {
            return foundStore.state;
        } else {
            return false;
        }
    },
    /**
     * Set state of specified store
     * @param {string|number} identifier - name or id of store
     * @param {object} state
     */
    setState: function (identifier, state) {
        if (this.debugLog && console && console.debug) {
            console.debug('Dispatcher.setState(%s)', identifier, state);
        }
        var foundStore = this.getStore(identifier);
        if (foundStore) {
            if (foundStore.name) {
                this.dispatch('set' + foundStore.name + 'State', state);
            }
            this.dispatch('setStore' + foundStore._registeredStoreID + 'State', state);
            foundStore.setState(state);
        } else {
            if (console && console.warn) {
                console.warn(
                    'Dispatcher: specified store "%s" for setState() is not found.',
                    identifier
                );
            }
        }
    },
    /**
     * Set state of specified store
     * @param {string|number} identifier - name or id of store
     * @param {object} state
     */
    appendState: function (identifier, state) {
        if (this.debugLog && console && console.debug) {
            console.debug('Dispatcher.appendState(%s)', identifier, state);
        }
        var foundStore = this.getStore(identifier);
        if (foundStore) {
            if (foundStore.name) {
                this.dispatch('append' + foundStore.name + 'State', state);
            }
            this.dispatch('appendStore' + foundStore._registeredStoreID + 'State', state);
            foundStore.appendState(state);
        } else {
            if (console && console.warn) {
                console.warn(
                    'Dispatcher: specified store "%s" for appendState() is not found.',
                    identifier
                );
            }
        }
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
        if (chain.store === self && chain.ready(changes)) {
            chain.store.off('change', _onWaitForStoreChange);
            self.counter--;
            if (self.counter < 1 && typeof self.callback === 'function') {
                self.callback();
            }
        }
    });
};