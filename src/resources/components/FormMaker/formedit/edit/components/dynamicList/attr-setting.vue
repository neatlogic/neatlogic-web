<template>
  <div>
    <TsDialog
      title="属性设置"
      type="modal"
      :isShow="true"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsFormItem label="创建超链接">
            <TsFormSwitch
              v-model="isActive"
              @on-change="changeActive"
            ></TsFormSwitch>
          </TsFormItem>
          <TsFormItem v-if="isActive" label="URL属性" :validateList="validateList">
            <TsFormSelect
              ref="urlAttribute"
              v-model="urlAttributeValue"
              :dataList="attributeDataList"
              valueName="uuid"
              textName="name"
              transfer
              border="border"
              :validateList="validateList"
              desc="请选矩阵中保存http或https链接的属性"
            ></TsFormSelect>
          </TsFormItem>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  props: {
    attributeDataList: [],
    currentConfig: Object
  },
  data() {
    return {
      isActive: 0,
      urlAttributeValue: null,
      validateList: ['required']
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
    changeActive() {
      this.urlAttributeValue = null;
    },
    okDialog() {
      if (this.$refs.urlAttribute && !this.$refs.urlAttribute.valid()) {
        return;
      }
      this.$emit('closeSetting', true, this.urlAttributeValue);
    },
    closeDialog() {
      this.$emit('closeSetting');
    }
  },
  filter: {},
  computed: {},
  watch: {
    currentConfig: {
      handler(val) {
        if (val) {
          this.urlAttributeValue = val.urlAttributeValue || null;
          this.urlAttributeValue && (this.isActive = 1);
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less">
</style>
