<template>
  <view class="container">
    <view class="loading-box">
      <view class="spinner"></view>
      <text class="loading-text">{{ loadingText }}</text>
    </view>
  </view>
</template>

<script>
import { auth } from '@/api/index';

export default {
  data() {
    return {
      loadingText: '正在登录...',
    };
  },
  
  onLoad(options) {
    console.log('[login onLoad] options:', JSON.stringify(options));
    
    // 如果是邀请进入，跳转前先处理邀请码
    if (options.inviteCode) {
      try {
        const decodedStr = decodeURIComponent(Buffer.from(options.inviteCode, 'base64').toString('utf8'));
        const decoded = JSON.parse(decodedStr);
        uni.setStorageSync('invite_family_id', decoded.familyId || '');
        uni.setStorageSync('invite_role', decoded.role || '');
        console.log('[login] 已设置邀请信息:', decoded);
      } catch (e) {
        console.error('Decode invite code error:', e);
      }
    }
    
    // 立即执行登录（静默登录，不需要用户点击）
    this.doLogin();
  },
  
  methods: {
    async doLogin() {
      try {
        this.loadingText = '正在获取微信授权...';
        const { code } = await uni.login({ provider: 'weixin' });
        console.log('[login] 获取到 code:', code);
        
        this.loadingText = '正在验证身份...';
        const inviteFamilyId = uni.getStorageSync('invite_family_id') || '';
        const inviteRole = uni.getStorageSync('invite_role') || '';
        
        const res = await auth.wechatLogin({
          code,
          familyId: inviteFamilyId || undefined,
          role: inviteRole || undefined,
        });
        
        console.log('[login] 登录成功:', res);
        
        // 保存用户信息
        uni.setStorageSync('user_info', res.user);
        uni.removeStorageSync('guest_mode');
        
        if (res.isNewUser && res.family) {
          uni.setStorageSync('family_code', res.family.familyCode);
          uni.setStorageSync('family_info', res.family);
        }
        
        // 清除邀请缓存
        uni.removeStorageSync('invite_code');
        uni.removeStorageSync('invite_family_id');
        uni.removeStorageSync('invite_role');
        
        // 跳转到首页
        uni.reLaunch({ url: '/pages/index/index' });
        
      } catch (err) {
        console.error('[login] 登录失败:', err);
        this.loadingText = '登录失败';
        
        uni.showToast({
          title: '登录失败',
          icon: 'none',
        });
        
        // 登录失败，跳转到首页以游客模式
        setTimeout(() => {
          uni.setStorageSync('guest_mode', true);
          uni.reLaunch({ url: '/pages/index/index' });
        }, 1500);
      }
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0abfc 0%, #818cf8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 32rpx;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}
</style>