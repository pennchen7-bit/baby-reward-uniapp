<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="title">关于宝宝计划</text>
      <text class="placeholder"></text>
    </view>

    <!-- 内容 -->
    <view class="content">
      <view class="logo-section">
        <view class="logo">🎁</view>
        <text class="app-name">宝宝奖励计划</text>
        <text class="version">Version 1.0.14</text>
      </view>

      <view class="info-card">
        <view class="info-row">
          <text class="info-label">产品介绍</text>
        </view>
        <view class="info-content">
          <text class="info-text">宝宝奖励计划是一款专为家长设计的奖励管理小程序，帮助家长记录宝宝的成长进步，通过积分抽奖的方式激励宝宝养成好习惯。</text>
        </view>
      </view>

      <view class="info-card">
        <view class="info-row">
          <text class="info-label">核心功能</text>
        </view>
        <view class="info-content">
          <view class="feature-item">
            <text class="feature-icon">📋</text>
            <text class="feature-text">宝宝发起抽奖申请</text>
          </view>
          <view class="feature-item">
            <text class="feature-icon">👨‍👩‍👧</text>
            <text class="feature-text">家长审批并发放奖励</text>
          </view>
          <view class="feature-item">
            <text class="feature-icon">🎰</text>
            <text class="feature-text">积分抽奖，惊喜不断</text>
          </view>
          <view class="feature-item">
            <text class="feature-icon">📊</text>
            <text class="feature-text">记录成长每一步</text>
          </view>
        </view>
      </view>

      <view class="footer">
        <text class="footer-text">让奖励成为宝宝成长的动力</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    goBack() {
      uni.navigateBack();
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0abfc 0%, #818cf8 50%, #60a5fa 100%);
  padding-top: calc(100rpx + env(safe-area-inset-top));
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: 60rpx;
}

/* 头部 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 60rpx;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 48rpx;
  color: #ffffff;
  font-weight: bold;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.placeholder {
  width: 60rpx;
}

/* 内容 */
.content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0;
}

.logo {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.app-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.version {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.info-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.info-row {
  padding: 24rpx 32rpx 16rpx;
  border-bottom: 1px solid #f1f5f9;
}

.info-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #64748b;
}

.info-content {
  padding: 20rpx 32rpx 24rpx;
}

.info-text {
  font-size: 28rpx;
  color: #475569;
  line-height: 1.6;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx 0;
}

.feature-icon {
  font-size: 32rpx;
}

.feature-text {
  font-size: 28rpx;
  color: #475569;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 14rpx 0;
}

.step-num {
  width: 40rpx;
  height: 40rpx;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: #ffffff;
  border-radius: 50%;
  font-size: 22rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-text {
  font-size: 28rpx;
  color: #475569;
  line-height: 1.5;
  padding-top: 4rpx;
}

.footer {
  text-align: center;
  padding: 40rpx 0;
}

.footer-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}
</style>