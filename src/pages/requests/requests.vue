<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <!-- 返回按钮 -->
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      
      <text class="title">🔔 审批请求</text>
      <text class="subtitle">{{ pendingCount }} 个待批准</text>
    </view>

    <!-- 筛选 -->
    <view class="filter-section">
      <view class="filter-list">
        <view 
          v-for="item in filters" 
          :key="item.value"
          class="filter-item"
          :class="{ active: currentFilter === item.value }"
          @click="handleFilter(item.value)"
        >
          <text class="filter-label">{{ item.label }}</text>
          <text class="filter-count">{{ item.count }}</text>
        </view>
      </view>
    </view>

    <!-- 请求列表 -->
    <scroll-view class="list" scroll-y>
      <!-- 空状态 -->
      <view v-if="filteredRequests.length === 0" class="empty-state">
        <text class="empty-emoji">📭</text>
        <text class="empty-text">暂无{{ filters.find(f => f.value === currentFilter)?.label }}</text>
      </view>

      <!-- 请求卡片 -->
      <view v-for="req in filteredRequests" :key="req.id" class="request-card">
        <view class="request-header">
          <view class="request-badge" :class="req.status">{{ req.status === 'approved' ? '✅' : req.status === 'rejected' ? '❌' : '🔔' }}</view>
          <view class="request-info">
            <text class="request-name">{{ req.babyName || '宝宝' }} 申请抽奖</text>
            <text class="request-time">{{ formatTime(req.createdAt) }}</text>
          </view>
        </view>
        
        <view v-if="req.reason" class="request-reason">
          <text class="reason-label">申请原因：</text>
          <text class="reason-text">{{ req.reason }}</text>
        </view>
        
        <view v-if="req.status === 'pending'" class="request-actions">
          <button class="btn-action reject" @click="handleApprove(req, false)">拒绝</button>
          <button class="btn-action approve" @click="handleApprove(req, true)">批准</button>
        </view>
        
        <view v-else class="request-status">
          <text class="status-badge" :class="req.status">{{ req.status === 'approved' ? '已批准' : req.status === 'rejected' ? '已拒绝' : '已完成' }}</text>
          <text v-if="req.approvedByName" class="status-processor">审批人：{{ req.approvedByName }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 审批弹窗 -->
    <view v-if="showApproval" class="modal-overlay" @click="showApproval = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-icon">📝</text>
          <text class="modal-title">审批抽奖申请</text>
        </view>
        
        <view class="modal-info">
          <text class="info-label">申请人</text>
          <text class="info-value">{{ activeRequest?.babyName || '宝宝' }}</text>
        </view>
        
        <view class="modal-info">
          <text class="info-label">申请时间</text>
          <text class="info-value">{{ activeRequest?.createdAt ? formatTime(activeRequest.createdAt) : '-' }}</text>
        </view>
        
        <textarea 
          class="modal-textarea" 
          v-model="approvalReason"
          placeholder="请填写审批原因（可选）"
          maxlength="200"
        />
        
        <view class="modal-actions">
          <button class="btn-modal cancel" @click="showApproval = false">取消</button>
          <button class="btn-modal reject" @click="submitApproval(false)">拒绝</button>
          <button class="btn-modal approve" @click="submitApproval(true)">批准</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { requests } from '@/api/index';

export default {
  data() {
    return {
      allRequests: [],
      currentFilter: 'pending',
      filters: [
        { value: 'pending', label: '待批准', count: 0 },
        { value: 'approved', label: '已批准', count: 0 },
        { value: 'rejected', label: '已拒绝', count: 0 },
        { value: 'completed', label: '已完成', count: 0 },
      ],
      showApproval: false,
      activeRequest: null,
      approvalReason: '',
      userInfo: null,
      pollInterval: null,
    };
  },
  
  computed: {
    pendingCount() {
      return this.allRequests.filter(r => r.status === 'pending').length;
    },
    
    filteredRequests() {
      if (this.currentFilter === 'all') {
        return this.allRequests;
      }
      return this.allRequests.filter(r => r.status === this.currentFilter);
    },
  },
  
  onLoad() {
    this.userInfo = uni.getStorageSync('user_info');
    this.fetchRequests();
    
    // 轮询更新
    this.pollInterval = setInterval(() => {
      this.fetchRequests();
    }, 5000);
  },
  
  onUnload() {
    // 清除轮询定时器
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  },
  
  methods: {
    goBack() {
      uni.navigateBack();
    },
    handleFilter(value) {
      this.currentFilter = value;
    },
    
    async fetchRequests() {
      try {
        const res = await requests.list({
          familyId: this.userInfo?.familyId,
        });
        
        this.allRequests = res.requests || [];
        
        // 更新筛选计数
        this.filters.forEach(filter => {
          filter.count = this.allRequests.filter(r => r.status === filter.value).length;
        });
      } catch (err) {
        console.error('Fetch requests error:', err);
      }
    },
    
    handleApprove(req, approve) {
      this.activeRequest = req;
      this.showApproval = true;
      this.approvalReason = '';
    },
    
    async submitApproval(approve) {
      if (!this.approvalReason.trim()) {
        uni.showToast({
          title: '请填写原因',
          icon: 'none',
        });
        return;
      }
      
      try {
        await requests.approve(this.activeRequest.id, {
          status: approve ? 'approved' : 'rejected',
          approvedBy: this.userInfo.id,
          approvedByName: this.userInfo.username,
          reason: this.approvalReason.trim(),
        });
        
        uni.showToast({
          title: approve ? '✅ 已批准' : '已拒绝',
          icon: 'success',
        });
        
        this.showApproval = false;
        this.approvalReason = '';
        this.fetchRequests();
      } catch (err) {
        uni.showToast({
          title: err.message || '操作失败',
          icon: 'none',
        });
      }
    },
    
    statusText(status) {
      const map = {
        pending: '待批准',
        approved: '已批准',
        rejected: '已拒绝',
        completed: '已完成',
      };
      return map[status] || status;
    },
    
    formatTime(timeStr) {
      const date = new Date(timeStr);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
      
      return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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
  padding-top: max(100rpx, env(safe-area-inset-top));
  padding-bottom: max(40rpx, env(safe-area-inset-bottom));
  padding-left: 32rpx;
  padding-right: 32rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* 头部 */
.header {
  position: relative;
  text-align: center;
  padding: 20rpx 40rpx;
  flex-shrink: 0;
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

/* 筛选区域 */
.filter-section {
  padding: 0 32rpx;
  flex-shrink: 0;
}

.filter-list {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  border-radius: 20rpx;
  padding: 16rpx;
  display: flex;
  gap: 12rpx;
  overflow-x: auto;
}

.filter-item {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16rpx;
  padding: 12rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  transition: all 0.3s;
}

.filter-item.active {
  background: linear-gradient(135deg, #f0abfc 0%, #818cf8 100%);
  box-shadow: 0 4rpx 12rpx rgba(240, 171, 252, 0.3);
}

.filter-label {
  font-size: 24rpx;
  color: #4b5563;
  font-weight: 500;
}

.filter-item.active .filter-label {
  color: #ffffff;
}

.filter-count {
  background: rgba(0, 0, 0, 0.08);
  padding: 4rpx 10rpx;
  border-radius: 10rpx;
  font-size: 20rpx;
  color: #6b7280;
}

.filter-item.active .filter-count {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* 列表 */
.list {
  height: calc(100vh - 380rpx);
  padding: 16rpx 32rpx;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  box-sizing: border-box;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 100rpx 40rpx;
}

.empty-emoji {
  display: block;
  font-size: 100rpx;
  margin-bottom: 24rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* 请求卡片 */
.request-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  width: 100%;
  box-sizing: border-box;
}

.request-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.request-icon {
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

.request-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.request-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
}

.request-time {
  font-size: 22rpx;
  color: #9ca3af;
}

.request-actions {
  display: flex;
  gap: 12rpx;
  margin-top: 8rpx;
}

.btn-approve, .btn-reject {
  flex: 1;
  height: 72rpx;
  border-radius: 36rpx;
  font-size: 26rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-approve {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
}

.btn-reject {
  background: rgba(255, 255, 255, 0.8);
  color: #ef4444;
  border: 2rpx solid #ef4444;
}

.request-status {
  background: rgba(255, 255, 255, 0.6);
  padding: 16rpx;
  border-radius: 12rpx;
}

.status-text {
  font-size: 24rpx;
  color: #6b7280;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40rpx;
}

.modal-content {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  width: 100%;
  max-width: 600rpx;
}

.modal-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #1f2937;
  text-align: center;
  margin-bottom: 8rpx;
}

.modal-subtitle {
  display: block;
  font-size: 28rpx;
  color: #6b7280;
  text-align: center;
  margin-bottom: 24rpx;
}

.modal-textarea {
  width: 100%;
  height: 200rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 26rpx;
  margin-bottom: 24rpx;
}

.modal-actions {
  display: flex;
  gap: 12rpx;
}

.btn-cancel, .btn-approve-modal, .btn-reject-modal {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.btn-cancel {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-approve-modal {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
}

.btn-reject-modal {
  background: #ef4444;
  color: #ffffff;
}
</style>

/* 优化的卡片样式 */
.request-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.request-badge {
  width: 72rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  flex-shrink: 0;
}

.request-reason {
  background: rgba(243, 244, 246, 0.8);
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.reason-label {
  font-size: 22rpx;
  color: #6b7280;
  display: block;
  margin-bottom: 8rpx;
}

.reason-text {
  font-size: 26rpx;
  color: #374151;
  line-height: 1.5;
}

.request-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
}

.btn-action {
  flex: 1;
  height: 72rpx;
  border-radius: 36rpx;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  margin: 0;
}

.btn-action.approve {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(34, 197, 94, 0.3);
}

.btn-action.reject {
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge {
  display: inline-block;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.status-badge.approved {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-badge.rejected {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-badge.completed {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-processor {
  display: block;
  font-size: 22rpx;
  color: #9ca3af;
  margin-top: 8rpx;
}

/* 优化的弹窗样式 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.modal-icon {
  font-size: 48rpx;
}

.modal-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f3f4f6;
}

.info-label {
  font-size: 26rpx;
  color: #6b7280;
}

.info-value {
  font-size: 26rpx;
  color: #1f2937;
  font-weight: 500;
}

.modal-textarea {
  width: 100%;
  min-height: 160rpx;
  background: #f9fafb;
  border: 2rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 26rpx;
  color: #1f2937;
  margin: 20rpx 0;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 12rpx;
  margin-top: 24rpx;
}

.btn-modal {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  margin: 0;
}

.btn-modal.cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-modal.reject {
  background: #fee2e2;
  color: #dc2626;
}

.btn-modal.approve {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(34, 197, 94, 0.3);
}
