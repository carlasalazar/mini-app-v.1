Page({
  onLoad() {
    // Redirect to the home page after 2.5 seconds
    setTimeout(() => {
      my.redirectTo({ url: '/pages/tikitoka/tikitoka' });
    }, 2500);
  }
});
