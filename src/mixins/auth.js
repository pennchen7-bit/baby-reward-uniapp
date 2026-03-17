/**
 * 全局权限验证混入
 * 在每個頁面中引入，自動驗證登錄狀態和頁面權限
 */
import { checkAuth, isLoggedIn } from '@/utils/auth';

export const authMixin = {
  data() {
    return {
      // 页面路径，子类可以覆盖
      _pagePath: '',
    };
  },
  
  onLoad() {
    // 获取当前页面路径
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const route = currentPage ? `/${currentPage.route}` : '';
    
    // 如果子类没有设置_pagePath，使用自动检测的路径
    if (!this._pagePath) {
      this._pagePath = route;
    }
    
    console.log(`[${this._pagePath}] 页面加载，进行权限验证`);
    
    // 登录页不需要验证
    if (this._pagePath === '/pages/login/login') {
      return;
    }
    
    // 检查登录状态
    if (!isLoggedIn()) {
      console.log(`[${this._pagePath}] 用户未登录，跳转到登录页`);
      uni.reLaunch({
        url: '/pages/login/login',
      });
      return;
    }
    
    // 执行权限验证（子类可以覆盖 onAuthFailed 回调）
    const hasAuth = checkAuth(this._pagePath, (role) => {
      this.onAuthFailed(role);
    });
    
    if (!hasAuth) {
      return;
    }
    
    // 权限验证通过，调用子类的 onLoadAuthPassed
    if (this.onLoadAuthPassed) {
      this.onLoadAuthPassed();
    }
  },
  
  methods: {
    /**
     * 权限验证失败时的回调
     * 子类可以覆盖此方法自定义行为
     */
    onAuthFailed(role) {
      const roleNames = {
        admin: '管理员',
        parent: '家长',
        baby: '宝宝',
      };
      
      uni.showToast({
        title: `角色 (${roleNames[role] || role}) 无权访问此页面`,
        icon: 'none',
        duration: 2000,
      });
      
      // 跳转到首页
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/index/index',
        });
      }, 1500);
    },
  },
};

export default authMixin;
