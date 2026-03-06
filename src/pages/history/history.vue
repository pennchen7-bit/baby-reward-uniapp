<template>
  <view class="container">
    <view class="header">
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
      <view v-else-if="records.length === 0" class="empty">暂无历史记录</view>
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

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 50%, #dbeafe 100%);
  padding: calc(32rpx + env(safe-area-inset-top)) 32rpx 200rpx 32rpx;
}

.header {
  text-align: center;
  margin-bottom: 32rpx;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8rpx;
}

.subtitle {
  display: block;
  font-size: 26rpx;
  color: #6b7280;
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
  height: calc(100vh - 400rpx);
}

.loading, .empty {
  text-align: center;
  padding: 80rpx 20rpx;
  color: #9ca3af;
  font-size: 28rpx;
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
