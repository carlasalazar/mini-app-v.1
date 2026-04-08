Page({
  onLoad() {
    // Redirect to the home page after 2.5 seconds
    setTimeout(() => {
      my.switchTab({
        url: '/pages/tikitoka/tikitoka'
      });
    }, 2500);
  }
});
