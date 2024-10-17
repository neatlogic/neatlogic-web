<template>
  <div>
    <span class="left-label-text text-grey">{{ config.typeName }}</span>
    <span class="text-href" :class="[isShow ? 'tsfont-drop-down' : 'tsfont-drop-right']" @click="seeMore">{{ isShow ? $t('page.clickandputaway') : $t('page.viewdetails') }}</span>
    <TsSheet
      v-if="!$utils.isEmpty(formConfig) && isShow"
      ref="sheet"
      mode="read"
      class="mt-xs"
      style="margin-left: 88px"
      :readonly="true"
      :value="formConfig"
      :formSceneUuid="formSceneUuid || 'defaultSceneUuid'"
      :data="formData"
      :formHighlightData="formHighlightData"
      :externalData="externalData"
    ></TsSheet>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsSheet: () => import('@/resources/plugins/TsSheet/TsSheet.vue')
  },
  filters: {},
  mixins: [],
  props: {
    config: Object,
    formConfig: { //主表单
      type: Object,
      default: function() {
        return {};
      }
    },
    processTaskStepId: {
      type: Number,
      default: null
    },
    formSceneUuid: String,
    processTaskId: [Number, String]
  },
  data() {
    return {
      isShow: false,
      formData: {},
      formHighlightData: {},
      externalData: {
        processTaskId: this.processTaskId
      }
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
