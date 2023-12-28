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
      :value="currentFormConfig"
      :data="formData"
      :formHighlightData="formHighlightData"
    ></TsSheet>
  </div>
</template>
<script>
import dealFormMix from '@/views/pages/process/task/taskcommon/dealNewFormData.js';
export default {
  name: '',
  components: {
    TsSheet: resolve => require(['@/resources/plugins/TsSheet/TsSheet.vue'], resolve)
  },
  filters: {},
  mixins: [dealFormMix],
  props: {
    config: Object,
    formConfig: {
      type: Object,
      default: function() {
        return {};
      }
    },
    processTaskStepId: {
      type: Number,
      default: null
    },
    formSceneUuid: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      isShow: false,
      formData: {},
      formHighlightData: {},
      currentFormConfig: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (!this.$utils.isEmpty(this.formConfig)) {
        if (this.processTaskStepId) { //流转时，表单展示需要与节点场景保持一致
          this.currentFormConfig = this.initNewFormConfig(this.formSceneUuid, this.formConfig);
        } else {
          this.currentFormConfig = this.formConfig;
        }
      }
    },
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
