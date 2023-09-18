<template>
  <div class="staticList-edit" :style="{width:setting.config.width}">
    <div v-if="!isReadonly" class="div-btn-contain">
      <i v-if="setting.config.isRequired" class="require-tip">*</i>
      <Button style="margin-right: 10px;" @click="addData(undefined)">添加数据</Button>
      <Button v-if="showRemoveBatch" @click="removeBatch">批量删除</Button>
    </div>
    <div class="tstable-container">
      <div v-if="setting.config.desc" class="component-tips tsfont-info-o">{{ setting.config.desc }}</div>
      <div v-if="formView">
        <table v-if="dataList.length > 0 || !isReadonly" class="table-list tstable-body">
          <thead v-if="setting.config.attributeList">
            <tr>
              <th v-if="!isReadonly" style="width:40px;text-align: center;">
                <div :class="['tstable-selection', { selected: isSelectAll }]" @click="selectAll"></div>
              </th>
              <th>
                <span>序号</span>
              </th>
              <th v-for="(attr, index) in setting.config.attributeList" :key="index">
                <span :class="{ 'require-label': attr.isRequired }">{{ attr.attribute }}</span>
              </th>
              <th v-if="!isReadonly"></th>
            </tr>
          </thead>
          <draggable
            v-if="dataList && dataList.length > 0"
            tag="tbody"
            :list="dataList"
            handle=".tsfont-bar"
            ghost-class="bg-primary"
          >
            <tr v-for="(data, oindex) in dataList" :key="oindex">
              <td v-if="!isReadonly" style="width:40px">
                <div class="div-check">
                  <div :class="['tstable-selection', { selected: data.isSelected }]" @click="selectIndex(oindex)"></div>
                </div>
              </td>
              <td>
                <div class="pt-sm">{{ oindex + 1 }}</div>
              </td>
              <td v-for="(attr, index) in data.config.attributeList" :key="index">
                <CellComponent :ref="'formComponent'+oindex+index" :setting="attr" :isReadonly="isReadonly"></CellComponent>
              </td>
              <td v-if="!isReadonly" style="width:40px">
                <div class="div-check div-btn">
                  <i class="tsfont-plus-o text-action text-grey" title="新增" @click="addData(oindex)"></i>
                  <i class="tsfont-close-o text-action text-grey" title="删除" @click="removeData(oindex)"></i>
                  <i class="tsfont-bar text-action text-grey" title="拖动"></i>
                </div>
              </td>
            </tr>
          </draggable>
        </table>
        <template v-else-if="isReadonly">-</template>
      </div>
      <transition name="fade">
        <span v-if="validMesage != ''" class="form-error-tip">{{ validMesage }}</span>
      </transition>
    </div>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
import viewmixin from '../viewmixin.js';
export default {
  name: 'Formstaticlist',
  components: {
    CellComponent: resolve => require(['./staticList-components.vue'], resolve),
    draggable
  },
  mixins: [viewmixin],
  props: {
    setting: Object,
    value: [Array, String, Object],
    isReadonly: Boolean,
    formView: {
      //是否通过form-view页面进行初始化，如果不是则需要把defaultValue值给 value
      type: Boolean,
      default: true
    },
    componentList: {
      //同一个表单的所有组件,主要用来做数据引用
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    let _this = this;
    return {
      preSetting: JSON.stringify(_this.setting),
      dataList: [],
      showDialog: false,
      validJson: ['required'],
      isSelectAll: false,
      showRemoveBatch: false,
      validMesage: '',
      selectUuidList: [],
      extendedData: {},
      detailData: {}
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
    updatethis: function(val) {
      this.$emit('update', val);
    },
    updateValue: function(val) {
      //从外部更新值
      let _this = this;
      _this.dataList = [];
      if (val) {
        this.extendedData = val.extendedData || {};
        this.selectUuidList = val.selectUuidList || [];
        this.detailData = val.detailData || {};
        if (Array.isArray(val)) {
          val.forEach(item => {
            let jsonArray = typeof item == 'string' ? JSON.parse(item) : item;
            let json = JSON.parse(this.preSetting);
            json.attributeUuid = this.$utils.setUuid(); //作为每行的唯一标识
            json.config.attributeList.forEach((attr, i) => {
              attr.attrConfig.value = jsonArray[i];
            });
            _this.dataList.push(json);
          });
        } else {
          let extendedData = val.extendedData || {};
          let selectUuidList = val.selectUuidList || [];
          !this.$utils.isEmptyObj(selectUuidList) && selectUuidList.forEach(key => {
            let json = JSON.parse(this.preSetting);
            json.attributeUuid = key; //作为每行的唯一标识
            !this.$utils.isEmptyObj(extendedData[key]) && Object.keys(extendedData[key]).forEach(td => {
              let jsonArray = extendedData[key][td];
              json.config.attributeList.forEach((attr, i) => {
                if (attr.attributeUuid == td) {
                  attr.attrConfig.value = jsonArray;
                }
              });
            });
            _this.dataList.push(json);
          });
        }
      }
      if (!this.isReadonly && (!val || !this.selectUuidList.length)) { //可编辑状态：当没有数据时，默认展示一行
        this.addData(undefined);
      }
    },
    getValue: function(val) {
      let arr = [];
      let _this = this;
      let objJson = {
        selectUuidList: [],
        extendedData: {},
        detailData: {}
      };
      if (this.dataList && this.dataList.length > 0) {
        this.dataList.forEach((item, oindex) => {
          let innerArr = [];
          item.config.attributeList &&
          item.config.attributeList.forEach((inner, index) => {
            let refItem = _this.$refs['formComponent' + oindex + index];
            if (inner.type == 'table' && refItem && refItem[0] && refItem[0].getValue) { //嵌套表格的value需要单独获取
              innerArr.push(refItem[0].getValue());
              inner.attrConfig.value = refItem[0].getValue();
            } else {
              innerArr.push(inner.attrConfig.value);
            }
          });
          arr.push(innerArr);
        });
        let newData = this.getStaticDetail(this.dataList);
        Object.keys(newData).forEach(key => {
          this.$set(objJson, key, newData[key]);
        });
      }
      return objJson;
    },
    validateValue: function() {
      let isVaild = true;
      this.validMesage = '';
      if (this.setting.config.isRequired && this.dataList <= 0) {
        this.validMesage = '列表长度不能为空';
        isVaild = false;
      }
      if (isVaild) {
        for (let key in this.$refs) {
          let item = this.$refs[key][0];
          item && !item.validateValue() && (isVaild = false);
        }
      }
      return isVaild;
    },
    addData(index) {
      //添加行
      let config = JSON.parse(this.preSetting);
      config.attributeUuid = this.$utils.setUuid(); //作为每行的唯一标识
      if (index !== undefined) {
        this.dataList.splice(index + 1, 0, config);
      } else {
        this.dataList.push(config);
      }
      this.validMesage = '';
    },
    removeBatch() {
      //批量删除行
      let array = [];
      this.dataList = this.dataList.filter(item => !item.isSelected);
      this.showRemoveBatch = false;
      this.isSelectAll = false;
      this.setting.config.isRequired && this.dataList.length <= 0 && (this.validMesage = '列表长度不能为空');
    },
    removeData(index) {
      //删除行
      this.dataList.splice(index, 1);
      this.setting.config.isRequired && this.dataList.length <= 0 && (this.validMesage = '列表长度不能为空');
    },
    selectIndex(index) {
      //选中一个
      this.$set(this.dataList[index], 'isSelected', !this.dataList[index].isSelected);
      let isSelectAll = true;
      this.showRemoveBatch = false;
      this.dataList.forEach(item => {
        if (!item.isSelected) {
          this.isSelectAll = false;
        } else {
          this.showRemoveBatch = true;
        }
      });
    },
    selectAll() {
      //选中一个
      let _this = this;
      if (this.isSelectAll) {
        this.isSelectAll = false;
        this.dataList.forEach(item => {
          _this.$set(item, 'isSelected', false);
        });
        this.showRemoveBatch = false;
      } else {
        this.isSelectAll = true;
        this.dataList.forEach(item => {
          _this.$set(item, 'isSelected', true);
        });
        this.showRemoveBatch = true;
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    value: {
      handler: function(newValue, oldValue) {
        this.updateValue(newValue);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.staticList-edit {
  .div-btn-contain {
    padding: 8px 0px;
  }
  .tstable-container {
    overflow: auto;
    border-top: 0px !important;
    .table-list {
      border-top: none;
      border-collapse: collapse;
      table-layout: fixed;
    }
    .table-list > thead,
    .table-list > thead > tr > th {
      visibility: visible !important;
      border: none !important;
      vertical-align: middle;
      height: 38px;
      padding-top: 0px;
      padding-bottom: 0px;
    }
    .table-list > tbody > tr > td {
      border-left: none !important;
      border-right: none !important;
      border-bottom: none !important;
      border-top: none !important;
      vertical-align: top;
    }
    .table-list {
      .div-check {
        padding-top: 6px;
      }
    }
    .div-btn {
      .text-action {
        margin-right: 5px;
        font-size: 15px;
      }
    }
    .bg-primary {
      background-color: fade(#1690ff, 10%);
    }
  }
}
.component-tips {
  text-align: left;
  font-size: 90%;
  opacity: 0.6;
  word-break: break-all;
  display: block;
  &:before {
    margin-right: 3px;
  }
}
</style>
