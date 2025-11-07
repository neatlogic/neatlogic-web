<template>
  <div class="navigation">
    <wxlogin
      id="login_container"
      :appid="appid"
      scope="snsapi_login"
      :redirect_uri="'redirectUri'"
    ></wxlogin>
  </div>
</template>
<script>

import wxlogin from 'vue-wxlogin/src/components/vue-wxlogin.vue';
export default {
  name: 'Navigation',
  components: {
    wxlogin
  },
  data() {
    return {
      scope: 'snsapi_login',
      appid: 'wx8a4c400b4c54eeads',
      redirectUri: encodeURIComponent('https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx8a4c400b4c54eead&redirect_uri=http://demo.techsure.cn:8011/demo/workCenter&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect')
    };
  },
  created() {
  },
  computed: {
  }
};
</script>
<style lang="less" scoped>
</style>
