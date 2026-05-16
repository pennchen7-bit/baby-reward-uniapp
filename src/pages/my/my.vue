<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="title">我的</text>
      <text class="placeholder"></text>
    </view>

    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="avatar" :style="userInfo?.avatarUrl ? '' : 'background: #f3e8ff'">
        <image v-if="userInfo?.avatarUrl" :src="userInfo.avatarUrl" mode="aspectFill" class="avatar-img" />
        <text v-else class="avatar-text">{{ userInfo?.username?.charAt(0) || '👤' }}</text>
      </view>
      <view class="user-info">
        <text class="username">{{ userInfo?.username || '游客' }}</text>
        <text class="user-role">
          {{ userInfo?.role === 'admin' ? '👑 管理员' : userInfo?.role === 'parent' ? '👨‍👩‍👧 家长' : userInfo?.role === 'baby' ? '👶 宝宝' : userInfo ? '👤 用户' : '请先登录' }}
        </text>
      </view>
    </view>

    <!-- 家庭信息（仅家长/管理员可见） -->
    <view v-if="isLoggedIn && !isBaby" class="section-card" @click="goToFamily">
      <view class="section-left">
        <text class="section-icon">🏠</text>
        <view class="section-info">
          <text class="section-title">{{ hasFamily ? '我的家庭' : '添加家庭' }}</text>
          <text v-if="hasFamily" class="section-desc">{{ familyName }}</text>
          <text v-else class="section-desc">{{ userInfo ? '创建您的第一个家庭' : '登录后创建家庭' }}</text>
        </view>
      </view>
      <text class="section-arrow">›</text>
    </view>

    <!-- 设置区域 -->
    <view class="settings-section">
      <view class="settings-title">设置</view>
      
      <view class="setting-item" @click="goToAbout">
        <text class="setting-icon">ℹ️</text>
        <text class="setting-text">关于宝宝计划</text>
        <text class="setting-arrow">›</text>
      </view>

      <view v-if="isLoggedIn" class="setting-item" @click="handleLogout">
        <text class="setting-icon">🚪</text>
        <text class="setting-text logout">退出登录</text>
        <text class="setting-arrow">›</text>
      </view>

      <view v-else class="setting-item" @click="doWechatLogin">
        <text class="setting-icon">🔑</text>
        <text class="setting-text">微信一键登录</text>
        <text class="setting-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script>
import { auth } from '@/api/index';

export default {
  data() {
    return {
      userInfo: null,
    };
  },

  computed: {
    isLoggedIn() {
      const info = uni.getStorageSync('user_info');
      return info && info.id;
    },
    isBaby() {
      const info = uni.getStorageSync('user_info');
      return info && info.role === 'baby';
    },
    hasFamily() {
      const info = uni.getStorageSync('user_info');
      return info && info.familyId;
    },
    familyName() {
      return uni.getStorageSync('family_info')?.name || '';
    },
  },

  onShow() {
    this.loadUserInfo();
  },
  
  onPullDownRefresh() {
    this.loadUserInfo();
    uni.stopPullDownRefresh();
  },

  methods: {
    loadUserInfo() {
      const info = uni.getStorageSync('user_info');
      this.userInfo = info && info.id ? info : null;
    },

    goBack() {
      uni.navigateBack();
    },

    async doWechatLogin() {
      try {
        uni.showLoading({ title: '登录中...' });
        
        const { code } = await uni.login({ provider: 'weixin' });
        
        // 获取微信用户信息
        const getUserProfile = () => {
          return new Promise((resolve, reject) => {
            uni.getUserProfile({
              desc: '用于完善用户资料',
              success: (res) => {
                resolve(res);
              },
              fail: (err) => {
                console.error('getUserProfile failed:', err);
                reject(err);
              }
            });
          });
        };

        let userInfo = null;
        try {
          userInfo = await getUserProfile();
        } catch (e) {
          console.log('用户拒绝授权用户信息');
        }

        // 调用登录接口
        const res = await auth.wechatLogin({ code });
        
        // 如果用户提供了微信信息，更新用户名和头像
        if (userInfo && userInfo.userInfo) {
          res.user.username = userInfo.userInfo.nickName;
          res.user.avatarUrl = userInfo.userInfo.avatarUrl;
        }
        
        // 保存用户信息
        uni.setStorageSync('user_info', res.user);
        
        if (res.family) {
          uni.setStorageSync('family_code', res.family.familyCode);
          uni.setStorageSync('family_info', res.family);
        }
        
        uni.hideLoading();
        uni.showToast({ title: '登录成功', icon: 'success' });
        
        // 刷新页面数据
        this.loadUserInfo();
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/index/index' });
        }, 500);
        
      } catch (err) {
        uni.hideLoading();
        console.error('Login error:', err);
        uni.showToast({ title: err.message || '登录失败', icon: 'none' });
      }
    },

    goToFamily() {
      if (this.hasFamily) {
        // 有家庭，跳转到成员页面
        uni.navigateTo({ url: '/pages/members/members' });
      } else {
        // 没有家庭，弹出创建家庭
        this.showCreateFamilyModal();
      }
    },

    showCreateFamilyModal() {
      uni.showModal({
        title: '创建家庭',
        placeholderText: '请输入家庭名称',
        editable: true,
        success: (res) => {
          if (res.confirm && res.content) {
            const familyName = res.content.trim();
            if (familyName) {
              this.createFamily(familyName);
            }
          }
        }
      });
    },

    async createFamily(name) {
      try {
        const res = await uni.request({
          url: 'http://localhost:3000/api/families',
          method: 'POST',
          data: { name },
        });
        
        if (res.data.success) {
          const family = res.data.family;
          uni.setStorageSync('family_code', family.familyCode);
          uni.setStorageSync('family_info', family);
          
          // 更新用户信息中的 familyId
          const userInfo = uni.getStorageSync('user_info');
          userInfo.familyId = family.id;
          userInfo.role = 'admin';
          uni.setStorageSync('user_info', userInfo);
          this.userInfo = userInfo;
          
          uni.showToast({ title: '家庭创建成功', icon: 'success' });
        }
      } catch (err) {
        console.error('Create family error:', err);
        uni.showToast({ title: '创建失败', icon: 'none' });
      }
    },

    goToAbout() {
      uni.navigateTo({ url: '/pages/about/about' });
    },

    handleLogout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('user_info');
            uni.removeStorageSync('family_info');
            uni.removeStorageSync('family_code');
            uni.removeStorageSync('local_prizes');
            uni.reLaunch({ url: '/pages/index/index' });
          }
        }
      });
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
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
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

/* 未登录 */
.not-login-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;
}

.avatar-placeholder {
  width: 160rpx;
  height: 160rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.avatar-icon {
  font-size: 80rpx;
}

.welcome-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12rpx;
}

.desc-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 48rpx;
}

.btn-login {
  width: 100%;
  max-width: 520rpx;
  height: 96rpx;
  background: #ffffff;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #07c160;
  box-shadow: 0 10rpx 32rpx rgba(0, 0, 0, 0.15);
}

.btn-login::after {
  border: none;
}

/* 已登录 */
.logged-in-box {
  padding-top: 20rpx;
}

.user-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #f3e8ff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.avatar-text {
  font-size: 40rpx;
  font-weight: bold;
  color: #7c3aed;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 32rpx;
  font-weight: bold;
  color: #1e293b;
  display: block;
  margin-bottom: 8rpx;
}

.user-role {
  font-size: 24rpx;
  color: #64748b;
}

.section-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-radius: 24rpx;
  padding: 28rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.section-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.section-icon {
  font-size: 48rpx;
}

.section-info {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6rpx;
}

.section-desc {
  font-size: 24rpx;
  color: #64748b;
}

.section-arrow {
  font-size: 40rpx;
  color: #cbd5e1;
}

.settings-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 24rpx;
}

.settings-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #94a3b8;
  padding: 24rpx 32rpx 16rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  border-top: 1px solid #f1f5f9;
}

.setting-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.setting-text {
  flex: 1;
  font-size: 30rpx;
  color: #1e293b;
}

.setting-text.logout {
  color: #ef4444;
}

.setting-arrow {
  font-size: 36rpx;
  color: #cbd5e1;
}
</style>