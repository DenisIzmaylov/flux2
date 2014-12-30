/* global require, module */
'use strict';

// @todo make [id] argument as an optional
module.exports = {
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
        if (typeof this['callbacks'][id] === 'undefined') {
            this['callbacks'][id] = [];
        }
        var exists = false;
        var collection = this['callbacks'][id];
        for (var index = 0, length = collection.length; index < length; index++) {
            if (collection[index].callback === callback) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            this['callbacks'][id].push({
                callback: callback,
                context: context || this,
                options: (typeof options === 'object') || {}
            });
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
            var collectionItem;
            var itemsToDelete = [];
            for (var index = 0, length = collection.length; index < length; index++) {
                collectionItem = collection[index];
                if (typeof collectionItem.callback === 'function') {
                    collectionItem.callback.apply(collectionItem.context, [data]);
                    if (collectionItem.options.once) {
                        itemsToDelete.push(index);
                    }
                }
            }
            for (var index = itemsToDelete.length - 1, finish = 0; index >= finish; index--) {
                collection.splice(itemsToDelete[index], 1);
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
            var callbackIndex;
            var collection = this['callbacks'][id];
            for (var index = 0, length = collection.length; index < length; index++) {
                if (collection[index].callback === callback) {
                    callbackIndex = index;
                    break;
                }
            }
            if (typeof callbackIndex !== 'undefined') {
                collection.splice(callbackIndex, 1);
            }
        }
        return this;
    },
    
    /**
     * Provides wait for store changes feature
     * @param {object|object[]} chain
     * @param {object} chain.store - instance of store
     * @param {function} chain.ready - should return true when params are accepted
     * @param {function} doneCallback - calls when all parts in chain are accepted
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
    waitFor: function (chain, doneCallback) {
        var chain = Array.isArray(chain) ? chain : [chain];
        var counter = 0;
        var _onStoreChange = function (changes) {
            var item;
            for (var key in chain) {
                if (!chain.hasOwnProperty(key) ||
                    chain[key].store !== this) {
                    continue;
                }
                item = chain[key];
                if (item.ready(changes)) {
                    item.store.off('change', _onStoreChange);
                    counter--;
                    if (counter < 1 && typeof doneCallback === 'function') {
                        doneCallback();
                    }
                }
                break;
            }
        };
        chain.forEach(function (item) {
            counter++;
            item.store.on('change', _onStoreChange);
        });
        if (counter === 0 && typeof doneCallback === 'function') {
            doneCallback();
        }
    }
};
