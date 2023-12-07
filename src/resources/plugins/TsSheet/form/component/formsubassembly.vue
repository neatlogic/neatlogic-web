<template>
  <div v-if="subFormData">
    <div v-if="readonly && !formDataList.length">-</div>
    <div v-else class="sheet-main">
      <div class="text-left"><span class="label bg-primary">{{ label }}</span></div>
      <div class="sheet-detail border-color" :style="{ '--height': getFormDataHeight(formDataList) }">
        <div v-for="(item,index) in formDataList" :key="index" class="sheet-list border-base radius-md border-color">
          <div orientation="start" class="subForm-label">
            <div>
              <span class="pr-xs">#{{ index+1 }}</span>
              <span>{{ label }}</span>
            </div>
            <div class="">
              <span v-if="!disabled && !readonly && config.isCanAdd && (mode ==='read'|| mode==='readSubform')" class="tsfont-trash-o text-action del-icon" @click="delSheet(index)"></span>
              <span class="pl-sm" :class="!item.isHide?'tsfont-down':'tsfont-up'" @click="toggleshow(item)"></span>
            </div>
          </div>
          <div v-show="!item.isHide" class="subForm-detail border-color">
            <TsSheet
              ref="sheet"
              :mode="mode==='edit'||mode==='editSubform'?'editSubform':'readSubform'"
              :value="subFormData"
              :data="item"
              :disabled="disabled"
              :readonly="readonly"
              isFormSubassembly
              @setValue="(val)=>{updateValue(val, item, index)}"
            ></TsSheet>
          </div>
        </div>
      </div> 
      <div v-if="!disabled && !readonly && config.isCanAdd">
        <Button
          type="primary"
          ghost
          @click="addFormData"
        >{{ $t('dialog.title.addtarget',{'target': label }) }}</Button>
      </div>
    </div>
  </div>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
export default {
  name: '',
  components: {
    TsSheet: resolve => require(['@/resources/plugins/TsSheet/TsSheet.vue'], resolve)
  },
  extends: base,
  mixins: [validmixin],
  props: {},
  data() {
    return {
      formDataList: [],
      subFormData: null,
      label: ''
    };
  },
  beforeCreate() {},
  created() {
    this.init();
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
    init() {
      this.formDataList = [];
      if (this.value) {
        let value = this.$utils.deepClone(this.value);
        if (typeof value === 'string') {
          value = JSON.parse(value);
        }
        if (value instanceof Array && value.length > 0) {
          value.forEach(item => {
            //默认展开
            if (item.hasOwnProperty('isHide')) {
              this.$set(item, 'isHide', false);
            }
          });
          this.formDataList.push(...value);
        }
      } else { 
        if (!this.formDataList.length) {
          this.addFormData();
        }
      }
    },
    updateValue(val, item, index) {
      if (!this.$utils.isSame(val, item)) { 
        this.formDataList.splice(index, 1, val);
        this.setValue(this.formDataList); 
      }
    },
    async validData() {
      const errorList = [];
      const sheet = this.$refs['sheet'];
      let isValid = true;
      let list = sheet && Array.from(sheet) || [];
      for (let i in list) {
        let errorData = await list[i].validData();
        if (!this.$utils.isEmpty(errorData)) {
          this.$set(this.formDataList[i], 'isHide', false);
          isValid = false;
        }
      }
      if (!isValid) {
        errorList.push({uuid: this.formItem.uuid, error: this.formItem.label + '校验失败'});
      }
      return errorList;
    },
    addFormData() {
      this.formDataList.push({});
      this.setValue(this.formDataList); 
    },
    delSheet(index) {
      this.formDataList.splice(index, 1);
      this.setValue(this.formDataList); 
    },
    toggleshow(item) {
      this.$set(item, 'isHide', !item.isHide);
      this.$emit('resize');
    }
  },
  filter: {},
  computed: {
    getFormDataHeight() {
      return (list) => {
        let height = 100;
        if (list.length > 0 && this.disabled || this.readonly || !this.config || !this.config.isCanAdd) {
          height = 100 * (1 - 1 / (list.length * 2));
        }
        return height + '%';
      };
    }
  },
  watch: {
    formItem: {
      handler(val) {
        if (val && val.formData) {
          this.subFormData = val.formData.formConfig;
          this.label = val.label;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.sheet-main {
  .label {
    display: inline-block;
    height: 26px;
    line-height: 26px;
    border-radius: 13px;
    padding: 0 6px;
    font-size: 12px;
    color: #fff;
  }
  .sheet-detail{
    position: relative;
    padding-left: 44px;
    padding-top: 10px;
    padding-bottom: 10px;
    &::before{
        position: absolute;
        content: "";
        top: 0px;
        bottom: -10px;
        left: 20px;
        border-left: 1px dashed;
        border-color: inherit;
        height:  var(--height);
    }
  }
  .sheet-list {
    position: relative;
    &:not(:last-child){
      margin-bottom: 10px;
    }
    &::before {
      position: absolute;
      content: " ";
      top: 50%;
      left: -24px;
      right: 100%;
      border-top: 1px dashed;
      border-color: inherit;
    }
    .subForm-label {
      padding: 6px;
      display: flex;
      justify-content: space-between;
    }
    &:hover {
      .del-icon {
        display: inline-block;
      }
    }
    .del-icon {
      display: none;
    }
    .subForm-detail {
      padding: 16px;
      border-top: 1px solid;
    }
  }
}
</style>
