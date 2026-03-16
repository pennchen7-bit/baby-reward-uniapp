<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @click="goBack"><text class="back-icon">‹</text></view>
      <text class="title">👨‍👩‍👧‍👦 家庭成员</text>
      <text class="subtitle">{{ members.length }} 人</text>
    </view>

    <!-- 家庭码卡片 -->
    <view class="family-card">
      <view class="family-card-header">
        <text class="family-label">🏠 家庭码</text>
        <button class="btn-copy" @click="copyFamilyCode">📋 复制</button>
      </view>
      <text class="family-code">{{ familyCode || '加载中...' }}</text>
    </view>

    <!-- 成员列表 -->
    <scroll-view class="member-list" scroll-y>
      <view v-for="member in members" :key="member.id" class="member-card">
        <view class="member-left">
          <view class="member-avatar">
            <text class="avatar-icon">{{ member.role === 'baby' ? '👶' : member.role === 'parent' ? '👨‍👩‍👧' : '👑' }}</text>
          </view>
          <view class="member-info">
            <text class="member-name">{{ member.username }}</text>
            <view class="member-role">
              <text v-if="member.role === 'admin'" class="role-badge admin">👑 管理员</text>
              <text v-else-if="member.role === 'parent'" class="role-badge parent">👨‍👩‍👧 家长</text>
              <text v-else-if="member.role === 'baby'" class="role-badge baby">👶 宝宝</text>
            </view>
          </view>
        </view>
        <view v-if="canManage(member)" class="member-actions">
          <view class="role-switcher">
            <button 
              class="role-btn" 
              :class="{ active: member.role === 'parent' }"
              @click="setRole(member, 'parent')"
            >家长</button>
            <button 
              class="role-btn" 
              :class="{ active: member.role === 'baby' }"
              @click="setRole(member, 'baby')"
            >宝宝</button>
          </view>
          <button class="btn-remove" @click="removeMember(member)">移除</button>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { users, families } from '@/api/index';

export default {
  data() {
    return {
      members: [],
      familyCode: '',
      userInfo: null,
    };
  },
  
  onLoad() {
    this.userInfo = uni.getStorageSync('user_info');
    if (this.userInfo) {
      this.familyCode = this.userInfo.familyCode;
      this.fetchMembers();
    }
  },
  
  methods: {
    async fetchMembers() {
      try {
        // 获取家庭所有用户
        const res = await users.list();
        this.members = res.users || [];
      } catch (err) {
        console.error('获取成员失败:', err);
        uni.showToast({ title: '加载失败', icon: 'none' });
      }
    },
    
    canManage(member) {
      // 只有管理员可以管理其他成员（不能管理自己）
      if (member.id === this.userInfo.id) return false;
      return this.userInfo.role === 'admin';
    },
    
    async setRole(member, newRole) {
      const roleNames = { admin: '管理员', parent: '家长', baby: '宝宝' };
      uni.showModal({
        title: '确认修改',
        content: `确定要将"${member.username}"设为${roleNames[newRole]}吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await users.update(member.id, { role: newRole });
              uni.showToast({ title: '修改成功', icon: 'success' });
              this.fetchMembers();
            } catch (err) {
              console.error('修改角色失败:', err);
              uni.showToast({ title: '修改失败', icon: 'none' });
            }
          }
        }
      });
    },
    
    async removeMember(member) {
      uni.showModal({
        title: '确认移除',
        content: `确定要移除"${member.username}"吗？移除后该用户将无法访问家庭数据。`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await users.delete(member.id);
              uni.showToast({ title: '移除成功', icon: 'success' });
              this.fetchMembers();
            } catch (err) {
              console.error('移除成员失败:', err);
              uni.showToast({ title: '移除失败', icon: 'none' });
            }
          }
        }
      });
    },
    
    copyFamilyCode() {
      uni.setClipboardData({
        data: this.familyCode,
        success: () => {
          uni.showToast({ title: '已复制', icon: 'success' });
        }
      });
    },
    
    goBack() {
      uni.navigateBack();
    },
  },
};
</script>

<style>
page {
  height: 100vh;
  overflow: hidden;
}
</style>

<style scoped>
.container {
  height: 100vh;
  background: linear-gradient(180deg, #f0abfc 0%, #818cf8 50%, #60a5fa 100%);
  padding-top: calc(100rpx + env(safe-area-inset-top));
  padding-left: 32rpx;
  padding-right: 32rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  max-width: 100%;
}

.header {
  position: relative;
  text-align: center;
  margin-bottom: 24rpx;
  padding: 20rpx 0;
  flex-shrink: 0;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 60rpx;
  color: #ffffff;
  line-height: 1;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.subtitle {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.family-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 32rpx;
  text-align: center;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.family-label {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
  margin-bottom: 12rpx;
}

.family-code {
  display: block;
  font-size: 56rpx;
  font-weight: bold;
  color: #9333ea;
  letter-spacing: 8rpx;
  margin-bottom: 20rpx;
}

.btn-copy {
  background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
  color: #ffffff;
  padding: 16rpx 40rpx;
  border-radius: 28rpx;
  font-size: 26rpx;
  font-weight: 600;
  border: none;
  box-shadow: 0 4rpx 16rpx rgba(147, 51, 234, 0.3);
}

.member-list {
  height: calc(100vh - 300rpx);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  border-radius: 24rpx 24rpx 0 0;
  padding: 24rpx;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  width: 100%;
  box-sizing: border-box;
}

.member-avatar {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 40rpx;
}

.member-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.member-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
}

.member-role {
  display: flex;
  gap: 8rpx;
}

.role-badge {
  padding: 6rpx 14rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.role-badge.admin { background: #ede9fe; color: #9333ea; }
.role-badge.parent { background: #dcfce7; color: #22c55e; }
.role-badge.baby { background: #fce7f3; color: #ec4899; }

.member-actions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-left: 20rpx;
  align-items: flex-end;
}

.role-switcher {
  display: flex;
  gap: 8rpx;
  background: #f3f4f6;
  padding: 6rpx;
  border-radius: 20rpx;
}

.role-btn {
  padding: 8rpx 20rpx;
  font-size: 22rpx;
  border-radius: 16rpx;
  border: none;
  background: transparent;
  color: #6b7280;
  line-height: 1;
  margin: 0;
}

.role-btn.active {
  background: #ffffff;
  color: #667eea;
  font-weight: 600;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.btn-remove {
  padding: 10rpx 24rpx;
  font-size: 24rpx;
  border-radius: 20rpx;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  font-weight: 500;
  margin: 0;
}
.btn-set-admin, .btn-set-parent, .btn-set-baby, .btn-remove {
  padding: 12rpx 20rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 600;
  height: auto;
  line-height: 1.5;
}

.btn-set-admin {
  background: #ede9fe;
  color: #9333ea;
}

.btn-set-parent {
  background: #dcfce7;
  color: #22c55e;
}

.btn-set-baby {
  background: #fce7f3;
  color: #ec4899;
}

.btn-remove {
  background: #fee2e2;
  color: #dc2626;
}
</style>
