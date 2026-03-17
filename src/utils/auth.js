/**
 * 权限验证工具
 */

// 角色权限映射：每个角色可以访问的页面
const ROLE_PERMISSIONS = {
  admin: ['index', 'history', 'requests', 'prizes', 'members', 'invite', 'reports'],
  parent: ['index', 'history', 'requests', 'prizes', 'members', 'invite', 'reports'],
  baby: ['index', 'history'], // 宝宝只能访问首页和历史记录
};

// 页面路径与权限的映射
const PAGE_PERMISSIONS = {
  '/pages/index/index': ['admin', 'parent', 'baby'],
  '/pages/history/history': ['admin', 'parent', 'baby'],
  '/pages/requests/requests': ['admin', 'parent'],
  '/pages/prizes/prizes': ['admin', 'parent'],
  '/pages/members/members': ['admin', 'parent'],
  '/pages/invite/invite': ['admin', 'parent'],
  '/pages/reports/reports': ['admin', 'parent'],
  '/pages/login/login': ['admin', 'parent', 'baby'], // 登录页所有人都可以访问
};

/**
 * 检查用户是否已登录
 */
export function isLoggedIn() {
  const userInfo = uni.getStorageSync('user_info');
  return !!userInfo && !!userInfo.id;
}

/**
 * 获取当前用户角色
 */
export function getUserRole() {
  const userInfo = uni.getStorageSync('user_info');
  return userInfo ? userInfo.role : null;
}

/**
 * 检查用户是否有权限访问指定页面
 * @param {string} pagePath - 页面路径，如 '/pages/index/index'
 * @returns {boolean} - 是否有权限
 */
export function canAccessPage(pagePath) {
  const userInfo = uni.getStorageSync('user_info');
  
  // 未登录，无权限
  if (!userInfo || !userInfo.id) {
    return false;
  }
  
  const role = userInfo.role;
  const allowedRoles = PAGE_PERMISSIONS[pagePath];
  
  // 如果页面没有配置权限，默认允许访问
  if (!allowedRoles) {
    return true;
  }
  
  return allowedRoles.includes(role);
}

/**
 * 检查用户是否有指定权限
 * @param {string} permission - 权限名称，如 'requests', 'prizes', 'members'
 * @returns {boolean} - 是否有权限
 */
export function hasPermission(permission) {
  const userInfo = uni.getStorageSync('user_info');
  
  if (!userInfo || !userInfo.id) {
    return false;
  }
  
  const role = userInfo.role;
  const allowedPermissions = ROLE_PERMISSIONS[role] || [];
  
  return allowedPermissions.includes(permission);
}

/**
 * 验证并跳转到指定页面
 * @param {string} url - 目标页面 URL
 * @returns {boolean} - 是否跳转成功
 */
export function navigateTo(url) {
  // 提取页面路径（去掉查询参数）
  const pagePath = url.split('?')[0];
  
  // 检查登录状态
  if (!isLoggedIn()) {
    uni.reLaunch({
      url: '/pages/login/login',
    });
    return false;
  }
  
  // 检查页面权限
  if (!canAccessPage(pagePath)) {
    const role = getUserRole();
    uni.showToast({
      title: `角色 (${getRoleName(role)}) 无权访问此页面`,
      icon: 'none',
      duration: 2000,
    });
    
    // 跳转到首页
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/index/index',
      });
    }, 2000);
    
    return false;
  }
  
  // 权限验证通过，正常跳转
  uni.navigateTo({ url });
  return true;
}

/**
 * 获取角色名称
 */
function getRoleName(role) {
  const roleNames = {
    admin: '管理员',
    parent: '家长',
    baby: '宝宝',
  };
  return roleNames[role] || role;
}

/**
 * 全局权限验证（在页面 onLoad 时调用）
 * @param {string} pagePath - 当前页面路径
 * @param {Function} onUnauthorized - 无权限时的回调函数
 */
export function checkAuth(pagePath, onUnauthorized) {
  // 检查登录状态
  if (!isLoggedIn()) {
    uni.reLaunch({
      url: '/pages/login/login',
    });
    return false;
  }
  
  // 检查页面权限
  if (!canAccessPage(pagePath)) {
    const role = getUserRole();
    
    if (onUnauthorized) {
      onUnauthorized(role);
    } else {
      uni.showToast({
        title: `角色 (${getRoleName(role)}) 无权访问此页面`,
        icon: 'none',
        duration: 2000,
      });
      
      // 跳转到首页
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/index/index',
        });
      }, 2000);
    }
    
    return false;
  }
  
  return true;
}

export default {
  isLoggedIn,
  getUserRole,
  canAccessPage,
  hasPermission,
  navigateTo,
  checkAuth,
};
