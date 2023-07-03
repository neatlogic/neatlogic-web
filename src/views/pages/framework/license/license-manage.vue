<template>
  <div>
    <TsContain>
      <template v-slot:content>
        <div v-if="licenseData" class="padding">
          <TsFormItem :label="$t('term.framework.authorizedto')">
            {{ licenseData.purchaser }}
          </TsFormItem>
          <TsFormItem :label="$t('term.framework.issuedate')">
            {{ licenseData.createDate | formatDate('yyyy-mm-dd') }}
          </TsFormItem>
          <TsFormItem :label="$t('term.framework.expiredate')">
            {{ licenseData.expirationDate | formatDate('yyyy-mm-dd') }}
          </TsFormItem>
          <TsFormItem :label="$t('term.framework.serveceenddate')">
            {{ licenseData.endDate | formatDate('yyyy-mm-dd') }}
          </TsFormItem>
          <TsFormItem :label="$t('term.rdm.modulelist')">
            <div>
              <Tag v-for="(m,index) in licenseData.moduleList" :key="index">{{ m.name }}·{{ m.id }}</Tag>
            </div>
          </TsFormItem>
        </div>
        <NoData v-else :text="$t('page.notarget', { target: 'license' })"></NoData>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve)
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
