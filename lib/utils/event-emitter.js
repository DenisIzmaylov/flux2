/* global require, module */
'use strict';

module.exports = {
    /**
     * @param {string} id of event
     * @param {function} callback
     * @param {object} [context]
     * @param {object} [options]
     * @param {boolean} [options.once=false]
     * @returns {object} this
     */
    on: function (id, callback, context, options) {
        this['__events'] = this['__events'] || {};
        if (typeof this['__events'][id] === 'undefined') {
            this['__events'][id] = [];
        }
        var exists = false;
        var collection = this['__events'][id];
        for (var index = 0, length = collection.length; index < length; index++) {
            if (collection[index].callback === callback) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            this['__events'][id].push({
                callback: callback,
                context: context || this,
                options: (typeof options === 'object') || {}
            });
        }
        return this;
    },

    /**
     * @param {string} id of event
     * @param {function} callback
     * @param {object} [context]
     * @param {object} [options]
     * @param {boolean} [options.once=false]
     * @returns {object} this
     */
    once: function (id, callback, context) {
        this.on(id, callback, context, {once: true});
    },

    /**
     * @param {string} id of event
     * @param {object} data to push
     * @param {object} [params] for callback
     * @returns {object} this
     */
    emit: function (id, params) {
        if (this['__events'] && this['__events'][id]) {
            var collection = this['__events'][id];
            var collectionItem;
            var itemsToDelete = [];
            for (var index = 0, length = collection.length; index < length; index++) {
                collectionItem = collection[index];
                if (typeof collectionItem.callback === 'function') {
                    collectionItem.callback.apply(collectionItem.context, params && [params]);
                    if (collectionItem.options.once) {
                        itemsToDelete.push(index);
                    }
                }
            }
            for (var index = 0, length = itemsToDelete.length; index < length; index++) {
                collection.splice(itemsToDelete[index], 1);
            }
        }
        return this;
    },

    /**
     * @param {string} id of event
     * @param {function} callback
     * @returns {object} this
     */
    off: function (id, callback) {
        if (this['__events'] && this['__events'][id]) {
            var callbackIndex;
            var collection = this['__events'][id];
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