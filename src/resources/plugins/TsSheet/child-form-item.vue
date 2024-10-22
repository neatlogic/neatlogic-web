<template>
  <div
    style="position:relative"
    @mouseover.stop="hoverFormItem()"
    @mouseout.stop="outFormItem()"
    @click.stop="selectFormItem()"
  >
    <div v-if="(mode === 'edit' && formItem._selected) || formItem._hovered" class="selected">
      <div class="border-top" :class="{ 'border-color-info': formItem._selected, 'border-color-base': formItem._hovered }"></div>
      <div class="border-bottom" :class="{ 'border-color-info': formItem._selected, 'border-color-base': formItem._hovered }"></div>
      <div class="border-left" :class="{ 'border-color-info': formItem._selected, 'border-color-base': formItem._hovered }"></div>
      <div class="border-right" :class="{ 'border-color-info': formItem._selected, 'border-color-base': formItem._hovered }"></div>
      <span class="anthor-top-left" :class="{ 'text-info': formItem._selected, 'text-grey': formItem._hovered }">◼</span>
      <span class="anthor-top-right" :class="{ 'text-info': formItem._selected, 'text-grey': formItem._hovered }">◼</span>
      <span class="anthor-bottom-left" :class="{ 'text-info': formItem._selected, 'text-grey': formItem._hovered }">◼</span>
      <span class="anthor-bottom-right" :class="{ 'text-info': formItem._selected, 'text-grey': formItem._hovered }">◼</span>
      <span v-if="formItem._selected && !disabled" class="remove-btn tsfont-trash-o text-href" @mousedown.stop="removeFormItem"></span>
    </div>
    <FormItem
      :ref="'formitem_' + formItem.uuid"
      :needLabel="true"
      :formItem="formItem"
      :formData="formData"
      :formItemList="formItemList"
      :mode="mode"
      :clearable="false"
      :disabled="disabled"
      :readonly="readonly"
      :showStatusIcon="false"
      isCustomValue
      :isClearSpecifiedAttr="isClearSpecifiedAttr"
      :externalData="externalData"
      @resize="$emit('resize')"
      @emit="
        val => {
          $emit('emit', val);
        }
      "
    ></FormItem>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    FormItem: () => import('@/resources/plugins/TsSheet/form-item.vue')
  },
  props: {
    formData: Object,
    formItem: { type: Object },
    formItemList: { type: Array },
    mode: { type: String, default: 'edit' }, //表单的模式edit或read或condition,edut模式才会显示异常、联动等辅助图标
    disabled: {type: Boolean, default: false},
    readonly: {type: Boolean, default: false},
    isClearSpecifiedAttr: {//工单权限用户编辑表单时，需要清除表单设置的只读，禁用，隐藏等规则属性
      type: Boolean,
      default: false
    },
    externalData: {
      // 外部数据，非表单数据，例如工单上报人数据等
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {};
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
    removeFormItem() {
      this.$emit('remove', this.formItem);
    },
    hoverFormItem() {
      if (this.mode === 'edit') {
        this.formItemList.forEach(item => {
          if (item._hovered) {
            this.$delete(item, '_hovered');
          }
        });
        if (!this.formItem._selected) {
          this.$set(this.formItem, '_hovered', true);
        }
      }
    },
    outFormItem() {
      if (this.mode === 'edit') {
        this.$delete(this.formItem, '_hovered');
      }
    },
    selectFormItem() {
      if (this.mode === 'edit') {
        this.$delete(this.formItem, '_hovered');
        this.formItemList.forEach(element => {
          if (element._selected) {
            this.$delete(element, '_selected');
          }
        });
        this.$set(this.formItem, '_selected', true);
        this.$emit('select', this.formItem);
      }
    },
    async validData() {
      const errorList = [];
      if (this.$refs) {
        for (let name in this.$refs) {
          if (this.$refs[name]) {
            let formitem = this.$refs[name];
            if (this.$refs[name] instanceof Array) {
              formitem = this.$refs[name][0];
            } else {
              formitem = this.$refs[name];
            }
            if (formitem) {
              const err = await formitem.validData();
              if (err && err.length > 0) {
                errorList.push(...err);
              }
            }
          }
        }
      }
      return errorList;
    },
    validConfig() {
      const errorList = [];
      if (this.$refs) {
        for (let name in this.$refs) {
          if (this.$refs[name]) {
            let formitem = this.$refs[name];
            if (this.$refs[name] instanceof Array) {
              formitem = this.$refs[name][0];
            } else {
              formitem = this.$refs[name];
            }
            if (formitem) {
              const err = formitem.validConfig();
              if (err && err.length > 0) {
                errorList.push({
                  uuid: formitem.formItem.uuid,
                  errorList: err
                });
              }
            }
          }
        }
      }
      return errorList;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import './form-item.less';
</style>
