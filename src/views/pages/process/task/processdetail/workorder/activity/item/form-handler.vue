<template>
  <div>
    <span class="left-label-text text-grey">{{ config.typeName }}</span>
    <span class="text-href" :class="[isShow ? 'tsfont-up' : 'tsfont-down']" @click="seeMore">{{ isShow ? $t('page.clickandputaway') : $t('page.viewdetails') }}</span>
    <TsSheet
      v-if="!$utils.isEmpty(formConfig) && isShow"
      ref="sheet"
      mode="read"
      class="mt-xs"
      style="margin-left: 88px"
      :readonly="true"
      :value="formConfig"
      :data="formData"
      :formHighlightData="formHighlightData"
    ></TsSheet>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsSheet: resolve => require(['@/resources/plugins/TsSheet/TsSheet.vue'], resolve)
  },
  filters: {},
  props: {
    config: Object,
    formConfig: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      isShow: false,
      formData: {},
      formHighlightData: {}
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
    handleData() {
      this.formData = {};
      let oldContent = JSON.parse(this.config.oldContent);
      if (!this.$utils.isEmpty(oldContent)) {
        oldContent.forEach((item) => {
          if (item.attributeUuid) {
            this.formData[item.attributeUuid] = item.dataObj;
            this.formHighlightData[item.attributeUuid] = !!item.modified;
          }
        });
      }
    },
    seeMore() {
      // 查看详情展开收起
      this.isShow = !this.isShow;
      if (this.isShow) {
        this.handleData();
      }
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
</style>
