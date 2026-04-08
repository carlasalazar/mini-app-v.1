App({
  globalData: {
    userInfo: null,
    navigationHistory: [],
    // You can add global state here
  },
  onLaunch(options) {
    console.log('App Launch', options);
  },
  onShow(options) {
    console.log('App Show', options);
  },
  onHide() {
    console.log('App Hide');
  },
  onError(msg) {
    console.log('App Error', msg);
  }
});
