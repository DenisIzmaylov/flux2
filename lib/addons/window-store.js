// Based on jQuery 3.0.0-pre
// @see https://github.com/jquery/jquery/blob/master/src/dimensions.js
/* global require, module, window */
var createStore = require('../create-store');
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
        var result = getStateFromDOM();
        result.watchScroll = false;
        result.watchResize = false;
        return result;
    },
    init: function () {
        this._onWindowResizeBind = this._onWindowResize.bind(this);
        this._onChange(this.state);
        this.on('change', this._onChange, this);
    },

    _onChange: function (changes) {
        if (typeof changes.watchResize !== 'undefined') {
            if (changes.watchResize) {
                window.addEventListener('resize', this._onWindowResizeBind);
            } else {
                window.removeEventListener('resize', this._onWindowResizeBind);
            }
        }
        if (typeof changes.watchScroll !== 'undefined') {
            if (changes.watchScroll) {
                window.addEventListener('scroll', this._onWindowResizeBind);
            } else {
                window.removeEventListener('scroll', this._onWindowResizeBind);
            }
        }
    },
    _onWindowResize: function () {
        this.setState(getStateFromDOM());
    }
});