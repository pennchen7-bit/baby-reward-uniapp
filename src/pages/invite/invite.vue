<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @click="goBack"><text class="back-icon">‹</text></view>
      <text class="title">{{ isInvitee ? '🎉 加入家庭' : '📧 邀请家人' }}</text>
      <text class="subtitle">{{ isInvitee ? '接受邀请加入家庭' : '邀请家人加入你的家庭' }}</text>
    </view>

    <!-- 被邀请人：显示邀请信息 -->
    <view v-if="isInvitee" class="invitee-section">
      <view class="invite-card">
        <text class="invite-title">🎁 你收到一个邀请</text>
        <view class="invite-info">
          <text class="invite-label">家庭码</text>
          <text class="invite-code">{{ inviteCode || '加载中...' }}</text>
        </view>
        <view class="invite-info">
          <text class="invite-label">邀请角色</text>
          <text class="invite-role">{{ inviteRole === 'parent' ? '👨‍👩‍👧 家长' : '👶 宝宝' }}</text>
        </view>
      </view>
      
      <button 
        class="btn-join"
        :disabled="joining"
        @click="handleJoin"
      >
        {{ joining ? '加入中...' : '✅ 确认加入' }}
      </button>
      
      <view class="tips">
        <text class="tips-title">💡 说明</text>
        <text class="tips-text">1. 点击"确认加入"后自动加入该家庭</text>
        <text class="tips-text">2. 如果未登录，将自动跳转到登录页</text>
        <text class="tips-text">3. 登录后自动加入，无需再次操作</text>
      </view>
    </view>

    <!-- 管理员：显示生成邀请界面 -->
    <view v-else-if="familyCode">
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
        
        <view class="invite-info">
          <text class="invite-info-text">{{ displayLink }}</text>
        </view>
        
        <button class="btn-share" open-type="share">
          <text class="share-icon">📤</text>
          <text class="share-text">分享给微信好友</text>
        </button>
        
        <view class="tips">
          <text class="tips-title">💡 使用说明</text>
          <text class="tips-text">1. 点击"分享给微信好友"发送小程序卡片</text>
          <text class="tips-text">2. 对方点击卡片后自动跳转到登录页</text>
          <text class="tips-text">3. 微信登录后自动加入你的家庭</text>
        </view>
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
      // 新字段
      isInvitee: false,  // 是否是被邀请人
      inviteCode: '',    // 邀请码
      inviteRole: 'parent',  // 邀请角色
      joining: false,    // 加入中
    };
  },
  
  onLoad(options) {
    console.log('Invite page loaded, options:', options);
    
    // 检查是否有邀请码参数（被邀请人）
    if (options && options.code) {
      // 被邀请人：显示接受邀请界面
      this.isInvitee = true;
      this.inviteCode = options.code;
      this.inviteRole = options.role || 'parent';
      console.log('被邀请人，code:', this.inviteCode, 'role:', this.inviteRole);
    } else {
      // 管理员：显示生成邀请界面
      this.isInvitee = false;
      const user = uni.getStorageSync('user_info');
      if (user) {
        this.familyName = user.familyName || '';
        this.familyCode = user.familyCode || '';
        console.log('管理员，familyName:', this.familyName, 'familyCode:', this.familyCode);
      }
    }
  },
  
  // 小程序分享配置（动态更新）
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

    async handleGenerate() {
      this.generating = true;
      
      try {
        const res = await invite.generate({ role: this.role });
        // 保存家庭码和名称
        this.familyCode = res.familyCode;
        this.familyName = res.familyName;
        // 保存完整的邀请链接（小程序路径）
        this.inviteLink = res.invitePath || `/pages/invite/invite?code=${res.familyCode}`;
        // 同时保存用于显示的短链接
        this.displayLink = `家庭码：${res.familyCode} | 角色：${this.role === 'parent' ? '家长' : '宝宝'}`;
        
        uni.showToast({
          title: '生成成功，请点击下方按钮分享',
          icon: 'success',
          duration: 2000,
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
      console.log('handleJoin called, inviteCode:', this.inviteCode, 'inviteRole:', this.inviteRole);
      
      if (!this.inviteCode) {
        uni.showToast({ title: '邀请码无效', icon: 'none' });
        return;
      }
      
      this.joining = true;
      
      try {
        // 检查是否已登录
        const userInfo = uni.getStorageSync('user_info');
        console.log('userInfo:', userInfo);
        
        if (userInfo && userInfo.wechatOpenid) {
          // 已登录：直接调用加入接口
          console.log('Calling invite.join with:', {
            code: this.inviteCode,
            wechatOpenid: userInfo.wechatOpenid,
            username: userInfo.username,
          });
          
          const res = await invite.join(this.inviteCode, {
            wechatOpenid: userInfo.wechatOpenid,
            username: userInfo.username,
          });
          
          console.log('Join result:', res);
          
          if (res.success) {
            // 更新本地用户信息
            uni.setStorageSync('user_info', res.user);
            
            uni.showToast({
              title: '✅ 加入成功',
              icon: 'success',
              duration: 2000,
            });
            
            // 跳转到首页
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/index/index' });
            }, 2000);
          }
        } else {
          // 未登录：跳转到登录页，带上邀请码
          console.log('Not logged in, redirect to login');
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
    
    handleShare() {
      if (this.inviteLink) {
        // 生成小程序 URL Scheme（可以打开小程序的链接）
        const urlScheme = `https://your-app-id.page.link?url=${encodeURIComponent(this.inviteLink)}`;
        
        uni.setClipboardData({
          data: `点击链接加入我的家庭：${urlScheme}\n${this.displayLink}`,
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
    
    // 分享给好友
    onShareAppMessage() {
      return {
        title: `📧 邀请你加入${this.familyName}`,
        path: `/pages/invite/invite?code=${this.familyCode}&role=${this.role}`,
        imageUrl: '', // 使用默认封面图
      };
    },
    
    // 分享到朋友圈
    onShareTimeline() {
      return {
        title: `📧 邀请加入${this.familyName}`,
        query: `code=${this.familyCode}&role=${this.role}`,
      };
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
  position: relative;
  text-align: center;
  margin-bottom: 40rpx;
  padding: 20rpx 0;
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

.invite-info {
  background: rgba(240, 171, 252, 0.15);
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
}

.invite-info-text {
  display: block;
  font-size: 26rpx;
  color: #4b5563;
  text-align: center;
  line-height: 1.8;
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
  margin-bottom: 16rpx;
}

.share-icon {
  font-size: 36rpx;
}

.share-text {
  display: block;
}

.btn-timeline {
  width: 100%;
  height: 80rpx;
  background: rgba(7, 193, 96, 0.1);
  color: #07c160;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  font-size: 28rpx;
  font-weight: 500;
  margin-bottom: 24rpx;
  border: 2rpx solid #07c160;
}

.timeline-icon {
  font-size: 32rpx;
}

.timeline-text {
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
