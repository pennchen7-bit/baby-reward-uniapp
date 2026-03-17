import './app.css'
import { isLoggedIn, canAccessPage } from './utils/auth';

App({
  onLaunch: function () {
    console.log('App Launch');
    this.globalData = {};
    
    // 检查登录状态和权限
    this.checkGlobalAuth();
  },
  
  globalData: {
    userInfo: null
  },
  
  /**
   * 全局权限验证
   */
  checkGlobalAuth: function () {
    const userInfo = uni.getStorageSync('user_info');
    
    if (userInfo && userInfo.id) {
      console.log('用户已登录:', userInfo.username, '角色:', userInfo.role);
      this.globalData.userInfo = userInfo;
    } else {
      console.log('用户未登录');
      this.globalData.userInfo = null;
    }
  },
  
  /**
   * 页面切换时验证权限
   */
  validatePageAccess: function (pagePath) {
    // 登录页不需要验证
    if (pagePath === '/pages/login/login') {
      return true;
    }
    
    // 检查是否登录
    if (!isLoggedIn()) {
      console.log('未登录，跳转到登录页');
      uni.reLaunch({
        url: '/pages/login/login',
      });
      return false;
    }
    
    // 检查页面权限
    if (!canAccessPage(pagePath)) {
      const role = uni.getStorageSync('user_info')?.role;
      console.log('无权访问页面:', pagePath, '角色:', role);
      
      uni.showToast({
        title: '无权访问此页面',
        icon: 'none',
        duration: 2000,
      });
      
      // 跳转到首页
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/index/index',
        });
      }, 1500);
      
      return false;
    }
    
    return true;
  }
});
