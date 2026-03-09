<template>
  <view class="container">
    <view class="header">
      <text class="title">📧 邀请家人</text>
      <text class="subtitle">邀请家人加入你的家庭</text>
    </view>

    <!-- 家庭信息 -->
    <view class="family-info">
      <text class="family-label">当前家庭</text>
      <text class="family-name">{{ familyName }}</text>
      <text class="family-code">家庭码：{{ familyCode }}</text>
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

    <!-- 邀请链接 -->
    <view v-if="inviteLink" class="invite-result">
      <text class="result-title">✅ 邀请链接已生成</text>
      
      <view class="share-section">
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
      role: 'parent', // 'parent' | 'baby'
      generating: false,
      inviteLink: '',
    };
  },
  
  onLoad() {
    // 获取用户信息
    const user = uni.getStorageSync('user_info');
    if (user) {
      this.familyName = user.familyName || '';
      this.familyCode = user.familyCode || '';
    }
  },
  
  methods: {
    async handleGenerate() {
      this.generating = true;
      
      try {
        const res = await invite.generate({ role: this.role });
        
        // 保存邀请链接
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
    
    // 分享给微信好友
    handleShare() {
      // 小程序分享
      uni.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline'],
      });
      
      // 或者使用小程序 URL Scheme
      if (this.inviteLink) {
        // 复制到剪贴板
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
    
    // 复制链接
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
  background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 50%, #dbeafe 100%);
  padding: calc(80rpx + env(safe-area-inset-top)) 40rpx calc(40rpx + env(safe-area-inset-bottom));
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #9333ea;
  display: block;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #6b7280;
  display: block;
}

/* 家庭信息 */
.family-info {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
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
  margin-bottom: 12rpx;
}

.family-code {
  display: block;
  font-size: 28rpx;
  color: #9333ea;
  font-weight: 500;
}

/* 角色选择 */
.role-section {
  background: #ffffff;
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
}

.role-options {
  display: flex;
  gap: 24rpx;
}

.role-option {
  flex: 1;
  background: #f9fafb;
  border: 2rpx solid #e5e7eb;
  border-radius: 20rpx;
  padding: 24rpx;
  text-align: center;
  transition: all 0.3s;
}

.role-option.active {
  background: #fef3c7;
  border-color: #f59e0b;
}

.role-icon {
  display: block;
  font-size: 64rpx;
  margin-bottom: 12rpx;
}

.role-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8rpx;
}

.role-desc {
  display: block;
  font-size: 22rpx;
  color: #6b7280;
}

/* 生成按钮 */
.btn-generate {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
  color: #ffffff;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 32rpx;
}

.btn-generate:disabled {
  background: #9ca3af;
}

/* 邀请结果 */
.invite-result {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
}

.result-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #059669;
  margin-bottom: 24rpx;
  text-align: center;
}

.share-section {
  margin-bottom: 24rpx;
}

.btn-share {
  width: 100%;
  height: 88rpx;
  background: #07c160;
  color: #ffffff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  font-size: 32rpx;
  font-weight: 600;
}

.share-icon {
  font-size: 36rpx;
}

.copy-section {
  margin-top: 24rpx;
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
  font-size: 24rpx;
  color: #6b7280;
  background: #f9fafb;
  padding: 16rpx;
  border-radius: 12rpx;
  word-break: break-all;
}

.btn-copy {
  padding: 0 32rpx;
  height: 64rpx;
  background: #f3f4f6;
  color: #374151;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 500;
}

/* 提示 */
.tips {
  background: #f9fafb;
  border-radius: 16rpx;
  padding: 24rpx;
}

.tips-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 12rpx;
}

.tips-text {
  display: block;
  font-size: 22rpx;
  color: #6b7280;
  line-height: 1.8;
}
</style>
