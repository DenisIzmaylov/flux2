/* global require, module */
var _forEach = require('lodash.foreach');
var _assign = require('lodash.assign');

var WatchStoreMixinFactory = function (Store) {
    var WatchStoreMixin = function () {
        var mixinArgs = [];
        for (var index = 0, length = arguments.length; index < length; index++) {
            mixinArgs.push(arguments[index]);
        }
        return {
            getInitialState: function () {
                var self = this;
                var fetched = false;
                var result;
                _forEach(mixinArgs, function (item) {
                    if (item instanceof Store) {
                        if (!fetched) {
                            if (typeof self.getStateFromStore === 'function') {
                                result = self.getStateFromStore();
                                fetched = true;
                            }
                        }
                    } else if (typeof item === 'object') {
                        if (typeof item.initialState === 'function') {
                            if (typeof result !== 'object') {
                                result = {};
                            }
                            _assign(result, item.initialState.call(self, item.store));
                        }
                    }
                });
                return result;
            },
            componentDidMount: function () {
                var self = this;
                _forEach(mixinArgs, function (item) {
                    if (item instanceof Store) {
                        item.on('change', _onSimpleStoreChange, {
                            store: item,
                            context: self
                        });
                    } else if (typeof item === 'object') {
                        if (item.store) {
                            item.store.on('change', _onCustomStoreChange, {
                                config: _assign({}, item),
                                context: self
                            });
                        }
                    }
                });
            },
            componentWillUnmount: function () {
                _forEach(mixinArgs, function (item) {
                    if (item instanceof Store) {
                        item.off('change', _onSimpleStoreChange);
                    } else if (typeof item === 'object' && item.store) {
                        item.store.off('change', _onCustomStoreChange);
                    }
                });
            }
        }
    };
    var _onSimpleStoreChange = function (changes) {
        var context = this.context;
        if (typeof context.getStateFromStore === 'function') {
            context.setState(
                context.getStateFromStore(changes, this.store)
            );
        } else {
            if (console && console.warn) {
                console.warn(
                    'WatchStoreMixin: method `getStateFromStore` is not found in target component',
                    context
                );
            }
        }
    };
    var _onCustomStoreChange = function (changes) {
        var context = this.context;
        var config = this.config;
        var state;
        if (typeof config.change === 'function') {
            state = config.change.call(context, changes, config.store);
        }
        if (typeof state === 'object') {
            context.setState(state);
        }
    };
    return WatchStoreMixin;
};

module.exports = WatchStoreMixinFactory;