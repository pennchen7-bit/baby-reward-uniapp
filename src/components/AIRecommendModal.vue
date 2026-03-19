<template>
  <view v-if="visible" class="modal-overlay" @click="handleClose">
    <view class="modal-content" @click.stop>
      <!-- 头部 -->
      <view class="modal-header">
        <text class="modal-title">✨ AI 智能推荐</text>
        <text class="modal-close" @click="handleClose">✕</text>
      </view>
      
      <!-- 步骤 1: 输入描述 -->
      <view v-if="step === 1" class="step-content">
        <view class="input-section">
          <text class="input-label">请描述您想添加的奖品类型：</text>
          <textarea 
            class="description-input" 
            v-model="userDescription" 
            placeholder="例如：学习用品类的奖品，适合 8 岁男孩"
            maxlength="200"
            auto-height
          />
          <text class="input-tips">💡 描述越详细，推荐越精准（可选：年龄、性别、积分范围等）</text>
        </view>
        
        <!-- 快捷选项 -->
        <view class="quick-options">
          <text class="quick-label">快捷选项：</text>
          <scroll-view class="quick-scroll" scroll-x>
            <view class="quick-tags">
              <tag 
                v-for="(opt, idx) in quickOptions" 
                :key="idx"
                :text="opt.text"
                :selected="userDescription.includes(opt.text)"
                @click="addQuickOption(opt.text)"
              />
            </view>
          </scroll-view>
        </view>
        
        <view class="action-section">
          <button class="btn-generate" @click="generateSuggestions" :disabled="generating">
            <text v-if="generating">🤖 AI 思考中...</text>
            <text v-else>✨ 生成推荐</text>
          </button>
        </view>
      </view>
      
      <!-- 步骤 2: 查看推荐 -->
      <view v-if="step === 2" class="step-content">
        <view class="result-header">
          <text class="result-title">🎁 为您推荐 {{ suggestions.length }} 个奖品</text>
          <button class="btn-regenerate" @click="regenerate">🔄 换一批</button>
        </view>
        
        <!-- AI 消息 -->
        <view v-if="aiMessage" class="ai-message">
          <text class="ai-message-text">{{ aiMessage }}</text>
        </view>
        
        <!-- 推荐列表 -->
        <scroll-view class="suggestion-list" scroll-y>
          <view 
            v-for="(item, index) in suggestions" 
            :key="index" 
            class="suggestion-card"
            :class="{ selected: selectedIndices.includes(index) }"
            @click="toggleSelect(index)"
          >
            <view class="card-checkbox">
              <text class="checkbox-icon">{{ selectedIndices.includes(index) ? '✅' : '⬜' }}</text>
            </view>
            <view class="card-content">
              <view class="card-header">
                <text class="card-name">{{ item.name }}</text>
                <text v-if="item.trending" class="trending-tag">🔥 流行</text>
              </view>
              <text v-if="item.description" class="card-desc">{{ item.description }}</text>
              <view class="card-footer">
                <text class="card-category">{{ item.category }}</text>
                <text class="card-points">⭐ {{ item.points }} 积分</text>
              </view>
              <text v-if="item.reason" class="card-reason">💡 {{ item.reason }}</text>
            </view>
          </view>
        </scroll-view>
        
        <view class="action-section">
          <button class="btn-back" @click="step = 1">↩️ 修改描述</button>
          <button class="btn-add-selected" @click="addSelected" :disabled="selectedIndices.length === 0">
            添加选中的 ({{ selectedIndices.length }})
          </button>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-overlay">
        <view class="loading-spinner">🤖</view>
        <text class="loading-text">AI 正在思考中...</text>
      </view>
    </view>
  </view>
</template>

<script>
import Tag from './AIPromptTag.vue';

export default {
  name: 'AIRecommendModal',
  components: {
    Tag,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    childAge: {
      type: Number,
      default: null,
    },
    childGender: {
      type: String,
      default: '',
    },
    existingRewards: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      step: 1,
      userDescription: '',
      generating: false,
      loading: false,
      suggestions: [],
      selectedIndices: [],
      aiMessage: '',
      quickOptions: [
        { text: '学习用品', icon: '📚' },
        { text: '健康零食', icon: '🍎' },
        { text: '玩具', icon: '🧸' },
        { text: '户外运动', icon: '⚽' },
        { text: '高积分大奖', icon: '🏆' },
        { text: '低积分小奖', icon: '🍬' },
      ],
    };
  },
  watch: {
    visible(val) {
      console.log('[AIRecommendModal] visible changed:', val);
      if (val) {
        this.step = 1;
        this.userDescription = '';
        this.suggestions = [];
        this.selectedIndices = [];
        this.aiMessage = '';
        console.log('[AIRecommendModal] Modal opened, step reset to 1');
      }
    },
  },
  mounted() {
    console.log('[AIRecommendModal] Component mounted, initial visible:', this.visible);
  },
  methods: {
    handleClose() {
      this.$emit('close');
    },
    
    addQuickOption(text) {
      if (this.userDescription.includes(text)) {
        this.userDescription = this.userDescription.replace(text, '').trim();
      } else {
        this.userDescription = this.userDescription 
          ? `${this.userDescription}，${text}`
          : text;
      }
    },
    
    async generateSuggestions() {
      console.log('[AIRecommendModal] generateSuggestions called');
      
      if (!this.userDescription.trim()) {
        uni.showToast({
          title: '请输入奖品描述',
          icon: 'none',
        });
        return;
      }
      
      this.generating = true;
      
      try {
        // 调用后端 /api/recommend 接口
        const API_BASE_URL = 'https://baby-reward.clovey.site';
        
        const res = await new Promise((resolve, reject) => {
          uni.request({
            url: `${API_BASE_URL}/api/recommend`,
            method: 'POST',
            header: { 'Content-Type': 'application/json' },
            data: { input: this.userDescription.trim() },
            success: (response) => {
              console.log('[AIRecommendModal] Request success:', response);
              resolve(response);
            },
            fail: (err) => {
              console.error('[AIRecommendModal] Request fail:', err);
              reject(new Error('网络请求失败：' + (err.errMsg || '未知错误')));
            },
          });
        });
        
        console.log('[AIRecommendModal] Response:', res);
        
        if (res.statusCode === 200 && res.data.prizes) {
          // 转换格式
          this.suggestions = res.data.prizes.map(p => ({
            name: p.name,
            description: p.description || '',
            category: p.category || '其他',
            points: p.points || 10,
            reason: '根据您的需求推荐',
            trending: false,
          }));
          this.aiMessage = '根据您的描述推荐了以下奖品';
          this.step = 2;
          this.selectedIndices = [];
          
          uni.showToast({
            title: '生成成功',
            icon: 'success',
          });
        } else {
          throw new Error('推荐失败');
        }
      } catch (err) {
        console.error('[AIRecommendModal] Error:', err);
        // 降级使用模拟数据
        console.log('[AIRecommendModal] Falling back to mock data');
        const mockSuggestions = this.getMockSuggestions(this.userDescription.trim());
        this.suggestions = mockSuggestions;
        this.aiMessage = '根据您的描述，我为您推荐了以下奖品（离线模式）。';
        this.step = 2;
        this.selectedIndices = [];
        
        uni.showToast({
          title: '生成成功（离线模式）',
          icon: 'success',
        });
      } finally {
        this.generating = false;
      }
    },
    
    async regenerate() {
      console.log('[AIRecommendModal] regenerate called, re-generating suggestions...');
      // 保持 step=2，直接重新调用接口生成新数据
      await this.generateSuggestions();
    },
    
    toggleSelect(index) {
      const pos = this.selectedIndices.indexOf(index);
      if (pos > -1) {
        this.selectedIndices.splice(pos, 1);
      } else {
        this.selectedIndices.push(index);
      }
    },
    
    async addSelected() {
      if (this.selectedIndices.length === 0) {
        uni.showToast({
          title: '请至少选择一个奖品',
          icon: 'none',
        });
        return;
      }
      
      this.loading = true;
      
      try {
        const selectedPrizes = this.selectedIndices.map(idx => this.suggestions[idx]);
        const userInfo = uni.getStorageSync('user_info');
        
        console.log('[AIRecommendModal] Adding prizes:', selectedPrizes.length);
        console.log('[AIRecommendModal] userInfo:', userInfo);
        
        const API_BASE_URL = 'https://baby-reward.clovey.site';
        
        // 批量添加奖品
        const addPromises = selectedPrizes.map(prize => 
          new Promise((resolve, reject) => {
            uni.request({
              url: `${API_BASE_URL}/api/prizes`,
              method: 'POST',
              header: { 
                'Content-Type': 'application/json',
                ...(userInfo ? { 
                  'X-User-Id': userInfo.id,
                  'X-User-Role': userInfo.role,
                  'X-Family-Id': userInfo.familyId || ''
                } : {}),
              },
              data: {
                name: prize.name,
                description: prize.description,
                points: prize.points,
                imageUrl: this.getEmojiForCategory(prize.category),
                familyId: userInfo?.familyId,
                aiSuggested: true,
                trending: prize.trending,
              },
              success: (res) => {
                console.log('[AIRecommendModal] Add prize success:', res);
                resolve(res);
              },
              fail: (err) => {
                console.error('[AIRecommendModal] Add prize fail:', err);
                reject(err);
              },
            });
          })
        );
        
        const results = await Promise.all(addPromises);
        console.log('[AIRecommendModal] All results:', results);
        
        const successCount = results.filter(r => r.statusCode === 200).length;
        
        uni.showToast({
          title: `成功添加 ${successCount} 个奖品`,
          icon: 'success',
        });
        
        this.$emit('added', selectedPrizes);
        this.handleClose();
      } catch (err) {
        console.error('[AIRecommendModal] Add prizes error:', err);
        uni.showToast({
          title: err.message || '添加失败，请重试',
          icon: 'none',
          duration: 3000,
        });
      } finally {
        this.loading = false;
      }
    },
    
    getMockSuggestions(input) {
      // 离线模拟数据（当 API 不可用时使用）
      const baseSuggestions = [
        {
          name: '精美笔记本套装',
          description: '高品质笔记本 + 彩色笔套装',
          category: '学习用品',
          points: 50,
          reason: '适合学习和记录',
          trending: true,
        },
        {
          name: '健康零食大礼包',
          description: '坚果、果干混合装',
          category: '健康零食',
          points: 30,
          reason: '营养又美味',
          trending: false,
        },
        {
          name: '益智拼图玩具',
          description: '500 片拼图，锻炼思维能力',
          category: '玩具',
          points: 80,
          reason: '寓教于乐',
          trending: true,
        },
        {
          name: '儿童跳绳',
          description: '可调节长度，适合户外运动',
          category: '户外运动',
          points: 40,
          reason: '锻炼身体协调性',
          trending: false,
        },
        {
          name: '科学实验套装',
          description: '简单安全的化学实验工具',
          category: '学习用品',
          points: 120,
          reason: '培养科学兴趣',
          trending: true,
        },
        {
          name: '卡通水杯',
          description: '环保材质，可爱图案',
          category: '生活用品',
          points: 25,
          reason: '实用又美观',
          trending: false,
        },
      ];
      
      // 根据输入简单筛选
      const keywords = input.split(/[,,\u3001]/).filter(k => k.trim());
      if (keywords.length > 0) {
        const filtered = baseSuggestions.filter(s => 
          keywords.some(k => s.name.includes(k) || s.category.includes(k) || s.description.includes(k))
        );
        if (filtered.length > 0) {
          return filtered;
        }
      }
      
      return baseSuggestions;
    },
    
    getEmojiForCategory(category) {
      const emojis = {
        '学习': '📚',
        '零食': '🍎',
        '娱乐': '📺',
        '游戏': '🎮',
        '运动': '⚽',
        '特殊': '🎁',
        '休息': '😴',
      };
      return emojis[category] || '🎁';
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 24px;
  color: #999;
  padding: 5px 10px;
}

.step-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.input-section {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.description-input {
  width: 100%;
  min-height: 160rpx;
  padding: 20rpx 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 28rpx;
  line-height: 1.6;
  box-sizing: border-box;
}

.input-tips {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.quick-options {
  margin-bottom: 20px;
}

.quick-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.quick-scroll {
  white-space: nowrap;
}

.quick-tags {
  display: flex;
  gap: 8px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.result-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.btn-regenerate {
  background: #f5f5f5;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
}

.ai-message {
  background: #fff7e6;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
  border-left: 3px solid #ff9800;
}

.ai-message-text {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.suggestion-list {
  max-height: 400px;
}

.suggestion-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 10px;
  transition: all 0.2s;
}

.suggestion-card.selected {
  border-color: #4CAF50;
  background: #f1f8f4;
}

.card-checkbox {
  padding-top: 4px;
}

.checkbox-icon {
  font-size: 18px;
}

.card-content {
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.card-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.trending-tag {
  background: linear-gradient(135deg, #ff6b6b, #ff9800);
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
}

.card-desc {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.card-category {
  background: #e3f2fd;
  color: #2196f3;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.card-points {
  font-size: 13px;
  font-weight: bold;
  color: #ff9800;
}

.card-reason {
  display: block;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.action-section {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.btn-generate {
  flex: 1;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
}

.btn-generate:disabled {
  opacity: 0.6;
}

.btn-back {
  flex: 1;
  background: #f5f5f5;
  color: #666;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
}

.btn-add-selected {
  flex: 2;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
}

.btn-add-selected:disabled {
  opacity: 0.5;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  font-size: 48px;
  animation: spin 1s infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 16px;
  font-size: 14px;
  color: #666;
}
</style>
