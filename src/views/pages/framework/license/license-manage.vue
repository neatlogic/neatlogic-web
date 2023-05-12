<template>
  <div>
    <TsContain>
      <template v-slot:content>
        <div v-if="licenseData" class="content-grid">
          <div class="text-grey">{{ $t('term.framework.authorizedto') }}</div>
          <div>{{ licenseData.purchaser }}</div>
          <div class="text-grey">{{ $t('term.framework.issuedate') }}</div>
          <div>{{ licenseData.issueTime }}</div>
          <div class="text-grey">{{ $t('term.framework.expiredate') }}</div>
          <div>{{ licenseData.expiredTime }}</div>
          <div class="text-grey">{{ $t('term.framework.serveceenddate') }}</div>
          <div>{{ licenseData.stopServiceTime }}</div>
          <div class="text-grey">{{ $t('page.cipher') }}</div>
          <div>
            <TsFormInput
              ref="inputLicense"
              v-model="licenseData.license"
              width="500"
              height="320"
              type="textarea"
              :readonly="true"
              style="font-family:monospace"
            ></TsFormInput>
          </div>
        </div>
        <NoData v-else :text="$t('page.notarget',{'target':'license'})"></NoData>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {},
  data() {
    return {
      licenseData: null,
      isShowAuth: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getLicense();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getLicense() {
      this.$api.framework.license.getLicense().then(res => {
        this.licenseData = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.content-grid {
  display: grid;
  width: 80%;
  margin: auto;
  grid-gap: 16px 0px;
  grid-template-columns: 100px auto;
}
.card-grid {
  display: grid;
  width: 100%;
  grid-template-columns: 50px auto;
  .title {
    line-height: 26px;
  }
}
</style>
