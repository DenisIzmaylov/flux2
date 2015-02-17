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
        var itemIdCounter = this['__eventsSubscriberIdCounter'] || 1;
        var exists = false;
        var collection = this['__events'][id] || {};
        _.forOwn(collection, function (collectionItem) {
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
            this['__events'][id] = collection;
            this['__eventsSubscriberIdCounter'] = itemIdCounter;
        }
        return this;
    },

    /**
     * @param {string} id of event
     * @param {function} callback
     * @param {object} [context]
     * @returns {object} this
     */
    once: function (id, callback, context) {
        this.on(id, callback, context, {once: true});
    },

    /**
     * @param {string} id of event
     * @param {object} [params] for callback
     * @returns {object} this
     */
    emit: function (id, params) {
        if (this['__events'] && this['__events'][id]) {
            var collection = this['__events'][id];
            var itemsToDelete = [];

            _.forOwn(collection, function (collectionItem, collectionItemId) {
                if (collectionItem && typeof collectionItem.callback === 'function') {
                    collectionItem.callback.apply(collectionItem.context, params && [params]);
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
     * @param {string} id of event
     * @param {function} callback
     * @returns {object} this
     */
    off: function (id, callback) {
        if (this['__events'] && this['__events'][id]) {
            var collection = this['__events'][id];
            _.forOwn(collection, function (collectionItem, id) {
                if (collectionItem.callback === callback) {
                    delete collection[id];
                }
            });
        }
        return this;
    }
};