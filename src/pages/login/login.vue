<template>
  <view class="container">
    <!-- 顶部装饰 -->
    <view class="top-decoration">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
      <view class="circle circle-3"></view>
    </view>

    <!-- Logo 和标题 -->
    <view class="header">
      <view class="logo-box">
        <text class="logo">🎁</text>
      </view>
      <text class="title">宝宝奖励计划</text>
      <text class="subtitle">记录成长，奖励进步</text>
    </view>

    <!-- 主要内容区 -->
    <view class="content">
      <!-- 微信登录按钮 -->
      <button 
        class="btn-wechat"
        :disabled="logging"
        @click="handleWechatLogin"
      >
        <view class="btn-wechat-content">
          <text class="btn-wechat-icon">💬</text>
          <view class="btn-wechat-text">
            <text class="btn-main">微信一键登录</text>
            <text class="btn-sub">安全便捷，自动创建家庭</text>
          </view>
        </view>
      </button>

      <!-- 加载状态 -->
      <view v-if="logging" class="loading">
        <text class="loading-text">登录中...</text>
      </view>

      <!-- 错误提示 -->
      <view v-if="error" class="error-box">
        <text class="error-icon">⚠️</text>
        <text class="error-text">{{ error }}</text>
      </view>
    </view>

    <!-- 底部说明 -->
    <view class="footer">
      <view class="feature-list">
        <view class="feature-item">
          <text class="feature-icon">✨</text>
          <text class="feature-text">微信授权，无需注册</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🏠</text>
          <text class="feature-text">首次登录自动创建家庭</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">👨‍👩‍👧‍👦</text>
          <text class="feature-text">邀请家人，共同成长</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🎰</text>
          <text class="feature-text">抽奖激励，快乐成长</text>
        </view>
      </view>
      
      <text class="footer-tip">首次使用？点击微信登录即可开始</text>
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
        // 调用微信登录
        const { code } = await uni.login({ provider: 'weixin' });
        
        // 检查是否有邀请码（从 URL 参数或 storage）
        const inviteCode = uni.getStorageSync('invite_code') || '';
        const inviteRole = uni.getStorageSync('invite_role') || '';
        
        // 调用后端微信登录 API
        const res = await auth.wechatLogin({
          code,
          familyCode: inviteCode || undefined,
          role: inviteRole || undefined,
        });
        
        // 清除邀请信息
        uni.removeStorageSync('invite_code');
        uni.removeStorageSync('invite_role');
        
        // 保存用户信息
        uni.setStorageSync('user_info', res.user);
        
        // 提示
        if (res.isNewUser) {
          if (res.family) {
            // 创建了新家庭
            uni.setStorageSync('family_code', res.family.familyCode);
            uni.showToast({
              title: `🎉 创建成功！\n家庭码：${res.family.familyCode}`,
              icon: 'none',
              duration: 3000,
            });
          } else {
            // 加入了已有家庭
            uni.showToast({
              title: '✅ 加入家庭成功',
              icon: 'success',
              duration: 2000,
            });
          }
        }
        
        // 跳转到首页
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* 顶部装饰 */
.top-decoration {
  position: absolute;
  top: -100rpx;
  left: 0;
  right: 0;
  height: 300rpx;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 200rpx;
  height: 200rpx;
  top: 50rpx;
  left: 10%;
}

.circle-2 {
  width: 150rpx;
  height: 150rpx;
  top: 100rpx;
  right: 15%;
}

.circle-3 {
  width: 100rpx;
  height: 100rpx;
  top: 20rpx;
  right: 40%;
}

/* 头部 */
.header {
  padding-top: calc(120rpx + env(safe-area-inset-top));
  text-align: center;
  margin-bottom: 60rpx;
}

.logo-box {
  width: 160rpx;
  height: 160rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 32rpx;
  backdrop-filter: blur(10rpx);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 80rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 2rpx;
}

/* 内容区 */
.content {
  padding: 0 40rpx;
  margin-bottom: 60rpx;
}

/* 微信登录按钮 */
.btn-wechat {
  width: 100%;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 0;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.btn-wechat:active {
  transform: scale(0.98);
}

.btn-wechat:disabled {
  opacity: 0.7;
}

.btn-wechat-content {
  display: flex;
  align-items: center;
  padding: 36rpx 32rpx;
}

.btn-wechat-icon {
  font-size: 56rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.btn-wechat-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.btn-main {
  display: block;
  font-size: 34rpx;
  font-weight: bold;
  color: #07c160;
  margin-bottom: 8rpx;
}

.btn-sub {
  display: block;
  font-size: 24rpx;
  color: #9ca3af;
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 24rpx;
}

.loading-text {
  display: inline-block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.2);
  padding: 16rpx 32rpx;
  border-radius: 32rpx;
  backdrop-filter: blur(10rpx);
}

/* 错误提示 */
.error-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  padding: 24rpx;
  backdrop-filter: blur(10rpx);
}

.error-icon {
  font-size: 32rpx;
}

.error-text {
  font-size: 26rpx;
  color: #ffffff;
}

/* 底部 */
.footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 48rpx 48rpx 0 0;
  padding: 48rpx 40rpx calc(40rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.1);
}

.feature-list {
  margin-bottom: 32rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.feature-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.feature-text {
  font-size: 28rpx;
  color: #4b5563;
  flex: 1;
}

.footer-tip {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #9ca3af;
  padding-top: 24rpx;
  border-top: 1rpx solid #e5e7eb;
}
</style>
