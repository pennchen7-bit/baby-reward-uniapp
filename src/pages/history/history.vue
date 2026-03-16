<template>
  <view class="container">
    <view class="header">
      <view class="back-btn" @click="goBack"><text class="back-icon">‹</text></view>
      <text class="title">📜 抽奖历史</text>
      <text class="subtitle">记录每一次惊喜时刻</text>
    </view>

    <!-- 筛选器 -->
    <view class="filter">
      <picker :range="years" :value="yearIndex" @change="onYearChange">
        <view class="picker">{{ years[yearIndex] }}</view>
      </picker>
      <picker :range="months" :value="monthIndex" @change="onMonthChange">
        <view class="picker">{{ months[monthIndex] }}</view>
      </picker>
    </view>

    <!-- 历史记录列表 -->
    <scroll-view class="list" scroll-y>
      <view v-if="loading" class="loading">加载中...</view>
      <view v-else-if="records.length === 0" class="empty">
        <text class="empty-emoji">📭</text>
        <text class="empty-text">暂无历史记录</text>
      </view>
      <view v-else v-for="record in records" :key="record.id" class="record-card">
        <view class="record-icon">{{ record.imageUrl || '🎁' }}</view>
        <view class="record-info">
          <text class="record-name">{{ record.prizeName }}</text>
          <text v-if="record.prizeDescription" class="record-desc">{{ record.prizeDescription }}</text>
          <text class="record-time">{{ formatTime(record.drawnAt) }}</text>
        </view>
        <view v-if="record.points > 0" class="record-points">⭐ {{ record.points }}</view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { history } from '@/api/index';

export default {
  data() {
    return {
      years: ['2024 年', '2025 年', '2026 年', '2027 年', '2028 年'],
      yearIndex: 2,
      months: ['全年', '1 月', '2 月', '3 月', '4 月', '5 月', '6 月', '7 月', '8 月', '9 月', '10 月', '11 月', '12 月'],
      monthIndex: 0,
      records: [],
      loading: false,
      userInfo: null,
    };
  },
  
  onLoad() {
    this.userInfo = uni.getStorageSync('user_info');
    this.fetchRecords();
  },
  
  methods: {
    goBack() {
      uni.navigateBack();
    },

    async fetchRecords() {
      this.loading = true;
      try {
        const year = 2024 + this.yearIndex;
        const month = this.monthIndex > 0 ? this.monthIndex : null;
        
        const res = await history.list({
          familyId: this.userInfo?.familyId,
          year: year.toString(),
          month: month ? month.toString() : undefined
        });
        
        this.records = res.records || [];
      } catch (err) {
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    onYearChange(e) {
      this.yearIndex = e.detail.value;
      this.fetchRecords();
    },
    
    onMonthChange(e) {
      this.monthIndex = e.detail.value;
      this.fetchRecords();
    },
    
    formatTime(timeStr) {
      const date = new Date(timeStr);
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
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
  padding-bottom: calc(200rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

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
  margin-bottom: 24rpx;
  padding: 20rpx 0;
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

.filter {
  display: flex;
  gap: 24rpx;
  justify-content: center;
  margin-bottom: 32rpx;
}

.picker {
  padding: 16rpx 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #4b5563;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.list {
  height: calc(100vh - 350rpx);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.loading {
  text-align: center;
  padding: 80rpx 20rpx;
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
}

.empty {
  text-align: center;
  padding: 120rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24rpx;
  margin: 40rpx 20rpx;
  backdrop-filter: blur(10rpx);
}

.empty-emoji {
  display: block;
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  display: block;
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.record-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.record-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  flex-shrink: 0;
}

.record-info {
  flex: 1;
  min-width: 0;
}

.record-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6rpx;
}

.record-desc {
  display: block;
  font-size: 22rpx;
  color: #6b7280;
  margin-bottom: 6rpx;
}

.record-time {
  display: block;
  font-size: 20rpx;
  color: #9ca3af;
}

.record-points {
  font-size: 26rpx;
  color: #eab308;
  font-weight: bold;
  flex-shrink: 0;
}
</style>

