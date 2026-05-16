import './app.css'

App({
  onLaunch: function () {
    console.log('App Launch');
    this.globalData = {};
    
    // 不自动登录，直接进入首页
    // 登录流程在"我的"页面中完成
    uni.reLaunch({ url: '/pages/index/index' });
  },
  
  globalData: {
    userInfo: null,
  },
});