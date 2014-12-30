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
    }
};
