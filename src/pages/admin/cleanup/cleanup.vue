<template>
  <view class="container">
    <view class="header">
      <view class="back-btn" @click="goBack"><text class="back-icon">‹</text></view>
      <text class="title">⚙️ 数据管理</text>
    </view>

    <view class="section">
      <text class="section-title">⚠️ 危险操作</text>
      <text class="section-desc">清空所有测试数据，包括奖品、审批记录、抽奖历史</text>
      
      <button class="btn-danger" @click="confirmCleanup">
        🗑️ 清空所有数据
      </button>
    </view>

    <view class="section">
      <text class="section-title">📊 当前数据</text>
      <view class="stats">
        <view class="stat-item">
          <text class="stat-value">{{ stats.prizes }}</text>
          <text class="stat-label">奖品</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.requests }}</text>
          <text class="stat-label">审批记录</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.records }}</text>
          <text class="stat-label">抽奖历史</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { prizes, requests, history } from '@/api/index';

export default {
  data() {
    return {
      stats: {
        prizes: 0,
        requests: 0,
        records: 0,
      },
      userInfo: null,
    };
  },
  
  onLoad() {
    this.userInfo = uni.getStorageSync('user_info');
    this.loadStats();
  },
  
  methods: {
    async loadStats() {
      try {
        const [prizesRes, requestsRes, historyRes] = await Promise.all([
          prizes.list(this.userInfo.familyId),
          requests.list({ familyId: this.userInfo.familyId }),
          history.list({ familyId: this.userInfo.familyId, limit: 1 }),
        ]);
        
        this.stats.prizes = (prizesRes.prizes || []).length;
        this.stats.requests = (requestsRes.requests || []).length;
        this.stats.records = (historyRes.records || []).length;
      } catch (err) {
        console.error('Load stats error:', err);
      }
    },
    
    async confirmCleanup() {
      uni.showModal({
        title: '⚠️ 确认清空',
        content: '确定要清空所有数据吗？包括：\n- 所有奖品\n- 所有审批记录\n- 所有抽奖历史\n\n此操作不可恢复！',
        confirmColor: '#ef4444',
        success: async (res) => {
          if (res.confirm) {
            await this.cleanup();
          }
        }
      });
    },
    
    async cleanup() {
      uni.showLoading({ title: '清空中...' });
      
      try {
        const API_BASE_URL = 'https://baby-reward.clovey.site/api';
        
        await new Promise((resolve, reject) => {
          uni.request({
            url: `${API_BASE_URL}/admin/cleanup`,
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
              'X-User-Id': this.userInfo.id,
              'X-User-Role': this.userInfo.role,
              'X-Family-Id': this.userInfo.familyId,
            },
            success: (res) => {
              if (res.statusCode === 200 && res.data.success) {
                resolve(res.data);
              } else {
                reject(new Error(res.data?.error || '清空失败'));
              }
            },
            fail: (err) => {
              reject(new Error('网络错误'));
            }
          });
        });
        
        uni.hideLoading();
        uni.showModal({
          title: '✅ 清空成功',
          content: '所有数据已清空',
          showCancel: false,
          success: () => {
            this.loadStats();
          }
        });
      } catch (err) {
        uni.hideLoading();
        uni.showModal({
          title: '❌ 清空失败',
          content: err.message,
          showCancel: false
        });
      }
    },
    
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
  padding-left: 32rpx;
  padding-right: 32rpx;
  padding-bottom: 40rpx;
}

.header {
  position: relative;
  text-align: center;
  margin-bottom: 40rpx;
  padding: 20rpx 0;
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
  font-size: 64rpx;
  color: #ffffff;
  font-weight: 300;
  line-height: 1;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 12rpx;
}

.section-desc {
  display: block;
  font-size: 26rpx;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 24rpx;
}

.btn-danger {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(239, 68, 68, 0.3);
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-top: 24rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #9333ea;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #6b7280;
}
</style>
