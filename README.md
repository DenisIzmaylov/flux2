#Flux2

Installation
------------
1. Run ```npm install DenisIzmaylov/flux2 --save```

Usage
-----

#####actions.js#####
```javascript
var Dispatcher = require('flux2').Dispatcher;

module.exports = {
  test: function () {
    Dispatcher.dispatch('setTestState', {a: 1});
  }
};
```

#####store.js#####
```javascript
var Flux2 = require('flux2');

module.exports = Flux2.createStore({
  getInitialState: function () {
    return {
      a: 'test'
    };
  },
  init: function () {
    Dispatcher.register('setTestState', this._onSetState, this);
    console.log('Store created.');
  },

  _onSetState: function (changes) {
    this.setState(changes);
  }
};
```

#####component.jsx#####
```javascript
var React = require('react');
var testStore = require('./store.js');

var getStateFromStore = function () {
  return {
    a: testStore.state.a
  }
};  

module.exports = React.createClass({displayName: 'testComponent',
  getInitialState: function () {
    return getStateFromStore();
  },
  render: function () {
    return (
      <div>{this.state.a}</div>
    );
  },
  componentWillMount: function () {
    testStore.on('change', this._onStoreChange);
  },
  componentWillUnmount: function () {
    testStore.off('change', this._onStoreChange);
  },
  
  _onStoreChange: function () {
    this.setState(getStateFromStore());
  }
});
```
