<template>
  <div class="reset-password">
    <div class="reset-password-setting bg-op radius-md">
      <div class="text-center pb-nm fz16">{{ $t('page.resetpwd') }}</div>
      <PasswordSetting></PasswordSetting>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    PasswordSetting: () => import('@/views/pages/framework/users/user-setting-password.vue')
  },
  props: {},
  data() {
    return {
     
    };
  },
  beforeCreate() {},
  created() {
   
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.reset-password{
  position: relative;
  .reset-password-setting{
    padding: 30px 50px;
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
