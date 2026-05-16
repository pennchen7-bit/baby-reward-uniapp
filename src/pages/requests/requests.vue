<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="title">📋 审批记录</text>
      <text class="subtitle">{{ pendingCount }} 个待处理</text>
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

    <!-- 记录列表 -->
    <scroll-view class="list" scroll-y>
      <view v-if="filteredRequests.length === 0" class="empty-state">
        <text class="empty-emoji">📭</text>
        <text class="empty-text">暂无{{ filters.find(f => f.value === currentFilter)?.label }}</text>
      </view>

      <view v-for="req in filteredRequests" :key="req.id" class="record-card">
        <!-- 卡片头部 -->
        <view class="card-header">
          <view class="avatar" :class="req.status">
            <text class="avatar-text">{{ req.babyName ? req.babyName.charAt(0) : '宝' }}</text>
          </view>
          <view class="header-info">
            <text class="baby-name">{{ req.babyName || '宝宝' }}</text>
            <text class="apply-time">{{ formatTime(req.createdAt) }}</text>
          </view>
          <view class="status-tag" :class="req.status">
            <text class="status-text">{{ statusText(req.status) }}</text>
          </view>
        </view>

        <!-- 理由 -->
        <view v-if="req.reason" class="reason-box">
          <text class="reason-label">理由</text>
          <text class="reason-content">{{ req.reason }}</text>
        </view>

        <!-- 待处理：显示操作按钮 -->
        <view v-if="req.status === 'pending'" class="action-buttons">
          <button class="btn btn-reject" @click="handleApprove(req, false)">拒绝</button>
          <button class="btn btn-approve" @click="handleApprove(req, true)">批准</button>
        </view>

        <!-- 已处理：显示处理人和原因 -->
        <view v-else class="processed-info">
          <view class="processor-row">
            <text class="processor-icon">👤</text>
            <text class="processor-text">
              {{ req.status === 'completed' ? '完成' : '审批' }}人：{{ req.approvedByName || '系统' }}
            </text>
            <text class="processed-time">{{ formatTime(req.approvedAt || req.processedAt) }}</text>
          </view>

        </view>
      </view>
    </scroll-view>

    <!-- 审批弹窗 -->
    <view v-if="showApproval" class="modal-overlay" @click="showApproval = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-icon">{{ pendingAction === 'approve' ? '✅' : '❌' }}</text>
          <text class="modal-title">{{ pendingAction === 'approve' ? '批准申请' : '拒绝申请' }}</text>
        </view>
        
        <view class="modal-applicant">
          <text class="applicant-name">{{ activeRequest?.babyName || '宝宝' }}</text>
          <text class="applicant-time">申请于 {{ activeRequest?.createdAt ? formatTime(activeRequest.createdAt) : '-' }}</text>
        </view>
        
        <view class="modal-reason-section">
          <text class="modal-reason-label">理由（选填）</text>
          <textarea 
            class="modal-textarea" 
            v-model="approvalReason"
            placeholder="写下理由..."
            maxlength="100"
          />
        </view>
        
        <view class="modal-actions">
          <button class="btn-modal btn-cancel" @click="showApproval = false">取消</button>
          <button 
            class="btn-modal" 
            :class="pendingAction === 'approve' ? 'btn-confirm-approve' : 'btn-confirm-reject'"
            @click="submitApproval"
          >确认{{ pendingAction === 'approve' ? '批准' : '拒绝' }}</button>
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
        { value: 'pending', label: '待处理', count: 0 },
        { value: 'approved', label: '已批准', count: 0 },
        { value: 'rejected', label: '已拒绝', count: 0 },
        { value: 'completed', label: '已完成', count: 0 },
      ],
      showApproval: false,
      activeRequest: null,
      pendingAction: 'approve',
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
      if (this.currentFilter === 'all') return this.allRequests;
      return this.allRequests.filter(r => r.status === this.currentFilter);
    },
  },
  
  onLoad() {
    this.userInfo = uni.getStorageSync('user_info');
    this.fetchRequests();
    this.pollInterval = setInterval(() => this.fetchRequests(), 5000);
  },
  
  onUnload() {
    if (this.pollInterval) clearInterval(this.pollInterval);
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
        const userInfo = uni.getStorageSync('user_info');
        const familyId = userInfo?.familyId;
        
        if (!familyId) {
          // 游客或未设置家庭，不提示错误，只清空列表
          this.allRequests = [];
          return;
        }
        
        const res = await requests.list({ familyId });
        this.allRequests = Array.isArray(res.requests) ? res.requests : [];
        
        this.filters.forEach(filter => {
          filter.count = this.allRequests.filter(r => r.status === filter.value).length;
        });
      } catch (err) {
        console.error('Fetch requests error:', err);
      }
    },
    
    handleApprove(req, approve) {
      this.activeRequest = req;
      this.pendingAction = approve ? 'approve' : 'reject';
      this.approvalReason = '';
      this.showApproval = true;
    },
    
    async submitApproval() {
      if (!this.userInfo) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
      try {
        const status = this.pendingAction === 'approve' ? 'approved' : 'rejected';
        await requests.approve(this.activeRequest.id, {
          status,
          approvedBy: this.userInfo.id,
          approvedByName: this.userInfo.username,
          reason: this.approvalReason?.trim() || undefined,
        });
        
        uni.showToast({
          title: this.pendingAction === 'approve' ? '✅ 已批准' : '❌ 已拒绝',
          icon: 'success',
        });
        
        this.showApproval = false;
        this.approvalReason = '';
        this.fetchRequests();
      } catch (err) {
        uni.showToast({ title: err.message || '操作失败', icon: 'none' });
      }
    },
    
    statusText(status) {
      const map = { pending: '待处理', approved: '已批准', rejected: '已拒绝', completed: '已完成' };
      return map[status] || status;
    },
    
    formatTime(timeStr) {
      if (!timeStr) return '-';
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

.filter-section {
  padding: 0;
  flex-shrink: 0;
}

.filter-list {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-radius: 20rpx;
  padding: 12rpx;
  display: flex;
  gap: 8rpx;
}

.filter-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16rpx;
  padding: 14rpx 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  transition: all 0.25s;
}

.filter-item.active {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.filter-label {
  font-size: 24rpx;
  color: #6b7280;
  font-weight: 500;
}

.filter-item.active .filter-label {
  color: #1f2937;
  font-weight: 600;
}

.filter-count {
  background: #f3f4f6;
  padding: 2rpx 12rpx;
  border-radius: 10rpx;
  font-size: 22rpx;
  color: #9ca3af;
  font-weight: 600;
  min-width: 36rpx;
  text-align: center;
}

.filter-item.active .filter-count {
  background: linear-gradient(135deg, #f0abfc 0%, #818cf8 100%);
  color: #ffffff;
}

.list {
  flex: 1;
  padding: 20rpx 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.empty-state {
  text-align: center;
  padding: 120rpx 40rpx;
}

.empty-emoji {
  display: block;
  font-size: 96rpx;
  margin-bottom: 24rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.record-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar.pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.avatar.approved {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.avatar.rejected {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.avatar.completed {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.avatar-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #374151;
}

.header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.baby-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
}

.apply-time {
  font-size: 22rpx;
  color: #9ca3af;
}

.status-tag {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  flex-shrink: 0;
}

.status-tag.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-tag.approved {
  background: #d1fae5;
  color: #059669;
}

.status-tag.rejected {
  background: #fee2e2;
  color: #dc2626;
}

.status-tag.completed {
  background: #dbeafe;
  color: #2563eb;
}

.reason-box {
  background: #f9fafb;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 16rpx;
}

.reason-label {
  display: block;
  font-size: 20rpx;
  color: #9ca3af;
  margin-bottom: 6rpx;
}

.reason-content {
  font-size: 26rpx;
  color: #374151;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
}

.btn {
  flex: 1;
  height: 76rpx;
  border-radius: 38rpx;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  margin: 0;
}

.btn-reject {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-approve {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(34, 197, 94, 0.25);
}

.processed-info {
  background: #f9fafb;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-top: 8rpx;
}

.processor-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.processor-icon {
  font-size: 24rpx;
}

.processor-text {
  flex: 1;
  font-size: 24rpx;
  color: #374151;
}

.processed-time {
  font-size: 22rpx;
  color: #9ca3af;
}

.result-reason {
  display: flex;
  gap: 8rpx;
  padding-top: 8rpx;
  border-top: 1rpx solid #e5e7eb;
}

.result-label {
  font-size: 22rpx;
  color: #9ca3af;
  flex-shrink: 0;
}

.result-content {
  font-size: 24rpx;
  color: #374151;
  line-height: 1.4;
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
  border-radius: 28rpx;
  padding: 32rpx;
  width: 100%;
  max-width: 600rpx;
}

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

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1f2937;
}

.modal-applicant {
  background: #f9fafb;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
  text-align: center;
}

.applicant-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4rpx;
}

.applicant-time {
  font-size: 22rpx;
  color: #9ca3af;
}

.modal-reason-section {
  margin-bottom: 24rpx;
}

.modal-reason-label {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
  margin-bottom: 12rpx;
}

.modal-textarea {
  width: 100%;
  min-height: 160rpx;
  background: #f9fafb;
  border: 2rpx solid #e5e7eb;
  border-radius: 16rpx;
  padding: 16rpx;
  font-size: 28rpx;
  color: #1f2937;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 12rpx;
}

.btn-modal {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
  margin: 0;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-confirm-approve {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(34, 197, 94, 0.25);
}

.btn-confirm-reject {
  background: #ef4444;
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(239, 68, 68, 0.25);
}
</style>
