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
          uni.navigateTo({ url: '/pages/login/login' });
          reject(new Error('未授权'));
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
  return request({
    url,
    method: 'DELETE',
    data,
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
