/* global require, module */
var React = require('react');
var rootStore = require('./store');
var rootActions = require('./actions');
var windowStore = require('flux2/addons/windows-store');

var getStateFromStore = function () {
    return {
        appId: rootStore.state.appId,
        timestamp: rootStore.state.timestamp,
        window: windowStore.state
    };
};

module.exports = React.createClass({displayName: 'Root',
    getInitialState: function () {
        return getStateFromStore();
    },
    render: function () {
        return (
            <ul>
                <li>App ID: <b>{this.state.appId}</b></li>
                <li>Window: <b>{this.state.window.width}x{this.state.window.height}</b></li>
                <li>Window (inner): <b>{this.state.window.innerWidth}x{this.state.window.innerHeight}</b></li>
                <li>Window (scroll): <b>{this.state.window.scrollLeft}x{this.state.window.scrollTop}</b></li>
                <li><button onClick={this._onClick}>Request Time</button></li>
                {(typeof this.state.timestamp !== 'undefined') ?
                    [<li>Last timestamp: {this.state.timestamp}</li>] :
                    []}
            </ul>
        );
    },
    componentWillMount: function () {
        rootStore.on('change', this._onStoreChange, this);
        windowStore.on('change', this._onStoreChange, this);
    },
    componentWillUnmount: function () {
        rootStore.off('change', this._onStoreChange);
        windowStore.off('change', this._onStoreChange);
    },

    _onClick: function () {
        rootActions.requestTime();
    },
    _onStoreChange: function () {
        this.setState(getStateFromStore());
    }
});