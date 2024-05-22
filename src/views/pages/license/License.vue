<template>
  <div class="login_bg bg-grey grid">
    <div style="display:table;height:100%;width:100%">
      <div style="display:table-cell" class="padding">
        <img src="@img-module/img/common/login-pic.png" style="width:100%;vertical-align:middle" />
      </div>
    </div>
    <div style="display:table;height:100%;width:100%">
      <div style="display:table-cell" class="padding">
        <div class="mb-sm">{{ $t('page.cipher') }}</div>
        <div class="mb-sm" style="width:495px">
          <TsFormInput
            ref="licenseInputer"
            v-model="license"
            type="textarea"
            class="bg-op"
            :height="320"
            style="font-family:monospace"
            :validateList="[{ name: 'required', message: ' ' }]"
          ></TsFormInput>
        </div>
        <div style="width:495px;">
          <Button type="primary" style="width:100%" @click="updateLicense()">{{ $t('page.update') }}</Button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {},
  data() {
    return {
      license: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    updateLicense() {
      if (this.$refs['licenseInputer'] && this.$refs['licenseInputer'].valid()) {
        this.$api.framework.license.updateLicense(this.license.trim()).then(res => {
          if (res.Status == 'OK') {
            window.location.href = HOME;
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 50% 50%;
  width: 100%;
  height: 100%;
}
</style>
