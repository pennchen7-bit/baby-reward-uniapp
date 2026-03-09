<template>
  <view class="container">
    <view class="header">
      <text class="title">🔔 审批请求</text>
      <text class="subtitle">{{ pendingCount }} 个待批准</text>
    </view>

    <!-- 筛选 -->
    <view class="filter">
      <view 
        v-for="item in filters" 
        :key="item.value"
        class="filter-item"
        :class="{ active: currentFilter === item.value }"
        @click="currentFilter = item.value"
      >
        {{ item.label }} ({{ item.count }})
      </view>
    </view>

    <!-- 请求列表 -->
    <scroll-view class="list" scroll-y>
      <view v-for="req in filteredRequests" :key="req.id" class="request-card">
        <view class="request-header">
          <text class="baby-name">👶 {{ req.babyName }}</text>
          <text class="status-badge" :class="req.status">
            {{ statusText(req.status) }}
          </text>
        </view>
        <text class="request-time">{{ formatTime(req.createdAt) }}</text>
        
        <view v-if="req.status === 'pending'" class="request-actions">
          <button class="btn-approve" @click="handleApprove(req, true)">✅ 批准</button>
          <button class="btn-reject" @click="handleApprove(req, false)">❌ 拒绝</button>
        </view>
        
        <view v-else class="request-reason">
          <text class="reason-label">原因：</text>
          <text class="reason-text">{{ req.reason || '-' }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 审批弹窗 -->
    <view v-if="showApproval" class="modal-overlay" @click="showApproval = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">审批请求</text>
        <textarea 
          class="modal-textarea" 
          v-model="approvalReason"
          placeholder="请填写原因（必填）"
        />
        <view class="modal-actions">
          <button class="btn-cancel" @click="showApproval = false">取消</button>
          <button class="btn-approve" @click="submitApproval(true)">批准</button>
          <button class="btn-reject" @click="submitApproval(false)">拒绝</button>
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
    
    // 轮询
    setInterval(() => {
      this.fetchRequests();
    }, 3000);
  },
  
  methods: {
    async fetchRequests() {
      try {
        const res = await requests.list({
          familyId: this.userInfo.familyId
        });
        
        this.allRequests = res.records || [];
        this.updateFilterCounts();
      } catch (err) {
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    },
    
    updateFilterCounts() {
      this.filters.forEach(filter => {
        if (filter.value !== 'all') {
          filter.count = this.allRequests.filter(r => r.status === filter.value).length;
        }
      });
    },
    
    handleApprove(req, approve) {
      this.activeRequest = req;
      this.showApproval = true;
      this.approvalReason = '';
    },
    
    async submitApproval(approve) {
      if (!this.approvalReason.trim()) {
        uni.showToast({ title: '请填写原因', icon: 'none' });
        return;
      }
      
      try {
        await requests.approve(this.activeRequest.id, {
          status: approve ? 'approved' : 'rejected',
          approvedBy: this.userInfo.id,
          approvedByName: this.userInfo.username,
          reason: this.approvalReason.trim()
        });
        
        uni.showToast({
          title: approve ? '已批准' : '已拒绝',
          icon: 'success'
        });
        
        this.showApproval = false;
        this.fetchRequests();
      } catch (err) {
        uni.showToast({
          title: err.message || '操作失败',
          icon: 'none'
        });
      }
    },
    
    statusText(status) {
      const map = {
        pending: '待批准',
        approved: '已批准',
        rejected: '已拒绝',
        completed: '已完成'
      };
      return map[status] || status;
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
  background: #f9fafb;
  padding-top: calc(100rpx + env(safe-area-inset-top));
  padding-left: 32rpx;
  padding-right: 32rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
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
  color: #ea580c;
  font-weight: 600;
}

.filter {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
  overflow-x: auto;
}

.filter-item {
  padding: 12rpx 24rpx;
  background: #ffffff;
  border-radius: 28rpx;
  font-size: 24rpx;
  color: #6b7280;
  white-space: nowrap;
}

.filter-item.active {
  background: #9333ea;
  color: #ffffff;
}

.list {
  height: calc(100vh - 400rpx);
}

.request-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.baby-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
}

.status-badge {
  padding: 6rpx 16rpx;
  border-radius: 14rpx;
  font-size: 22rpx;
}

.status-badge.pending { background: #ffedd5; color: #c2410c; }
.status-badge.approved { background: #dcfce7; color: #16a34a; }
.status-badge.rejected { background: #fee2e2; color: #dc2626; }
.status-badge.completed { background: #dbeafe; color: #2563eb; }

.request-time {
  display: block;
  font-size: 22rpx;
  color: #9ca3af;
  margin-bottom: 16rpx;
}

.request-actions {
  display: flex;
  gap: 16rpx;
}

.btn-approve, .btn-reject {
  flex: 1;
  height: 64rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 600;
}

.btn-approve {
  background: #22c55e;
  color: #ffffff;
}

.btn-reject {
  background: #ef4444;
  color: #ffffff;
}

.request-reason {
  background: #f9fafb;
  padding: 16rpx;
  border-radius: 8rpx;
}

.reason-label {
  font-size: 22rpx;
  color: #6b7280;
  font-weight: 600;
}

.reason-text {
  font-size: 22rpx;
  color: #4b5563;
}

/* 弹窗样式复用首页的 */
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
}

.modal-content {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  width: 600rpx;
}

.modal-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 24rpx;
}

.modal-textarea {
  width: 100%;
  min-height: 160rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 26rpx;
  margin-bottom: 24rpx;
}

.modal-actions {
  display: flex;
  gap: 16rpx;
}

.btn-cancel, .btn-approve, .btn-reject {
  flex: 1;
  height: 72rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.btn-cancel {
  background: #e5e7eb;
  color: #374151;
}

.btn-approve {
  background: #22c55e;
  color: #ffffff;
}

.btn-reject {
  background: #ef4444;
  color: #ffffff;
}
</style>
