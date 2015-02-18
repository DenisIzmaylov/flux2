'use strict';
var React = require('react');
var Flux2 = require('../..');
Flux2.Dispatcher.debugLog = true;
var Root = require('./components/root');

React.render(
    React.createElement(Root, null),
    document.getElementById('root')
);