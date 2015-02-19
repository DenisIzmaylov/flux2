#Flux2#
Take it easy! Clean and simple to use Flux-implementation. Rethink of Flux.

Contents
--------
1. Installation
2. Usage
3. waitFor()
4. WatchStoreMixin
5. TODO


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
There is example of full component (with the store and actions module).
It contains 3 files:
- index.jsx
- actions.js
- store.js

#####index.jsx#####
```javascript
var React = require('react');
var store = require('./store.js');

var getStateFromStore = function () {
    return {
        nodes: store.state.nodes
    }
};  

module.exports = React.createClass({displayName: 'NodesList',
  getInitialState: function () {
      return getStateFromStore();
  },
  render: function () {
      return (
          <ul>{this.state.nodes.map(function (item) {
              return (
                  <li>{item}</li>
              );
          })}</ul>
      );
  },
  componentWillMount: function () {
      store.on('change', this._onStoreChange, this);
  },
  componentWillUnmount: function () {
      store.off('change', this._onStoreChange);
  },
  
  _onStoreChange: function () {
      this.setState(getStateFromStore());
  }
});
```

#####actions.js#####
```javascript
var Flux2 = require('flux2');
var Dispatcher = Flux2.Dispatcher;

module.exports = {
    fetch: function () {
        Dispatcher.dispatch('setNodesState', [
            'one',
            'two',
            'three'
        ]);
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
            nodes: []
        };
    },
    init: function () {
        Dispatcher.register('setNodesState', this._onSetState, this);
    },
    _onSetState: function (changes) {
        this.setState(changes);
    }
};
```


waitFor()
---------
Use this feature when you have to render components only when required data are loaded.

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

WatchStoreMixin
---------------
Mixin to make store watching a totally easy.

You can do it in a few lines:
```javascript
...
module.exports = React.createClass({displayName: 'MyComponent1',
    mixins: [WatchStoreMixin(myStore)],
    // follow method will call automatically when watching store is changed
    getStateFromStore: function () {
        return myStore.state;
    },
...
```

But that's not all. You can take a more control in this operation:
```javascript
module.exports = React.createClass({displayName: 'MyComponent1',
    mixins: [WatchStoreMixin({
        store: myStore,
        initialState: function (store) {
            return {
                items: myStore.state.items
            }
        },
        change: function (changes, store) {
            this.setState({
                items: store.state.items,
                lastItemsModified: Date.now()
            });
            // ...or...
            return {
                items: store.state.items,
                lastItemsModified: Date.now()
            };
        }
    )],
...
```


5. TODO
-------
- mixins (see [dispatchr](https://github.com/yahoo/dispatchr/blob/master/utils/createStore.js))
- contexts
