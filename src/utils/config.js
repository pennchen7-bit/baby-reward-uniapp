/**
 * 应用配置
 */

// 后端 API 地址 - 生产环境
export const API_BASE_URL = 'https://baby-reward.clovey.site/api';

// 开发环境（本地测试时用）
// export const API_BASE_URL = 'http://localhost:3000/api';

// 小程序配置
export const MP_CONFIG = {
  // 微信小程序 AppID（在微信公众平台获取）
  appId: '',
  
  // 是否启用 Mock 数据（开发时可用）
  useMock: false,
};

// 本地存储 key
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'user_info',
  LAST_FAMILY_ID: 'last_family_id',
};

export default {
  API_BASE_URL,
  MP_CONFIG,
  STORAGE_KEYS,
};
