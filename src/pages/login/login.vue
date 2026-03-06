<template>
  <view class="container">
    <view class="header">
      <text class="title">🎁 宝宝奖励计划</text>
      <text class="subtitle">{{ mode === 'login' ? '欢迎回来' : '创建新家庭' }}</text>
    </view>

    <!-- 模式切换 -->
    <view class="tabs">
      <view 
        class="tab" 
        :class="{ active: mode === 'login' }"
        @click="mode = 'login'"
      >
        登录
      </view>
      <view 
        class="tab" 
        :class="{ active: mode === 'register' }"
        @click="mode = 'register'"
      >
        注册
      </view>
    </view>

    <!-- 错误提示 -->
    <view v-if="error" class="error">
      {{ error }}
    </view>

    <!-- 登录表单 -->
    <view v-if="mode === 'login'" class="form">
      <view class="form-item">
        <text class="label">🔑 家庭码（可选）</text>
        <input 
          class="input" 
          v-model="familyCode" 
          placeholder="8888"
          maxlength="4"
          type="number"
        />
        <text class="tip">4 位数字，向家庭管理员获取（如知道请填写）</text>
      </view>
      
      <view class="form-item">
        <text class="label">用户名</text>
        <input 
          class="input" 
          v-model="username" 
          placeholder="输入用户名"
          auto-capitalize="none"
        />
      </view>
      
      <view class="form-item">
        <text class="label">密码</text>
        <input 
          class="input" 
          v-model="password" 
          type="password"
          placeholder="输入密码"
        />
      </view>
      
      <button 
        class="btn btn-primary" 
        :disabled="loading"
        @click="handleLogin"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </view>

    <!-- 注册表单 -->
    <view v-else class="form">
      <view class="form-item">
        <text class="label">🏠 家庭名称</text>
        <input 
          class="input" 
          v-model="familyName" 
          placeholder="例如：幸福小家"
        />
        <text class="tip">创建后您将担任该家庭的管理员</text>
      </view>
      
      <view class="form-item">
        <text class="label">用户名</text>
        <input 
          class="input" 
          v-model="username" 
          placeholder="设置用户名"
          auto-capitalize="none"
        />
      </view>
      
      <view class="form-item">
        <text class="label">密码</text>
        <input 
          class="input" 
          v-model="password" 
          type="password"
          placeholder="至少 6 位"
        />
      </view>
      
      <button 
        class="btn btn-primary" 
        :disabled="loading"
        @click="handleRegister"
      >
        {{ loading ? '注册中...' : '注册' }}
      </button>
    </view>

    <!-- 提示信息 -->
    <view v-if="mode === 'login'" class="tips">
      <text class="tips-title">💡 首次使用？</text>
      <text class="tips-text">切换到"注册"标签，输入家庭名称、用户名和密码，注册成功后会获得家庭码</text>
    </view>
  </view>
</template>

<script>
import { auth } from '@/api/index';

export default {
  data() {
    return {
      mode: 'login',
      username: '',
      password: '',
      familyName: '',
      familyCode: '',
      error: '',
      loading: false,
    };
  },
  
  methods: {
    async handleLogin() {
      this.error = '';
      this.loading = true;
      
      try {
        const res = await auth.login({
          username: this.username,
          password: this.password,
          familyCode: this.familyCode || undefined,
        });
        
        // 保存用户信息
        uni.setStorageSync('user_info', res.user);
        
        // 跳转到首页
        uni.switchTab({
          url: '/pages/index/index',
        });
      } catch (err) {
        this.error = err.message || '登录失败';
        uni.showToast({
          title: this.error,
          icon: 'none',
        });
      } finally {
        this.loading = false;
        this.password = '';
      }
    },
    
    async handleRegister() {
      this.error = '';
      this.loading = true;
      
      try {
        const res = await auth.register({
          familyName: this.familyName,
          username: this.username,
          password: this.password,
        });
        
        // 保存用户信息
        uni.setStorageSync('user_info', res.user);
        
        uni.showToast({
          title: `注册成功！家庭码：${res.family.familyCode}`,
          icon: 'success',
          duration: 3000,
        });
        
        // 跳转到首页
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/index/index',
          });
        }, 2000);
      } catch (err) {
        this.error = err.message || '注册失败';
        uni.showToast({
          title: this.error,
          icon: 'none',
        });
      } finally {
        this.loading = false;
        this.password = '';
      }
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 50%, #dbeafe 100%);
  padding: 40rpx;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #9333ea;
  display: block;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #6b7280;
  display: block;
}

.tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 40rpx;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  background: #f3f4f6;
  color: #4b5563;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.tab.active {
  background: #9333ea;
  color: #ffffff;
}

.error {
  background: #fef2f2;
  border: 1rpx solid #fecaca;
  color: #dc2626;
  padding: 24rpx;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  font-size: 26rpx;
}

.form {
  background: #ffffff;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 24rpx;
}

.label {
  display: block;
  font-size: 26rpx;
  color: #374151;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  background: #f9fafb;
}

.tip {
  display: block;
  font-size: 22rpx;
  color: #9ca3af;
  margin-top: 8rpx;
}

.btn {
  width: 100%;
  height: 88rpx;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 32rpx;
}

.btn-primary {
  background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
  color: #ffffff;
}

.btn-primary:disabled {
  background: #9ca3af;
}

.tips {
  margin-top: 32rpx;
  background: #f9fafb;
  border-radius: 16rpx;
  padding: 24rpx;
}

.tips-title {
  display: block;
  font-size: 26rpx;
  color: #4b5563;
  font-weight: 500;
  margin-bottom: 12rpx;
}

.tips-text {
  display: block;
  font-size: 22rpx;
  color: #9ca3af;
  line-height: 1.6;
}
</style>
