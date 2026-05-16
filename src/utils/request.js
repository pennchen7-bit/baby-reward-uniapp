/**
 * 统一请求封装
 */
import { API_BASE_URL } from './config';

/**
 * 封装请求
 */
export function request(options) {
  return new Promise((resolve, reject) => {
    // 从本地存储获取用户信息
    const userInfo = uni.getStorageSync('user_info') || null;

    uni.request({
      url: API_BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        // 传递用户信息到后端
        ...(userInfo ? { 
          'X-User-Id': userInfo.id,
          'X-User-Role': userInfo.role,
          'X-Family-Id': userInfo.familyId || ''
        } : {}),
        ...options.header,
      },
      timeout: options.timeout || 10000,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 未授权，清除登录状态
          uni.removeStorageSync('user_info');
          uni.removeStorageSync('family_id');
          uni.reLaunch({ url: '/pages/login/login' });
          reject(new Error('未授权'));
        } else if (res.statusCode === 403 || res.statusCode === 400) {
          // 权限或状态变化，先检查用户当前状态
          checkUserStatus().then((ok) => {
            if (!ok) {
              reject(new Error('用户状态已变化，请重新登录'));
            } else {
              reject(new Error(res.data?.error || '请求失败'));
            }
          });
        } else {
          reject(new Error(res.data?.error || '请求失败'));
        }
      },
      fail: (err) => {
        console.error('Request error:', err);
        reject(new Error('网络错误，请检查网络连接'));
      },
    });
  });
}

/**
 * 检查用户状态是否变化，变化则强制登出
 */
function checkUserStatus() {
  return new Promise((resolve) => {
    const userInfo = uni.getStorageSync('user_info');
    if (!userInfo) {
      resolve(true);
      return;
    }
    
    uni.request({
      url: API_BASE_URL + '/auth/me',
      method: 'GET',
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        if (res.statusCode === 200 && res.data?.user) {
          const serverUser = res.data.user;
          
          // 用户被删除或角色/家庭变化
          if (!serverUser || 
              serverUser.id !== userInfo.id ||
              serverUser.role !== userInfo.role ||
              serverUser.familyId !== userInfo.familyId) {
            uni.removeStorageSync('user_info');
            uni.removeStorageSync('family_id');
            uni.reLaunch({ url: '/pages/login/login' });
            resolve(false);
            return;
          }
        }
        resolve(true);
      },
      fail: () => resolve(true),
    });
  });
}

/**
 * GET 请求
 */
export function get(url, data, options = {}) {
  return request({
    url,
    method: 'GET',
    data,
    ...options,
  });
}

/**
 * POST 请求
 */
export function post(url, data, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options,
  });
}

/**
 * PUT 请求
 */
export function put(url, data, options = {}) {
  // 如果传入了 query 参数，拼接到 URL 上
  if (options.id) {
    const separator = url.includes('?') ? '&' : '?';
    url = url + separator + 'id=' + encodeURIComponent(options.id);
    delete options.id;
  }
  return request({
    url,
    method: 'PUT',
    data,
    ...options,
  });
}

/**
 * DELETE 请求
 */
export function del(url, data, options = {}) {
  // DELETE 请求需要将 data 拼接到 URL 上
  if (data && typeof data === 'object') {
    const params = Object.keys(data)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join('&');
    // 检查 URL 是否已经有 query 参数
    const separator = url.includes('?') ? '&' : '?';
    url = url + separator + params;
  }
  
  console.log('DELETE request URL:', url);
  
  return request({
    url,
    method: 'DELETE',
    ...options,
  });
}

export default {
  request,
  get,
  post,
  put,
  delete: del,
};
