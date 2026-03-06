<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <text class="title">🎁 宝宝奖励计划</text>
      <text class="subtitle">{{ subtitleText }}</text>
      
      <!-- 用户信息 -->
      <view v-if="userInfo" class="user-info">
        <text class="user-tag">
          👤 {{ userInfo.username }}
          <text v-if="userInfo.role === 'baby'" class="role-badge baby">宝宝</text>
          <text v-else-if="userInfo.role === 'parent'" class="role-badge parent">家长</text>
          <text v-else-if="userInfo.role === 'admin'" class="role-badge admin">管理员</text>
        </text>
        <text v-if="userInfo.familyCode" class="family-code">
          🔑 {{ userInfo.familyCode }}
        </text>
      </view>
    </view>

    <!-- 家长审批区域 -->
    <view v-if="isAdminOrParent && pendingRequests.length > 0" class="approval-section">
      <view class="section-header">
        <text class="section-title">🔔 待批准请求 ({{ pendingRequests.length }})</text>
        <text class="refresh-btn" @click="fetchPendingRequests">🔄</text>
      </view>
      
      <view v-for="req in pendingRequests" :key="req.id" class="request-card">
        <view class="request-header">
          <text class="baby-name">👶 {{ req.babyName }} 申请抽奖</text>
          <text class="request-time">{{ formatTime(req.createdAt) }}</text>
        </view>
        <view class="request-actions">
          <button class="btn-approve" @click="handleApprove(req, true)">✅ 批准</button>
          <button class="btn-reject" @click="handleApprove(req, false)">❌ 拒绝</button>
        </view>
      </view>
    </view>

    <!-- 家长审批区域（无请求时） -->
    <view v-if="isAdminOrParent && pendingRequests.length === 0" class="approval-section empty">
      <text class="empty-text">暂无待批准请求</text>
    </view>

    <!-- 宝宝抽奖区域 -->
    <view v-if="userInfo?.role === 'baby'" class="draw-section">
      <!-- 抽奖结果 -->
      <view v-if="result" class="result-card">
        <text class="result-emoji">🎉</text>
        <text class="result-title">恭喜你！</text>
        <text class="prize-emoji">{{ result.prize.imageUrl || '🏆' }}</text>
        <text class="prize-name">{{ result.prize.name }}</text>
        <text v-if="result.prize.points > 0" class="prize-points">⭐ {{ result.prize.points }} 积分</text>
      </view>

      <!-- 已批准可抽奖 -->
      <view v-else-if="requestStatus === 'approved'" class="draw-card">
        <text class="draw-emoji">✨</text>
        <text class="draw-title">家长已批准！</text>
        <text class="draw-subtitle">可以开始抽奖啦～</text>
        <button 
          class="btn-draw" 
          :disabled="isSpinning"
          @click="handleDraw"
        >
          {{ isSpinning ? '抽奖中...' : '🎰 开始抽奖' }}
        </button>
      </view>

      <!-- 等待批准 -->
      <view v-else-if="requestStatus === 'pending'" class="pending-card">
        <text class="pending-emoji">⏳</text>
        <text class="pending-title">等待家长批准</text>
        <text class="pending-subtitle">请家长打开审批页面批准你的抽奖请求</text>
        <view class="pending-actions">
          <button class="btn-cancel" @click="handleCancelRequest">取消请求</button>
          <button class="btn-refresh" @click="checkPendingRequest">刷新状态</button>
        </view>
      </view>

      <!-- 未申请 -->
      <view v-else class="draw-card">
        <text class="draw-emoji">🎰</text>
        <button class="btn-request" @click="handleRequestDraw">🙋 我要抽奖</button>
      </view>
    </view>

    <!-- 中奖历史（家长/管理员） -->
    <view v-if="isAdminOrParent" class="history-section">
      <view class="section-header">
        <text class="section-title">🏆 宝宝中奖记录</text>
        <text class="section-count">最近 {{ drawRecords.length }} 条</text>
      </view>
      
      <view v-if="drawRecords.length === 0" class="history-empty">
        <text>暂无中奖记录，快给宝宝添加奖品吧！</text>
      </view>
      
      <scroll-view v-else class="history-list" scroll-y>
        <view v-for="record in drawRecords" :key="record.id" class="history-card">
          <view class="history-icon">{{ record.imageUrl || '🎁' }}</view>
          <view class="history-info">
            <text class="history-name">{{ record.prizeName }}</text>
            <text v-if="record.prizeDescription" class="history-desc">{{ record.prizeDescription }}</text>
            <text class="history-meta">
              👶 {{ record.babyName }} · {{ formatTime(record.drawnAt) }}
            </text>
          </view>
          <view v-if="record.points > 0" class="history-points">⭐ {{ record.points }}</view>
        </view>
        
        <view v-if="hasMoreRecords" class="load-more" @click="loadMoreRecords">
          ⬇️ 加载更多（第 {{ recordsPage }} 页）
        </view>
      </scroll-view>
    </view>

    <!-- 底部导航 -->
    <view class="tabbar">
      <view class="tabbar-item" @click="goTo('/pages/history/history')">
        <text class="icon">📜</text>
        <text class="label">历史</text>
      </view>
      <view v-if="isAdminOrParent" class="tabbar-item" @click="goTo('/pages/requests/requests')">
        <text class="icon">🔔</text>
        <text class="label">审批</text>
      </view>
      <view class="tabbar-item" @click="handleLogout">
        <text class="icon">🚪</text>
        <text class="label">退出</text>
      </view>
    </view>

    <!-- 审批弹窗 -->
    <view v-if="showApproval" class="modal-overlay" @click="showApproval = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">审批请求</text>
        <text class="modal-subtitle">👶 {{ activeRequest?.babyName }} 申请抽奖</text>
        <textarea 
          class="modal-textarea" 
          v-model="approvalReason"
          placeholder="请填写原因（必填）"
          maxlength="200"
        />
        <view class="modal-actions">
          <button class="btn-modal-cancel" @click="showApproval = false">取消</button>
          <button class="btn-modal-approve" @click="handleApproveSubmit(true)">批准</button>
          <button class="btn-modal-reject" @click="handleApproveSubmit(false)">拒绝</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { auth, requests, draw, history } from '@/api/index';

export default {
  data() {
    return {
      userInfo: null,
      subtitleText: '今天表现棒棒的！',
      isSpinning: false,
      result: null,
      activeRequest: null,
      requestStatus: 'none', // none, pending, approved
      
      // 家长审批
      pendingRequests: [],
      showApproval: false,
      approvalReason: '',
      
      // 中奖历史
      drawRecords: [],
      recordsPage: 1,
      hasMoreRecords: true,
      
      // 轮询定时器
      pollTimer: null,
    };
  },
  
  computed: {
    isAdminOrParent() {
      return this.userInfo?.role === 'admin' || this.userInfo?.role === 'parent';
    },
  },
  
  onLoad() {
    this.loadUserInfo();
  },
  
  onUnload() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
  },
  
  methods: {
    loadUserInfo() {
      this.userInfo = uni.getStorageSync('user_info');
      
      if (!this.userInfo) {
        uni.reLaunch({ url: '/pages/login/login' });
        return;
      }
      
      // 设置副标题
      if (this.userInfo.role === 'baby') {
        this.subtitleText = '今天表现棒棒的！';
        this.checkPendingRequest();
        // 轮询状态
        this.pollTimer = setInterval(() => {
          this.checkPendingRequest();
        }, 3000);
      } else if (this.isAdminOrParent) {
        this.subtitleText = '记录宝宝成长的每一步';
        this.fetchPendingRequests();
        this.fetchDrawRecords();
        // 轮询请求
        this.pollTimer = setInterval(() => {
          this.fetchPendingRequests();
        }, 3000);
      } else {
        this.subtitleText = '欢迎使用';
      }
    },
    
    // 检查待批准请求（宝宝）
    async checkPendingRequest() {
      try {
        // 先查已批准的
        const approvedRes = await requests.list({
          babyId: this.userInfo.id,
          status: 'approved'
        });
        
        if (approvedRes.records && approvedRes.records.length > 0) {
          this.activeRequest = approvedRes.records[0];
          this.requestStatus = 'approved';
          return;
        }
        
        // 再查待批准的
        const pendingRes = await requests.list({
          babyId: this.userInfo.id,
          status: 'pending'
        });
        
        if (pendingRes.records && pendingRes.records.length > 0) {
          this.activeRequest = pendingRes.records[0];
          this.requestStatus = 'pending';
        }
      } catch (err) {
        console.error('Check request error:', err);
      }
    },
    
    // 获取待批准请求（家长）
    async fetchPendingRequests() {
      try {
        const res = await requests.list({
          familyId: this.userInfo.familyId,
          status: 'pending'
        });
        this.pendingRequests = res.records || [];
      } catch (err) {
        console.error('Fetch pending requests error:', err);
      }
    },
    
    // 获取中奖历史
    async fetchDrawRecords(page = 1) {
      try {
        const res = await history.list({
          familyId: this.userInfo.familyId,
          limit: '10',
          page: page.toString()
        });
        
        const records = res.records || [];
        
        if (page === 1) {
          this.drawRecords = records;
        } else {
          this.drawRecords = [...this.drawRecords, ...records];
        }
        
        this.recordsPage = page;
        this.hasMoreRecords = records.length === 10;
      } catch (err) {
        console.error('Fetch draw records error:', err);
      }
    },
    
    loadMoreRecords() {
      if (this.hasMoreRecords) {
        this.fetchDrawRecords(this.recordsPage + 1);
      }
    },
    
    // 申请抽奖
    async handleRequestDraw() {
      try {
        await requests.create({
          babyId: this.userInfo.id,
          familyId: this.userInfo.familyId
        });
        
        this.requestStatus = 'pending';
        uni.showToast({
          title: '申请成功，等待家长批准',
          icon: 'success'
        });
      } catch (err) {
        uni.showToast({
          title: err.message || '申请失败',
          icon: 'none'
        });
      }
    },
    
    // 取消申请
    async handleCancelRequest() {
      if (!this.activeRequest) return;
      
      try {
        await requests.delete(this.activeRequest.id);
        this.requestStatus = 'none';
        this.activeRequest = null;
      } catch (err) {
        uni.showToast({
          title: '取消失败',
          icon: 'none'
        });
      }
    },
    
    // 执行抽奖
    async handleDraw() {
      if (this.isSpinning || this.requestStatus !== 'approved') return;
      
      this.isSpinning = true;
      
      try {
        const res = await draw.execute({
          requestId: this.activeRequest.id
        });
        
        this.result = res;
        
        setTimeout(() => {
          this.isSpinning = false;
          this.requestStatus = 'none';
          this.activeRequest = null;
        }, 3000);
      } catch (err) {
        uni.showToast({
          title: err.message || '抽奖失败',
          icon: 'none'
        });
        this.isSpinning = false;
      }
    },
    
    // 显示审批弹窗
    handleApprove(req, approve) {
      this.activeRequest = req;
      this.showApproval = true;
      this.approvalReason = '';
    },
    
    // 提交审批
    async handleApproveSubmit(approve) {
      if (!this.approvalReason.trim()) {
        uni.showToast({
          title: '请填写原因',
          icon: 'none'
        });
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
        this.approvalReason = '';
        this.fetchPendingRequests();
      } catch (err) {
        uni.showToast({
          title: err.message || '操作失败',
          icon: 'none'
        });
      }
    },
    
    formatTime(timeStr) {
      if (!timeStr) return '';
      const date = new Date(timeStr);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      if (isToday) {
        return date.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        return date.toLocaleDateString('zh-CN', {
          month: '2-digit',
          day: '2-digit'
        });
      }
    },
    
    goTo(url) {
      uni.navigateTo({ url });
    },
    
    handleLogout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.clearStorageSync();
            uni.reLaunch({
              url: '/pages/login/login'
            });
          }
        }
      });
    },
  },
};
</script>

<style scoped>
/* 样式太长，见下一条消息 */
</style>
/* 首页样式补充 */

.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 50%, #dbeafe 100%);
  padding: calc(32rpx + env(safe-area-inset-top)) 32rpx 200rpx 32rpx;
  padding-bottom: constant(safe-area-inset-bottom);
}

.header {
  text-align: center;
  margin-bottom: 32rpx;
}

.title {
  font-size: 44rpx;
  font-weight: bold;
  color: #9333ea;
  display: block;
  margin-bottom: 12rpx;
}

.subtitle {
  font-size: 26rpx;
  color: #6b7280;
  display: block;
}

.user-info {
  margin-top: 20rpx;
  display: flex;
  justify-content: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.user-tag, .family-code {
  background: #ffffff;
  padding: 10rpx 20rpx;
  border-radius: 28rpx;
  font-size: 24rpx;
  color: #4b5563;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.role-badge {
  margin-left: 6rpx;
  padding: 3rpx 10rpx;
  border-radius: 14rpx;
  font-size: 18rpx;
}

.role-badge.baby { background: #fce7f3; color: #ec4899; }
.role-badge.parent { background: #dcfce7; color: #22c55e; }
.role-badge.admin { background: #ede9fe; color: #9333ea; }

/* 审批区域 */
.approval-section {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.approval-section.empty {
  text-align: center;
  padding: 40rpx;
}

.empty-text {
  color: #9ca3af;
  font-size: 26rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #ea580c;
}

.refresh-btn {
  font-size: 28rpx;
}

.request-card {
  background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.baby-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #9a3412;
}

.request-time {
  font-size: 22rpx;
  color: #c2410c;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-approve {
  background: #22c55e;
  color: #ffffff;
}

.btn-reject {
  background: #ef4444;
  color: #ffffff;
}

/* 抽奖区域 */
.draw-section {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  text-align: center;
}

.result-card, .draw-card, .pending-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-emoji, .draw-emoji, .pending-emoji {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.result-title, .draw-title, .pending-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 12rpx;
}

.draw-subtitle, .pending-subtitle {
  font-size: 26rpx;
  color: #6b7280;
  margin-bottom: 32rpx;
}

.prize-emoji {
  font-size: 100rpx;
  margin-bottom: 16rpx;
}

.prize-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 12rpx;
}

.prize-points {
  font-size: 28rpx;
  color: #eab308;
  font-weight: 600;
}

.btn-draw, .btn-request {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
  color: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(147, 51, 234, 0.3);
}

.btn-draw:disabled {
  background: #9ca3af;
  box-shadow: none;
}

.pending-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 24rpx;
}

.btn-cancel, .btn-refresh {
  padding: 20rpx 40rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  font-weight: 600;
}

.btn-cancel {
  background: #e5e7eb;
  color: #374151;
}

.btn-refresh {
  background: #9333ea;
  color: #ffffff;
}

/* 历史记录区域 */
.history-section {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.section-count {
  font-size: 24rpx;
  color: #9ca3af;
}

.history-empty {
  text-align: center;
  padding: 60rpx 20rpx;
  color: #9ca3af;
  font-size: 26rpx;
}

.history-list {
  max-height: 600rpx;
}

.history-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 50%, #dbeafe 100%);
  border-radius: 16rpx;
}

.history-icon {
  width: 80rpx;
  height: 80rpx;
  background: #ffffff;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  flex-shrink: 0;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6rpx;
}

.history-desc {
  display: block;
  font-size: 22rpx;
  color: #6b7280;
  margin-bottom: 6rpx;
}

.history-meta {
  display: block;
  font-size: 20rpx;
  color: #9ca3af;
}

.history-points {
  font-size: 26rpx;
  color: #eab308;
  font-weight: bold;
  flex-shrink: 0;
}

.load-more {
  text-align: center;
  padding: 24rpx;
  color: #9333ea;
  font-size: 26rpx;
  font-weight: 600;
}

/* 底部导航 */
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 16rpx;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 16rpx;
}

.icon {
  font-size: 40rpx;
}

.label {
  font-size: 20rpx;
  color: #6b7280;
}

/* 审批弹窗 */
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
  max-width: 90%;
}

.modal-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #1f2937;
  text-align: center;
  margin-bottom: 12rpx;
}

.modal-subtitle {
  display: block;
  font-size: 26rpx;
  color: #6b7280;
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
  background: #f9fafb;
  margin-bottom: 24rpx;
}

.modal-actions {
  display: flex;
  gap: 16rpx;
}

.btn-modal-cancel, .btn-modal-approve, .btn-modal-reject {
  flex: 1;
  height: 72rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-modal-cancel {
  background: #e5e7eb;
  color: #374151;
}

.btn-modal-approve {
  background: #22c55e;
  color: #ffffff;
}

.btn-modal-reject {
  background: #ef4444;
  color: #ffffff;
}
