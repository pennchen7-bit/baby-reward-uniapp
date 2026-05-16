<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
    this.checkUserSession()
  },
  onShow: function () {
    console.log('App Show')
    this.checkUserSession()
  },
  onHide: function () {
    console.log('App Hide')
  },
  methods: {
    async checkUserSession() {
      const userInfo = uni.getStorageSync('user_info')
      if (!userInfo) {
        return // 没有用户信息，游客直接看首页
      }
      
      try {
        const res = await uni.request({
          url: 'http://www.clovey.fun/api/auth/check',
          method: 'GET',
          header: {
            'X-User-Id': userInfo.id,
          },
          timeout: 5000
        })
        
        if (res.statusCode !== 200 || !res.data.user) {
          this.clearUserAndRedirect()
        }
      } catch (err) {
        console.error('Session check failed:', err)
      }
    },
    clearUserAndRedirect() {
      uni.removeStorageSync('user_info')
      uni.removeStorageSync('family_id')
      uni.removeStorageSync('family_code')
      uni.reLaunch({ url: '/pages/login/login' })
    }
  }
}
</script>

<style>
page {
  height: 100vh;
  overflow: hidden;
}

body {
  height: 100vh;
  overflow: hidden;
}

.uni-page-body {
  height: 100vh;
  overflow: hidden;
}

@supports (padding-bottom: constant(safe-area-inset-bottom)) {
  page {
    padding-bottom: constant(safe-area-inset-bottom);
  }
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  page {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>