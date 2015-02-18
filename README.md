#Flux2#
Take it easy! Clean and simple Flux-implementation. Rethink of Flux.

Contents
--------
1. Installation
2. Usage
3. waitFor()


Installation
------------
Using npm:
```bash
npm install flux2 --save
```

Using bower:
```bash
bower install flux2 --save
```


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
var Dispatcher = Flux2.Dispatcher;

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

waitFor()
---------
You can use this feature when you have to render components only when required data are loaded.

#####index.js#####
```javascript
'use strict';
var Flux2 = require('flux2');
var Dispatcher = Flux2.Dispatcher;
var React = require('react');
var MainPage = require('./main-page');
var commentsStore = require('./comments-store');
var activeUsersStore = require('./active-users-store');

Dispatcher.waitFor([{
  store: commentsStore,
  ready: function (params) {
    return Array.isArray(params.comments);
  }
}, {
  store: activeUsersStore,
  ready: function (params) {
    return Array.isArray(params.users);
  }
}], function () {
  React.render(
    React.createElement(MainPage, null),
    document.body
  );
});
```
