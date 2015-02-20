2015-02-20: version 1.3.0
=========================
1. Added dispatcher factory - Flux2.createDispatcher().
2. Added unregister() method and storeWillUnregister() handler for stores.
3. You can specify custom dispatcher into store constructor.


2015-02-18: version 1.2.0
=========================
1. Created this document.
2. Add eventemitter3 and inherits instead of custom lib/utils/event-emitter and lodash.extend.
3. Add lodash-assign instead of full lodash package.
4. Remove window-store.
5. Now package contains 2 webpack configs: one to build bower package, another one - to build example.
6. Dispatcher contains new property and some methods:
  - debugLog
  - getStore()
  - getState()
  - setState()
7. New property and methods supports in stores:
  - name (to use in dispatcher)
  - storeWillMount()
  - storeDidMount()
  - storeWillUpdate()
  - storeDidUpdate()
  - setState()