var React = require('react');
var WatchStoreMixin = require('../../../..').WatchStoreMixin;
var store = require('./store');
var actions = require('./actions');
var customStore = require('./custom-store');
var customActions = require('./custom-actions');

module.exports = React.createClass({displayName: 'Root',
    mixins: [WatchStoreMixin(
        store,
        {
            store: customStore,
            initialState: function (store) {
                console.info('watchStoreMixin:customInitialState', this, store);
                return {
                    test1: true
                }
            },
            change: function (changes, store) {
                console.info('watchStoreMixin:customChange', changes, store);
                this.setState({
                    test2: JSON.stringify(store.state)
                });
                return {
                    test3: 'qwe'
                };
            }
        }
    )],
    getStateFromStore: function () {
        return store.state;
    },
    render: function () {
        return (
            <ul>
                <li>App ID: <b>{this.state.appId}</b></li>
                <li><button onClick={this._onClick}>Request Time</button></li>
                {(this.state.timestamp) ? [
                    <li key="ts">Last timestamp: {this.state.timestamp}</li>
                ] : []}
            </ul>
        );
    },

    _onClick: function () {
        actions.requestTime();
        customActions.applyCustomAction();
    }
});