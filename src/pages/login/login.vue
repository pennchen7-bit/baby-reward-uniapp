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
          :disabled="logging"
          @click="handleWechatLogin"
        >
          <view class="btn-content">
            <text class="btn-icon">💬</text>
            <text class="btn-text">微信一键登录</text>
          </view>
        </button>

        <text class="btn-desc">首次登录自动创建家庭 · 邀请家人共同成长</text>

        <!-- 加载状态 -->
        <view v-if="logging" class="loading">
          <text class="loading-text">登录中...</text>
        </view>
      </view>

      <!-- 错误提示 -->
      <view v-if="error" class="error-box">
        <text class="error-text">{{ error }}</text>
      </view>
    </view>

    <!-- 底部功能说明 -->
    <view class="footer">
      <view class="feature-list">
        <view class="feature-item">
          <text class="feature-icon">✨</text>
          <text class="feature-text">微信授权，无需注册</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🏠</text>
          <text class="feature-text">自动创建家庭</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">👨‍👩‍👧‍👦</text>
          <text class="feature-text">邀请家人加入</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🎰</text>
          <text class="feature-text">抽奖激励成长</text>
        </view>
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
      error: '',
    };
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
  padding-top: calc(40rpx + env(safe-area-inset-top));
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
}

/* 头部 */
.header {
  text-align: center;
  margin-bottom: 60rpx;
}

.title {
  font-size: 44rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 12rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  display: block;
}

/* 内容区 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 登录按钮区域 */
.login-box {
  width: 100%;
  max-width: 560rpx;
}

/* 微信登录按钮 */
.btn-wechat {
  width: 100%;
  height: 100rpx;
  background: #ffffff;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  margin-bottom: 20rpx;
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
  font-size: 44rpx;
  margin-right: 16rpx;
}

.btn-text {
  font-size: 34rpx;
  font-weight: 600;
  color: #07c160;
}

.btn-desc {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 16rpx;
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 20rpx;
}

.loading-text {
  display: inline-block;
  font-size: 26rpx;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
  padding: 12rpx 28rpx;
  border-radius: 24rpx;
  backdrop-filter: blur(10rpx);
}

/* 错误提示 */
.error-box {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16rpx;
  padding: 20rpx 32rpx;
  margin-top: 24rpx;
  width: 100%;
  max-width: 560rpx;
}

.error-text {
  display: block;
  text-align: center;
  font-size: 26rpx;
  color: #ef4444;
}

/* 底部功能说明 */
.footer {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20rpx);
  border-radius: 32rpx;
  padding: 32rpx;
  margin-top: auto;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.feature-item {
  width: 48%;
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  padding: 16rpx;
}

.feature-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.feature-text {
  font-size: 24rpx;
  color: #ffffff;
  flex: 1;
}
</style>
