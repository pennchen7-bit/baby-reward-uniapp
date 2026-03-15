/**
 * API 接口封装
 */
import { get, post, put, del } from '@/utils/request';
import { API_BASE_URL } from '@/utils/config';

/**
 * 认证相关
 */
export const auth = {
  // 获取当前用户信息
  me: () => get('/auth/me'),
  
  // 登录
  login: (data) => post('/auth/login', data),
  
  // 注册
  register: (data) => post('/auth/register', data),
  
  // 微信登录
  wechatLogin: (data) => post('/auth/wechat-login', data),
  
  // 加入家庭
  join: (data) => post('/auth/join', data),
  
  // 登出
  logout: () => post('/auth/logout'),
};

/**
 * 邀请相关
 */
export const invite = {
  // 生成邀请链接
  generate: (data) => post('/invite/generate', data),
  
  // 验证邀请码
  verify: (code) => get(`/invite/join?code=${code}`),
  
  // 加入家庭（确认）
  join: (code, data) => post(`/invite/join?code=${code}`, data),
};

/**
 * 奖品相关
 */
export const prizes = {
  // 获取奖品列表
  list: (familyId) => get('/prizes', { familyId }),
  
  // 创建奖品
  create: (data) => post('/prizes', data),
  
  // 更新奖品
  update: (data) => put('/prizes', data),
  
  // 删除奖品
  delete: (id) => del('/prizes', { id }),
};

/**
 * 抽奖请求相关
 */
export const requests = {
  // 获取请求列表
  list: (params) => get('/requests', params),
  
  // 创建抽奖请求
  create: (data) => post('/requests', data),
  
  // 审批请求
  approve: (id, data) => put(`/requests/${id}`, data),
  
  // 删除请求
  delete: (id) => del('/requests', { id }),
};

/**
 * 抽奖相关
 */
export const draw = {
  // 执行抽奖
  execute: (data) => post('/draw', data),
};

/**
 * 历史记录相关
 */
export const history = {
  // 获取历史记录
  list: (params) => get('/history', params),
};

/**
 * 家庭相关
 */
export const families = {
  // 获取家庭列表
  list: () => get('/families'),
  
  // 验证家庭码
  verify: (data) => post('/families/verify', data),
};

/**
 * 用户相关
 */
export const users = {
  // 获取用户列表
  list: () => get('/users'),
  
  // 创建用户
  create: (data) => post('/users', data),
  
  // 更新用户
  update: (id, data) => put(`/users/${id}`, data),
  
  // 删除用户
  delete: (id) => {
    return new Promise((resolve, reject) => {
      const userInfo = uni.getStorageSync('user_info');
      uni.request({
        url: API_BASE_URL + `/users/${id}`,
        method: 'DELETE',
        header: {
          'Content-Type': 'application/json',
          ...(userInfo ? { 
            'X-User-Id': userInfo.id,
            'X-User-Role': userInfo.role,
            'X-Family-Id': userInfo.familyId || ''
          } : {}),
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(res.data?.error || '删除失败'));
          }
        },
        fail: (err) => {
          console.error('Delete user error:', err);
          reject(new Error('网络错误'));
        }
      });
    });
  },
};

export default {
  auth,
  prizes,
  requests,
  draw,
  history,
  families,
  users,
};
