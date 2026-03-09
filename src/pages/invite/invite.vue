<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @click="goBack"><text class="back-icon">‹</text></view>
      <text class="title">📧 邀请家人</text>
      <text class="subtitle">邀请家人加入你的家庭</text>
    </view>

    <!-- 家庭信息卡片 -->
    <view class="family-card">
      <view class="family-info">
        <text class="family-label">当前家庭</text>
        <text class="family-name">{{ familyName }}</text>
        <view class="family-code-box">
          <text class="family-code-label">家庭码</text>
          <text class="family-code-value">{{ familyCode }}</text>
        </view>
      </view>
    </view>

    <!-- 选择角色 -->
    <view class="role-section">
      <text class="section-title">选择邀请角色</text>
      
      <view class="role-options">
        <view 
          class="role-option" 
          :class="{ active: role === 'parent' }"
          @click="role = 'parent'"
        >
          <text class="role-icon">👨‍👩‍👧</text>
          <text class="role-name">家长</text>
          <text class="role-desc">可以审批和管理</text>
        </view>
        
        <view 
          class="role-option" 
          :class="{ active: role === 'baby' }"
          @click="role = 'baby'"
        >
          <text class="role-icon">👶</text>
          <text class="role-name">儿童</text>
          <text class="role-desc">可以抽奖和查看历史</text>
        </view>
      </view>
    </view>

    <!-- 生成邀请 -->
    <button 
      class="btn-generate"
      :disabled="generating"
      @click="handleGenerate"
    >
      {{ generating ? '生成中...' : '生成邀请链接' }}
    </button>

    <!-- 邀请结果 -->
    <view v-if="inviteLink" class="invite-result">
      <text class="result-title">✅ 邀请链接已生成</text>
      
      <button class="btn-share" @click="handleShare">
        <text class="share-icon">📤</text>
        <text class="share-text">分享给微信好友</text>
      </button>
      
      <view class="copy-section">
        <text class="copy-label">或复制链接</text>
        <view class="copy-box">
          <text class="copy-text">{{ inviteLink }}</text>
          <button class="btn-copy" @click="handleCopy">复制</button>
        </view>
      </view>
      
      <view class="tips">
        <text class="tips-title">💡 使用说明</text>
        <text class="tips-text">1. 点击"分享给微信好友"发送链接</text>
        <text class="tips-text">2. 对方点击链接后微信授权即可加入</text>
        <text class="tips-text">3. 链接 24 小时内有效</text>
      </view>
    </view>
  </view>
</template>

<script>
import { invite } from '@/api/index';

export default {
  data() {
    return {
      familyName: '',
      familyCode: '',
      role: 'parent',
      generating: false,
      inviteLink: '',
    };
  },
  
  onLoad() {
    const user = uni.getStorageSync('user_info');
    if (user) {
      this.familyName = user.familyName || '';
      this.familyCode = user.familyCode || '';
    }
  },
  
  methods: {
    goBack() {
      uni.navigateBack();
    },

    async handleGenerate() {
      this.generating = true;
      
      try {
        const res = await invite.generate({ role: this.role });
        this.inviteLink = res.inviteLink;
        
        uni.showToast({
          title: '生成成功',
          icon: 'success',
        });
      } catch (err) {
        uni.showToast({
          title: err.message || '生成失败',
          icon: 'none',
          duration: 3000,
        });
      } finally {
        this.generating = false;
      }
    },
    
    handleShare() {
      if (this.inviteLink) {
        uni.setClipboardData({
          data: this.inviteLink,
          success: () => {
            uni.showModal({
              title: '已复制',
              content: '邀请链接已复制，可以发送给微信好友',
              showCancel: false,
            });
          },
        });
      }
    },
    
    handleCopy() {
      if (this.inviteLink) {
        uni.setClipboardData({
          data: this.inviteLink,
          success: () => {
            uni.showToast({
              title: '已复制',
              icon: 'success',
            });
          },
        });
      }
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0abfc 0%, #818cf8 50%, #60a5fa 100%);
  padding: calc(100rpx + env(safe-area-inset-top)) 40rpx calc(40rpx + env(safe-area-inset-bottom));
}

/* 头部 */
.back-btn {
  position: absolute;
  left: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.back-icon {
  font-size: 64rpx;
  color: #ffffff;
  font-weight: 300;
  line-height: 1;
}

.back-btn:active {
  opacity: 0.7;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 8rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  display: block;
}

/* 家庭信息卡片 */
.family-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
}

.family-info {
  text-align: center;
}

.family-label {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
  margin-bottom: 8rpx;
}

.family-name {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 16rpx;
}

.family-code-box {
  display: inline-block;
  background: linear-gradient(135deg, #f0abfc 0%, #818cf8 100%);
  padding: 12rpx 28rpx;
  border-radius: 24rpx;
}

.family-code-label {
  display: block;
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 4rpx;
}

.family-code-value {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  letter-spacing: 4rpx;
}

/* 角色选择 */
.role-section {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24rpx;
  text-align: center;
}

.role-options {
  display: flex;
  gap: 20rpx;
}

.role-option {
  flex: 1;
  background: rgba(255, 255, 255, 0.6);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 20rpx;
  padding: 24rpx;
  text-align: center;
  transition: all 0.3s;
}

.role-option.active {
  background: rgba(255, 255, 255, 0.95);
  border-color: #f0abfc;
  box-shadow: 0 4rpx 16rpx rgba(240, 171, 252, 0.3);
}

.role-icon {
  display: block;
  font-size: 56rpx;
  margin-bottom: 12rpx;
}

.role-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6rpx;
}

.role-desc {
  display: block;
  font-size: 20rpx;
  color: #6b7280;
}

/* 生成按钮 */
.btn-generate {
  width: 100%;
  height: 96rpx;
  background: #ffffff;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #07c160;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.btn-generate:disabled {
  opacity: 0.7;
}

/* 邀请结果 */
.invite-result {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  border-radius: 24rpx;
  padding: 32rpx;
}

.result-title {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #059669;
  margin-bottom: 24rpx;
  text-align: center;
}

.btn-share {
  width: 100%;
  height: 96rpx;
  background: #07c160;
  color: #ffffff;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
}

.share-icon {
  font-size: 36rpx;
}

.share-text {
  display: block;
}

.copy-section {
  margin-bottom: 24rpx;
}

.copy-label {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
  margin-bottom: 12rpx;
}

.copy-box {
  display: flex;
  gap: 12rpx;
  align-items: center;
}

.copy-text {
  flex: 1;
  font-size: 22rpx;
  color: #6b7280;
  background: rgba(255, 255, 255, 0.6);
  padding: 14rpx 18rpx;
  border-radius: 12rpx;
  word-break: break-all;
}

.btn-copy {
  padding: 0 28rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.8);
  color: #374151;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 500;
  flex-shrink: 0;
}

/* 提示 */
.tips {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16rpx;
  padding: 20rpx;
}

.tips-title {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 12rpx;
}

.tips-text {
  display: block;
  font-size: 20rpx;
  color: #6b7280;
  line-height: 1.8;
}
</style>
