// Based on jQuery 3.0.0-pre
// @see https://github.com/jquery/jquery/blob/master/src/dimensions.js
/* global require, module, window */
var createStore = require('../lib/create-store');
var documentElement = window.document.documentElement;
var documentBody = window.document.body;

var getStateFromDOM = function () {
    var innerWidth = Math.max(
        documentElement.scrollWidth, documentBody.scrollWidth,
        documentElement.offsetWidth, documentBody.offsetWidth,
        documentElement.clientWidth
    );
    var innerHeight = Math.max(
        documentElement.scrollHeight, documentBody.scrollHeight,
        documentElement.offsetHeight, documentBody.offsetHeight,
        documentElement.clientHeight
    );
    var scrollLeft = window.pageXOffset || documentElement.scrollLeft;
    var scrollTop = window.pageYOffset || documentElement.scrollTop;
    return {
        width: documentElement['clientWidth'],
        height: documentElement['clientHeight'],
        scrollLeft: scrollLeft,
        scrollTop: scrollTop,
        innerWidth: innerWidth,
        innerHeight: innerHeight
    };
};

module.exports = createStore({
    getInitialState: function () {
        return getStateFromDOM();
    },
    init: function () {
        this._onWindowResizeBind = this._onWindowResize.bind(this);
        this.addEventListeners();
    },

    addEventListeners: function () {
        window.addEventListener('resize', this._onWindowResizeBind);
        window.addEventListener('scroll', this._onWindowResizeBind);
    },
    removeEventListeners: function () {
        window.removeEventListener('resize', this._onWindowResizeBind);
        window.removeEventListener('scroll', this._onWindowResizeBind);
    },
    _onWindowResize: function () {
        this.setState(getStateFromDOM());
    }
});