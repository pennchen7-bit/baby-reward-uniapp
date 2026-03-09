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
          <view class="btn-wechat-content">
            <text class="btn-wechat-icon">💬</text>
            <view class="btn-wechat-text">
              <text class="btn-main">微信一键登录</text>
              <text class="btn-sub">首次登录自动创建家庭</text>
            </view>
          </view>
        </button>

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
      
      <text class="footer-tip">💡 点击微信登录即可开始</text>
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
  background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 50%, #dbeafe 100%);
  padding-top: calc(60rpx + env(safe-area-inset-top));
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
}

/* 头部 - 与微信右上角对齐 */
.header {
  text-align: center;
  margin-bottom: 40rpx;
  padding-top: 20rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #9333ea;
  display: block;
  margin-bottom: 12rpx;
}

.subtitle {
  font-size: 26rpx;
  color: #6b7280;
  display: block;
}

/* 内容区 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}

/* 登录按钮区域 */
.login-box {
  width: 100%;
  max-width: 600rpx;
}

/* 微信登录按钮 */
.btn-wechat {
  width: 100%;
  height: 120rpx;
  background: linear-gradient(135deg, #07c160 0%, #05a350 100%);
  color: #ffffff;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(7, 193, 96, 0.4);
  transition: all 0.3s;
  margin-bottom: 24rpx;
}

.btn-wechat:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(7, 193, 96, 0.3);
}

.btn-wechat:disabled {
  opacity: 0.7;
}

.btn-wechat-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.btn-wechat-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.btn-wechat-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.btn-main {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 6rpx;
}

.btn-sub {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 20rpx;
}

.loading-text {
  display: inline-block;
  font-size: 28rpx;
  color: #6b7280;
}

/* 错误提示 */
.error-box {
  background: #fef2f2;
  border: 1rpx solid #fecaca;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-top: 20rpx;
}

.error-text {
  display: block;
  text-align: center;
  font-size: 26rpx;
  color: #dc2626;
}

/* 底部功能说明 */
.footer {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 32rpx;
  padding: 32rpx;
  backdrop-filter: blur(10rpx);
}

.feature-list {
  margin-bottom: 24rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.feature-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.feature-text {
  font-size: 26rpx;
  color: #4b5563;
}

.footer-tip {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #9ca3af;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.1);
}
</style>
