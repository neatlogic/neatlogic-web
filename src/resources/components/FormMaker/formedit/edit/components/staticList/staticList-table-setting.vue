<template>
  <div>
    <table class="list-table">
      <thead>
        <tr>
          <th class="text-grey require-label" nowrap>属性</th>
          <th class="text-grey require-label" nowrap>组件类型</th>
          <th class="text-grey" nowrap>必填</th>
          <th></th>
        </tr>
      </thead>
      <draggable
        v-if="setting.attributeList && setting.attributeList.length > 0"
        tag="tbody"
        class="dataSource-ul"
        :list="setting.attributeList"
        handle=".tsfont-bar"
        ghost-class="bg-primary"
      >
        <tr v-for="(attr, index) in setting.attributeList" :key="index">
          <td>
            <TsFormInput
              ref="attribute"
              v-model="attr.attribute"
              type="text"
              width="100"
              maxlength="50"
              :validateList="attributeValid"
              @on-blur="autocompleteText(attr, index)"
            ></TsFormInput>
          </td>
          <td>
            <TsFormSelect
              v-model="attr.type"
              width="100%"
              style="display: inline-block;width:80px"
              :dataList="typeList"
              :validateList="validJson"
              @on-change="changeType(index)"
            ></TsFormSelect>
            <i
              class="tsfont-setting span-btn"
              :class="{'form-error-tip':!!attr.valid_o}"
              title="数据源设置"
              @click="setAttrConfig(index)"
            ></i>
          </td>
          <td class="td-check">
            <Checkbox v-model="attr.isRequired"></Checkbox>
          </td>
          <td>
            <span class="tsfont-plus-o span-btn" title="添加" @click="addAttr(index)"></span>
            <span
              v-if="setting.attributeList && setting.attributeList.length > 1"
              class="tsfont-close-o span-btn"
              title="删除"
              @click="removeAttr(index)"
            ></span>
            <span v-if="setting.attributeList && setting.attributeList.length > 1" class="tsfont-bar span-btn" title="拖动"></span>
          </td>
        </tr>
      </draggable>
    </table>

    <!-- end_显示格式 -->

    <!-- 配置属性设置模态框 -->
    <TsDialog
      type="modal"
      width="medium"
      height="500px"
      :isShow.sync="showDialog"
      :title="modalTitle"
      @on-ok="okAttrConfig"
    >
      <DataSetting
        v-if="attrType == 'select' || attrType == 'selects' || attrType == 'radio' || attrType == 'checkbox'"
        ref="DataSetting"
        :setting="dialogConfig"
        :isMultiple="isMultiple"
      ></DataSetting>
      <TypeSetting
        v-else-if="attrType == 'text' || attrType == 'textarea' || attrType == 'date' || attrType == 'time' || attrType == 'password'"
        ref="DataSetting"
        :setting="dialogConfig"
        :type="attrType"
      ></TypeSetting>
    </TsDialog>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import draggable from 'vuedraggable';
import typeList from './staticList.js';
export default {
  name: 'Formstaticlist',
  components: {
    DataSetting: resolve => require(['./staticList-setting'], resolve),
    TypeSetting: resolve => require(['./staticList-type-setting'], resolve),
    TsFormSelect, 
    draggable,
    TsFormInput 
  },
  props: {
    type: String,
    setting: [Object, Array]
  },
  data() {
    return {
      typeList: typeList.filter(item => item.value != 'table'),
      dialogConfig: null, //属性配置模态框数据
      showDialog: false, //模态框显示
      attrIndex: null, //当前配置的属性index值
      attrType: null, //当前配置的类型
      isMultiple: false, //当前属性的类型是否是多选
      modalTitle: '数据源设置',
      attributeValid: ['required', 'non-special'],
      validJson: ['required']
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
    addAttr(index) {
      //新增属性列表
      let _this = this;
      let config = {
        attributeUuid: this.$utils.setUuid(),
        attribute: '',
        type: 'text',
        isRequired: false,
        attrConfig: {
          dataSource: 'static',
          dataList: [{ value: '', text: '' }],
          mapping: { text: '', value: '' },
          matrixUuid: '',
          defaultValue: '',
          value: ''
        }
      };
      this.setting.attributeList.splice(index + 1, 0, config);
    },
    removeAttr(index) {
      //删除属性列表
      this.setting.attributeList.splice(index, 1);
    },
    setAttrConfig(index) {
      //设置属性配置值
      this.attrIndex = index;
      this.attrType = this.setting.attributeList[index].type;
      this.showDialog = true;
      this.dialogConfig = Object.assign({value: ''}, this.setting.attributeList[index].attrConfig);
      this.modalTitle = this.setting.attributeList[index].attribute + '数据源设置';
      let type = this.setting.attributeList[index].type;
      if (type == 'checkbox' || type == 'selects') {
        this.isMultiple = true;
      } else {
        this.isMultiple = false;
      }
    },
    okAttrConfig() {
      if (this.$refs.DataSetting.validComponent()) {
        this.showDialog = false;
        this.setting.attributeList[this.attrIndex].attrConfig = this.dialogConfig;
        this.setting.attributeList[this.attrIndex].valid_o = false;
        // this.dialogConfig = null;
        // this.attrIndex = null;
      }
    },
    changeType(index) {
      //改变组件类型
      let config = this.setting.attributeList[index].attrConfig;
      let attrConfig = {
        dataSource: 'static',
        dataList: [{ value: '', text: '' }],
        mapping: { text: '', value: '' },
        matrixUuid: '',
        defaultValue: '',
        value: ''
      };
      let newConfig = null;
      let type = this.setting.attributeList[index].type;
      if (type == 'selects' || type == 'select' || type == 'radio' || type == 'checkbox') {
        //需要配置值之间的切换时
        newConfig = config;
        if (type == 'selects' || type == 'checkbox') {
          typeof newConfig.value == 'string' ? (newConfig.value == '' ? (newConfig.value = []) : (newConfig.value = [newConfig.value])) : '';
        } else if (type == 'select' || type == 'radio') {
          typeof newConfig.value == 'object' ? (newConfig.value = newConfig.value[0] || '') : '';
        }
      } else {
        newConfig = attrConfig;
      }

      this.setting.attributeList[index].attrConfig = newConfig;
    },
    autocompleteText(item, index) {
      //失焦后，如果属性名称相同则加一
      let value = item.attribute;
      if (value && !getDefaultValue(this.setting.attributeList, value, index)) {
        for (let a = 1; ; a++) {
          value = item.attribute + '_' + a;
          if (getDefaultValue(this.setting.attributeList, value)) {
            break;
          }
        }
      }
      item.attribute = value;
    },
    validComponent() {
      let _this = this;
      let valid = true;
      this.$refs.attribute &&
        this.$refs.attribute.forEach(item => {
          !item.valid() && (valid = false);
        });

      let validType = ['select', 'selects', 'radio', 'checkbox'];
      if (this.setting.attributeList && this.setting.attributeList.length > 0) {
        this.setting.attributeList.forEach(item => {
          let isValid = true;
          !item.type && (isValid = false);
          if (isValid && validType.indexOf(item.type) >= 0) {
            if (item.attrConfig.dataSource == 'static' && !(item.attrConfig.dataList && item.attrConfig.dataList.length > 0 && item.attrConfig.dataList[0].value != '')) {
              isValid = false;
            } else if (item.attrConfig.dataSource == 'matrix' && !item.attrConfig.matrixUuid) {
              isValid = false;
            }
          }
          this.$set(item, 'valid_o', !isValid);
          valid = valid ? isValid : valid;
        });
      } else {
        valid = false;
      }
      !valid && this.$Message.error('校验不通过，请完善数据');
      return valid;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};

function getDefaultValue(list, value, index) {
  //判断是否有重复数据
  let isDefaultValue = true;
  for (let i = 0; i < list.length; i++) {
    if (typeof index != 'undefined' && index != i && list[i].attribute == value) {
      isDefaultValue = false;
      break;
    } else if (typeof index == 'undefined' && list[i].attribute == value) {
      isDefaultValue = false;
      break;
    }
  }
  return isDefaultValue;
}
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.list-table {
  width:100%;
  th {
    padding: 3px;
    font-weight: normal;
    text-align: left;
  }
  td {
    vertical-align: top;
    padding: 3px;
    .span-btn {
      padding: 2px 4px;
      cursor: pointer;
      font-size: 12px;
      line-height: 28px;
      height: 28px;
      display: inline-block;
    }
    &.td-check {
      padding-top: 8px;
      /deep/ .ivu-checkbox-checked .ivu-checkbox-inner:after {
        top: -2px;
        left: -2px;
      }
    }
  }
  .bg-primary {
    background-color: fade(@primary-color, 10%);
  }
  .ivu-select-item {
    white-space: nowrap;
    word-break: keep-all;
  }
}
</style>
