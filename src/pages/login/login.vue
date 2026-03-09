<template>
  <view class="container">
    <!-- 头部标题区 -->
    <view class="header">
      <text class="title">🎁 宝宝奖励计划</text>
      <text class="subtitle">记录成长，奖励进步</text>
    </view>

    <!-- 主要内容区 -->
    <view class="content">
      <!-- 微信登录按钮 -->
      <view class="login-box">
        <button 
          class="btn-wechat"
          :disabled="!canLogin || logging"
          @click="handleWechatLogin"
        >
          <view class="btn-content">
            <text class="btn-icon">💬</text>
            <text class="btn-text">{{ logging ? '登录中...' : '微信一键登录' }}</text>
          </view>
        </button>

        <text class="btn-desc">
          <text v-if="!canLogin">正在初始化...</text>
          <text v-else-if="logging">请稍候，正在登录...</text>
          <text v-else>首次登录自动创建家庭 · 邀请家人共同成长</text>
        </text>
      </view>

      <!-- 错误提示 -->
      <view v-if="error" class="error-box">
        <text class="error-text">{{ error }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { auth } from '@/api/index';

export default {
  data() {
    return {
      logging: false,
      canLogin: false,
      error: '',
    };
  },
  
  onReady() {
    // 页面加载完成后启用登录按钮
    setTimeout(() => {
      this.canLogin = true;
    }, 500);
  },
  
  methods: {
    async handleWechatLogin() {
      this.logging = true;
      this.error = '';
      
      try {
        const { code } = await uni.login({ provider: 'weixin' });
        
        const inviteCode = uni.getStorageSync('invite_code') || '';
        const inviteRole = uni.getStorageSync('invite_role') || '';
        
        const res = await auth.wechatLogin({
          code,
          familyCode: inviteCode || undefined,
          role: inviteRole || undefined,
        });
        
        uni.removeStorageSync('invite_code');
        uni.removeStorageSync('invite_role');
        uni.setStorageSync('user_info', res.user);
        
        if (res.isNewUser) {
          if (res.family) {
            uni.setStorageSync('family_code', res.family.familyCode);
            uni.showToast({
              title: `🎉 创建成功！家庭码：${res.family.familyCode}`,
              icon: 'none',
              duration: 3000,
            });
          } else {
            uni.showToast({
              title: '✅ 加入家庭成功',
              icon: 'success',
              duration: 2000,
            });
          }
        }
        
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/index/index',
          });
        }, 2000);
        
      } catch (err) {
        console.error('Wechat login error:', err);
        this.error = err.message || '登录失败，请重试';
        uni.showToast({
          title: this.error,
          icon: 'none',
          duration: 3000,
        });
      } finally {
        this.logging = false;
      }
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0abfc 0%, #818cf8 50%, #60a5fa 100%);
  /* 关键：顶部留出足够空间，避免被导航栏遮挡 */
  padding-top: calc(100rpx + env(safe-area-inset-top));
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
}

/* 头部 */
.header {
  text-align: center;
  margin-bottom: 80rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 12rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  display: block;
}

/* 内容区 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 登录按钮区域 */
.login-box {
  width: 100%;
  max-width: 520rpx;
  margin: 0 auto;
}

/* 微信登录按钮 */
.btn-wechat {
  width: 100%;
  height: 96rpx;
  background: #ffffff;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 32rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  margin-bottom: 16rpx;
}

.btn-wechat:active {
  transform: scale(0.97);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
}

.btn-wechat:disabled {
  opacity: 0.8;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon {
  font-size: 40rpx;
  margin-right: 12rpx;
}

.btn-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #07c160;
}

.btn-desc {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 12rpx;
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 16rpx;
}

.loading-text {
  display: inline-block;
  font-size: 24rpx;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
  padding: 10rpx 24rpx;
  border-radius: 20rpx;
  backdrop-filter: blur(10rpx);
}

/* 错误提示 */
.error-box {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 14rpx;
  padding: 16rpx 28rpx;
  margin-top: 16rpx;
  width: 100%;
  max-width: 520rpx;
  margin-left: auto;
  margin-right: auto;
}

.error-text {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #ef4444;
}
</style>
