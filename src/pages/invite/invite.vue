<template>
  <view class="container">
    <!-- 头部导航 -->
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">{{ isInvitee ? '加入家庭' : '邀请家人' }}</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 被邀请人：显示邀请信息 -->
    <view v-if="isInvitee" class="invitee-container">
      <!-- 邀请卡片 -->
      <view class="invite-card">
        <view class="card-header">
          <text class="card-icon">🎉</text>
          <text class="card-title">邀请你加入</text>
        </view>
        
        <!-- 加载状态 -->
        <view v-if="loading" class="loading-state">
          <text class="loading-text">正在加载邀请信息...</text>
        </view>
        
        <!-- 邀请详情 -->
        <view v-else-if="inviteData" class="invite-details">
          <!-- 家庭信息 -->
          <view class="detail-section">
            <view class="detail-label">🏠 加入的家庭</view>
            <view class="detail-value highlight">{{ inviteData.familyName }}</view>
          </view>
          
          <!-- 分隔线 -->
          <view class="divider"></view>
          
          <!-- 邀请角色 -->
          <view class="detail-section">
            <view class="detail-label">🎯 你的角色</view>
            <view class="detail-value">
              <view class="role-tag" :class="inviteData.role">
                <text class="role-icon">{{ inviteData.role === 'parent' ? '👨‍👩‍👧' : '👶' }}</text>
                <text class="role-text">{{ inviteData.role === 'parent' ? '家长' : '宝宝' }}</text>
              </view>
            </view>
          </view>
          
          <!-- 分隔线 -->
          <view class="divider"></view>
          
          <!-- 邀请人 -->
          <view class="detail-section">
            <view class="detail-label">👤 邀请人</view>
            <view class="detail-value">{{ inviteData.inviterName || '家庭成员' }}</view>
          </view>
          
          <!-- 分隔线 -->
          <view class="divider"></view>
          
          <!-- 家庭码 -->
          <view class="detail-section">
            <view class="detail-label">🔑 家庭码</view>
            <view class="family-code-display">{{ inviteData.familyCode }}</view>
          </view>
        </view>
        
        <!-- 错误状态 -->
        <view v-else-if="loadError" class="error-state">
          <text class="error-icon">❌</text>
          <text class="error-text">{{ loadError }}</text>
        </view>
      </view>
      
      <!-- 确认加入按钮 -->
      <view class="action-section">
        <button 
          class="btn-join"
          :class="{ 'btn-disabled': joining || !inviteData }"
          :disabled="joining || !inviteData"
          @click="handleJoin"
        >
          <text class="btn-icon">{{ joining ? '⏳' : '✅' }}</text>
          <text class="btn-text">{{ joining ? '加入中...' : '确认加入' }}</text>
        </button>
      </view>
      
      <!-- 说明区域 -->
      <view class="info-section">
        <view class="info-card">
          <view class="info-header">
            <text class="info-icon">💡</text>
            <text class="info-title">温馨提示</text>
          </view>
          <view class="info-list">
            <view class="info-item">
              <text class="info-dot">•</text>
              <text class="info-text">点击"确认加入"后自动加入该家庭</text>
            </view>
            <view class="info-item">
              <text class="info-dot">•</text>
              <text class="info-text">如果未登录，将跳转到登录页</text>
            </view>
            <view class="info-item">
              <text class="info-dot">•</text>
              <text class="info-text">加入后可在"家庭成员"页面查看其他成员</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 管理员：显示生成邀请界面 -->
    <view v-else-if="familyCode" class="inviter-container">
      <!-- 家庭信息卡片 -->
      <view class="family-card">
        <view class="family-header">
          <text class="family-icon">🏠</text>
          <text class="family-title">你的家庭</text>
        </view>
        <view class="family-name-display">{{ familyName }}</view>
        <view class="family-code-wrapper">
          <text class="code-label">家庭码</text>
          <text class="code-value">{{ familyCode }}</text>
        </view>
      </view>

      <!-- 选择角色 -->
      <view class="role-section">
        <text class="section-title">邀请他作为</text>
        
        <view class="role-options">
          <view 
            class="role-option" 
            :class="{ active: role === 'parent' }"
            @click="role = 'parent'"
          >
            <view class="role-option-content">
              <text class="role-icon">👨‍👩‍👧</text>
              <text class="role-name">家长</text>
              <text class="role-desc">审批和管理权限</text>
            </view>
            <view class="role-check" v-if="role === 'parent'">✓</view>
          </view>
          
          <view 
            class="role-option" 
            :class="{ active: role === 'baby' }"
            @click="role = 'baby'"
          >
            <view class="role-option-content">
              <text class="role-icon">👶</text>
              <text class="role-name">宝宝</text>
              <text class="role-desc">抽奖和查看历史</text>
            </view>
            <view class="role-check" v-if="role === 'baby'">✓</view>
          </view>
        </view>
      </view>

      <!-- 生成邀请 -->
      <view class="action-section">
        <button 
          class="btn-generate"
          :class="{ 'btn-disabled': generating }"
          :disabled="generating"
          @click="handleGenerate"
        >
          <text class="btn-icon">{{ generating ? '⏳' : '✨' }}</text>
          <text class="btn-text">{{ generating ? '生成中...' : '生成邀请链接' }}</text>
        </button>
      </view>

      <!-- 邀请结果 -->
      <view v-if="inviteLink" class="invite-result">
        <view class="result-card">
          <view class="result-header">
            <text class="result-icon">✅</text>
            <text class="result-title">邀请链接已生成</text>
          </view>
          
          <view class="result-info">
            <text class="result-desc">分享给微信好友，邀请 TA 加入</text>
          </view>
          
          <!-- 分享按钮：使用 open-type 触发小程序分享面板 -->
          <button class="btn-share" open-type="share">
            <text class="share-icon">📤</text>
            <text class="share-text">选择好友分享</text>
          </button>
        </view>
        
        <!-- 使用说明 -->
        <view class="guide-section">
          <view class="guide-header">
            <text class="guide-icon">📖</text>
            <text class="guide-title">使用说明</text>
          </view>
          <view class="guide-list">
            <view class="guide-item">
              <view class="guide-step">1</view>
              <text class="guide-text">点击"选择好友分享"发送邀请</text>
            </view>
            <view class="guide-item">
              <view class="guide-step">2</view>
              <text class="guide-text">对方点击卡片后查看邀请详情</text>
            </view>
            <view class="guide-item">
              <view class="guide-step">3</view>
              <text class="guide-text">确认加入后自动加入你的家庭</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<!-- 全局样式：确保页面可以滚动 -->
<style>
page {
  height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>

<script>
import { invite } from '@/api/index';
import { checkAuth, isLoggedIn } from '@/utils/auth';

export default {
  data() {
    return {
      // 邀请方数据
      familyName: '',
      familyCode: '',
      role: 'parent',
      generating: false,
      inviteLink: '',
      displayLink: '',
      
      // 被邀请方数据
      isInvitee: false,
      inviteCode: '',
      inviteRole: 'parent',
      joining: false,
      
      // 邀请详情
      loading: false,
      loadError: '',
      inviteData: null,
    };
  },
  
  onLoad(options) {
    console.log('Invite page loaded, options:', options);
    
    // 检查是否有邀请码参数（被邀请人）
    if (options && options.code) {
      this.isInvitee = true;
      this.inviteCode = options.code;
      this.inviteRole = options.role || 'parent';
      
      // 自动检查是否已加入该家庭
      this.checkAlreadyJoined();
      
      // 加载邀请详情
      this.loadInviteDetails();
    } else {
      // 管理员：显示生成邀请界面（需要权限验证）
      if (!checkAuth('/pages/invite/invite', (role) => {
        uni.showToast({
          title: '仅管理员和家长可访问',
          icon: 'none',
        });
      })) {
        return;
      }
      
      this.isInvitee = false;
      const user = uni.getStorageSync('user_info');
      if (user) {
        this.familyName = user.familyName || '';
        this.familyCode = user.familyCode || '';
      }
    }
  },
  
  // 小程序分享配置
  onShareAppMessage() {
    if (this.familyCode) {
      return {
        title: `📧 邀请你加入${this.familyName}`,
        path: `/pages/invite/invite?code=${this.familyCode}&role=${this.role}`,
        imageUrl: '',
      };
    }
    return {
      title: `📧 邀请加入${this.familyName}`,
      path: '/pages/index/index',
    };
  },
  
  // 分享到朋友圈
  onShareTimeline() {
    if (this.familyCode) {
      return {
        title: `📧 邀请加入${this.familyName}`,
        query: `code=${this.familyCode}&role=${this.role}`,
      };
    }
    return {
      title: `📧 邀请加入`,
    };
  },
  
  methods: {
    goBack() {
      uni.navigateBack();
    },
    
    // 检查是否已加入该家庭
    async checkAlreadyJoined() {
      const userInfo = uni.getStorageSync('user_info');
      
      if (userInfo && userInfo.id) {
        // 已登录，检查是否已在目标家庭
        try {
          // 验证邀请码获取家庭信息
          const res = await invite.verify(this.inviteCode);
          
          if (res.success && res.family) {
            // 检查当前用户是否已在该家庭
            if (userInfo.familyId === res.family.id) {
              // 已在该家庭，直接跳转到首页
              uni.showToast({
                title: '你已在这个家庭中',
                icon: 'success',
                duration: 1500,
              });
              
              setTimeout(() => {
                uni.reLaunch({
                  url: '/pages/index/index',
                });
              }, 1500);
              
              return true;
            }
          }
        } catch (err) {
          console.error('Check joined error:', err);
        }
      }
      
      return false;
    },
    
    // 加载邀请详情
    async loadInviteDetails() {
      this.loading = true;
      this.loadError = '';
      
      try {
        const res = await invite.verify(this.inviteCode);
        
        if (res.success) {
          this.inviteData = {
            familyName: res.family.name,
            familyCode: res.family.familyCode,
            role: this.inviteRole,
            inviterName: '家庭成员', // 后端可以返回具体邀请人
          };
        } else {
          this.loadError = res.error || '邀请码无效';
        }
      } catch (err) {
        console.error('Load invite details error:', err);
        this.loadError = '加载失败，请检查网络';
      } finally {
        this.loading = false;
      }
    },

    async handleGenerate() {
      this.generating = true;
      
      try {
        const res = await invite.generate({ role: this.role });
        this.familyCode = res.familyCode;
        this.familyName = res.familyName;
        this.inviteLink = res.invitePath || `/pages/invite/invite?code=${res.familyCode}`;
        this.displayLink = `家庭码：${res.familyCode} | 角色：${this.role === 'parent' ? '家长' : '宝宝'}`;
        
        uni.showToast({
          title: '生成成功，请选择分享好友',
          icon: 'success',
          duration: 1500,
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
    
    // 被邀请人：确认加入
    async handleJoin() {
      if (!this.inviteCode || !this.inviteData) {
        uni.showToast({ title: '邀请码无效', icon: 'none' });
        return;
      }
      
      this.joining = true;
      
      try {
        const userInfo = uni.getStorageSync('user_info');
        
        if (userInfo && userInfo.wechatOpenid) {
          const res = await invite.join(this.inviteCode, {
            wechatOpenid: userInfo.wechatOpenid,
            username: userInfo.username,
          });
          
          if (res.success) {
            uni.setStorageSync('user_info', res.user);
            
            uni.showToast({
              title: '✅ 加入成功',
              icon: 'success',
              duration: 2000,
            });
            
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/index/index' });
            }, 2000);
          }
        } else {
          uni.setStorageSync('invite_code', this.inviteCode);
          uni.setStorageSync('invite_role', this.inviteRole);
          
          uni.showToast({
            title: '请先登录',
            icon: 'none',
            duration: 1500,
          });
          
          setTimeout(() => {
            uni.navigateTo({ url: '/pages/login/login' });
          }, 1500);
        }
      } catch (err) {
        console.error('Join error:', err);
        uni.showToast({
          title: err.message || '加入失败',
          icon: 'none',
          duration: 3000,
        });
      } finally {
        this.joining = false;
      }
    },
    

  },
};
</script>

<style scoped>
/* 容器 */
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0abfc 0%, #818cf8 50%, #60a5fa 100%);
  padding-top: calc(88rpx + env(safe-area-inset-top));
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
}

/* 导航栏 */
.nav-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 64rpx;
  color: #ffffff;
  line-height: 1;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #ffffff;
}

.nav-placeholder {
  width: 60rpx;
}

/* 被邀请人容器 */
.invitee-container {
  padding: 32rpx;
}

/* 邀请卡片 */
.invite-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 40rpx;
}

.card-icon {
  font-size: 56rpx;
}

.card-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1f2937;
}

/* 加载/错误状态 */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #6b7280;
  margin-top: 20rpx;
}

.error-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.error-text {
  font-size: 28rpx;
  color: #ef4444;
}

/* 邀请详情 */
.invite-details {
  display: flex;
  flex-direction: column;
}

.detail-section {
  padding: 24rpx 0;
}

.detail-label {
  font-size: 24rpx;
  color: #6b7280;
  margin-bottom: 12rpx;
}

.detail-value {
  font-size: 30rpx;
  color: #1f2937;
  font-weight: 500;
}

.detail-value.highlight {
  font-size: 36rpx;
  font-weight: bold;
  color: #7c3aed;
}

.divider {
  height: 1rpx;
  background: linear-gradient(to right, transparent, #e5e7eb, transparent);
  margin: 8rpx 0;
}

/* 角色标签 */
.role-tag {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 24rpx;
  border-radius: 24rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.role-tag.parent {
  background: linear-gradient(135deg, #dcfce7 0%, #86efac 100%);
  color: #166534;
}

.role-tag.baby {
  background: linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%);
  color: #9d174d;
}

.role-icon {
  font-size: 32rpx;
}

/* 家庭码显示 */
.family-code-display {
  font-family: monospace;
  font-size: 40rpx;
  font-weight: bold;
  color: #7c3aed;
  letter-spacing: 8rpx;
  background: linear-gradient(135deg, #f0abfc 0%, #818cf8 100%);
  padding: 16rpx 32rpx;
  border-radius: 20rpx;
  display: inline-block;
}

/* 确认按钮区域 */
.action-section {
  margin-bottom: 32rpx;
}

.btn-join, .btn-generate {
  width: 100%;
  height: 100rpx;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  font-size: 34rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

.btn-join {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
}

.btn-generate {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: #ffffff;
}

.btn-disabled {
  opacity: 0.6;
}

.btn-icon {
  font-size: 40rpx;
}

/* 说明区域 */
.info-section {
  margin-top: 24rpx;
}

.info-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10rpx);
  border-radius: 24rpx;
  padding: 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.info-icon {
  font-size: 32rpx;
}

.info-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.info-dot {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}

.info-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

/* 邀请方容器 */
.inviter-container {
  padding: 32rpx;
}

/* 家庭卡片 */
.family-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 32rpx;
  text-align: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.family-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.family-icon {
  font-size: 40rpx;
}

.family-title {
  font-size: 28rpx;
  color: #6b7280;
}

.family-name-display {
  font-size: 40rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 24rpx;
}

.family-code-wrapper {
  display: inline-block;
  background: linear-gradient(135deg, #f0abfc 0%, #818cf8 100%);
  padding: 16rpx 40rpx;
  border-radius: 24rpx;
}

.code-label {
  display: block;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8rpx;
}

.code-value {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  letter-spacing: 6rpx;
}

/* 角色选择区域 */
.role-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  margin-bottom: 32rpx;
}

.role-options {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.role-option {
  position: relative;
  background: rgba(255, 255, 255, 0.6);
  border: 3rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s;
}

.role-option.active {
  background: rgba(255, 255, 255, 0.95);
  border-color: #f0abfc;
  box-shadow: 0 4rpx 16rpx rgba(240, 171, 252, 0.3);
}

.role-option-content {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.role-icon {
  font-size: 56rpx;
}

.role-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}

.role-desc {
  font-size: 24rpx;
  color: #6b7280;
  margin-left: 16rpx;
}

.role-check {
  font-size: 40rpx;
  color: #10b981;
  font-weight: bold;
}

/* 邀请结果 */
.invite-result {
  margin-top: 24rpx;
}

.result-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.result-icon {
  font-size: 48rpx;
}

.result-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #059669;
}

.result-info {
  text-align: center;
  margin-bottom: 32rpx;
}

.result-desc {
  font-size: 26rpx;
  color: #6b7280;
}

.btn-share {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(16, 185, 129, 0.3);
}

.share-icon {
  font-size: 40rpx;
}

/* 使用说明 */
.guide-section {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10rpx);
  border-radius: 24rpx;
  padding: 32rpx;
  padding-bottom: 48rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  margin-bottom: 40rpx;
}

.guide-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.guide-icon {
  font-size: 32rpx;
}

.guide-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
}

.guide-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.guide-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.guide-step {
  width: 40rpx;
  height: 40rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  color: #ffffff;
  flex-shrink: 0;
}

.guide-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  padding-top: 4rpx;
}
</style>
