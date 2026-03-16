<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @click="goBack"><text class="back-icon">‹</text></view>
      <text class="title">🎁 奖品管理</text>
      <text class="subtitle">{{ prizes.length }} 个奖品</text>
    </view>

    <!-- 添加奖品按钮 -->
    <view class="add-btn" @click="showAddModal = true">
      <text class="add-icon">➕</text>
      <text class="add-text">添加奖品</text>
    </view>

    <!-- 奖品列表 -->
    <scroll-view class="prize-list" scroll-y>
      <view v-if="prizes.length === 0" class="empty">
        <text class="empty-emoji">📭</text>
        <text class="empty-text">暂无奖品，快添加一些吧</text>
      </view>

      <view v-else v-for="(prize, index) in prizes" :key="prize.id" class="prize-card">
        <view class="prize-left">
          <view class="prize-icon">{{ prize.imageUrl || '🎁' }}</view>
          <view class="prize-info">
            <text class="prize-name">{{ prize.name }}</text>
            <text v-if="prize.description" class="prize-desc">{{ prize.description }}</text>
            <text v-if="prize.points > 0" class="prize-points">⭐ {{ prize.points }} 积分</text>
          </view>
        </view>
        <view class="prize-actions">
          <button class="btn-icon" @click="editPrize(prize)">✏️</button>
          <button class="btn-icon delete" @click="deletePrize(prize)">🗑️</button>
        </view>
      </view>
    </scroll-view>

    <!-- 添加/编辑弹窗 -->
    <view v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">{{ editingPrize ? '编辑奖品' : '添加奖品' }}</text>
        
        <input 
          class="input" 
          v-model="formData.name" 
          placeholder="奖品名称（必填）"
        />
        
        <textarea 
          class="textarea" 
          v-model="formData.description" 
          placeholder="奖品描述（可选）"
          maxlength="200"
        />
        
        <input 
          class="input" 
          v-model="formData.points" 
          type="number"
          placeholder="积分（可选，如：10）"
        />
        
        <input 
          class="input" 
          v-model="formData.imageUrl" 
          placeholder="图标 emoji（如：🎮）"
        />
        
        <view class="modal-actions">
          <button class="btn-modal-cancel" @click="showAddModal = false">取消</button>
          <button class="btn-modal-save" @click="savePrize">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { prizes } from '@/api/index';

export default {
  data() {
    return {
      prizes: [],
      showAddModal: false,
      editingPrize: null,
      formData: {
        name: '',
        description: '',
        points: '',
        imageUrl: '',
      },
    };
  },
  
  onLoad() {
    this.fetchPrizes();
  },
  
  methods: {
    async fetchPrizes() {
      const userInfo = uni.getStorageSync('user_info');
      if (!userInfo) return;
      
      try {
        const res = await prizes.list(userInfo.familyId);
        this.prizes = res.prizes || [];
      } catch (err) {
        console.error('获取奖品失败:', err);
        uni.showToast({ title: '加载失败', icon: 'none' });
      }
    },
    
    editPrize(prize) {
      this.editingPrize = prize;
      this.formData = {
        name: prize.name,
        description: prize.description || '',
        points: prize.points ? prize.points.toString() : '',
        imageUrl: prize.imageUrl || '',
      };
      this.showAddModal = true;
    },
    
    async savePrize() {
      if (!this.formData.name.trim()) {
        uni.showToast({ title: '请填写奖品名称', icon: 'none' });
        return;
      }
      
      try {
        const userInfo = uni.getStorageSync('user_info');
        const data = {
          ...this.formData,
          familyId: userInfo.familyId,
          points: this.formData.points ? parseInt(this.formData.points) : 0,
        };
        
        if (this.editingPrize) {
          await prizes.update({ ...data, id: this.editingPrize.id });
          uni.showToast({ title: '更新成功', icon: 'success' });
        } else {
          await prizes.create(data);
          uni.showToast({ title: '添加成功', icon: 'success' });
        }
        
        this.showAddModal = false;
        this.editingPrize = null;
        this.formData = { name: '', description: '', points: '', imageUrl: '' };
        this.fetchPrizes();
      } catch (err) {
        console.error('保存奖品失败:', err);
        uni.showToast({ title: '保存失败', icon: 'none' });
      }
    },
    
    async deletePrize(prize) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除奖品"${prize.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await prizes.delete(prize.id);
              uni.showToast({ title: '删除成功', icon: 'success' });
              this.fetchPrizes();
            } catch (err) {
              console.error('删除奖品失败:', err);
              uni.showToast({ title: '删除失败', icon: 'none' });
            }
          }
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

.add-btn {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.add-icon {
  font-size: 40rpx;
}

.add-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #9333ea;
}

.prize-list {
  height: calc(100vh - 300rpx);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  border-radius: 24rpx 24rpx 0 0;
  padding: 24rpx;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.empty {
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
  display: block;
  font-size: 28rpx;
  color: #6b7280;
}

.prize-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.prize-icon {
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

.prize-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.prize-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
}

.prize-desc {
  font-size: 22rpx;
  color: #6b7280;
}

.prize-points {
  font-size: 24rpx;
  color: #eab308;
  font-weight: 600;
}

.prize-actions {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex-shrink: 0;
}

.btn-edit, .btn-delete {
  padding: 12rpx 20rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 600;
  height: auto;
  line-height: 1.5;
}

.btn-edit {
  background: #f3f4f6;
  color: #374151;
}

.btn-delete {
  background: #fee2e2;
  color: #dc2626;
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
  margin-bottom: 24rpx;
}

.input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 0 16rpx;
  font-size: 26rpx;
  background: #f9fafb;
  margin-bottom: 16rpx;
}

.textarea {
  width: 100%;
  min-height: 160rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 26rpx;
  background: #f9fafb;
  margin-bottom: 16rpx;
}

.modal-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.btn-modal-cancel, .btn-modal-save {
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

.btn-modal-save {
  background: #9333ea;
  color: #ffffff;
}
</style>
