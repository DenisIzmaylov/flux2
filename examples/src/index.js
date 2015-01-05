/* global require, module */
'use strict';
var React = require('react');
var rootComponent = require('./components/root');

React.render(
    React.createElement(rootComponent, null),
    document.getElementById('root')
);