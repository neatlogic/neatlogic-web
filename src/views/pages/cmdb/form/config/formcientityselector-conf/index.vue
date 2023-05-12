<template>
  <div>
    <TsFormItem label="输入提示" labelPosition="top">
      <TsFormInput
        v-model="config.placeholder"
        border="border"
        :disabled="disabled"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem label="选择范围" labelPosition="top" tooltip="不选择代表不限制配置项选择范围">
      <span v-if="!disabled" class="tsfont-filter text-href" @click="openCiDialog()">点击选择</span>
      <div v-if="config.ciList && config.ciList.length > 0">
        <Tag
          v-for="(item, index) in config.ciList"
          :key="index"
          :closable="!disabled? true : false"
          @on-close="deleteCi(item,index )"
        >
          {{ item.title }}
        </Tag>
      </div>
    </TsFormItem>
    <CiDialog v-if="isCiDialogShow" :ciList="config.ciList" @close="closeCiDialog"></CiDialog>
  </div>
</template>
<script>
import base from '@/resources/plugins/TsSheet/form/config/base-config.vue';

export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    CiDialog: resolve => require(['./ci-dialog.vue'], resolve)
  },
  extends: base,
  props: {},
  data() {
    return {
      isCiDialogShow: false
    };
  },
  beforeCreate() {},
  created() {
    //this.getCiList();
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
    openCiDialog() {
      this.isCiDialogShow = true; 
    },
    closeCiDialog(ciList) {
      this.isCiDialogShow = false;
      if (ciList) {
        this.config.ciList = ciList;
      }
    },
    deleteCi(ci, index) {
      this.config.ciList.splice(index, 1);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
</style>
