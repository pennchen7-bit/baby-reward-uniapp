<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
/* 全局禁止页面滚动 */
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

/* iOS 安全区域适配 */
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
