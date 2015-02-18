var React = require('react');
var store = require('./store');
var actions = require('./actions');

var getStateFromStore = function () {
    return store.state;
};

module.exports = React.createClass({displayName: 'Root',
    getInitialState: function () {
        return getStateFromStore();
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
    componentWillMount: function () {
        store.on('change', this._onStoreChange, this);
    },
    componentWillUnmount: function () {
        store.off('change', this._onStoreChange);
    },

    _onClick: function () {
        actions.requestTime();
    },
    _onStoreChange: function () {
        this.setState(getStateFromStore());
    }
});