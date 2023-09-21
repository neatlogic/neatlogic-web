<template>
  <div class="selectContent input-border staticListSetting" style="height:300px">
    <!-- start_数据源 -->
    <TsFormItem label="数据源" :validateList="validJson" :labelWidth="100">
      <TsFormSelect
        v-model="setting.dataSource"
        :dataList="dataSourceList"
        :validateList="validJson"
        width="82%"
        @on-change="changeDataSource"
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem v-if="setting.dataSource == 'static'" :labelWidth="100">
      <div style="width:82%">
        <div class="static-title">
          <label class="text-grey require-label" style="width: 110px;">值</label>
          <label class="text-grey require-label" style="width: 130px;">显示文字</label>
        </div>

        <draggable
          v-if="setting.dataList && setting.dataList.length > 0"
          tag="ul"
          :class="['dataSource-ul', { 'multiple-ul': isMultiple == true }]"
          :list="setting.dataList"
          handle=".tsfont-bar"
          ghost-class="bg-primary"
        >
          <li v-for="(item, index) in setting.dataList" :key="index">
            <div :class="['imitate-radio', 'border-color', { selected: !!item.isDefaultValue }]" @mousedown="setDefaultvalue(item, index)"></div>
            <TsFormInput
              v-model="item.value"
              :validateList="validJson"
              placeholder="请输入值"
              style="width: 110px;padding-right: 5px;"
              maxlength="50"
              @on-blur="autocompleteText(item, index)"
            ></TsFormInput>
            <TsFormInput
              v-model="item.text"
              :validateList="validJson"
              placeholder="请输入显示文字"
              style="width: 130px;"
              maxlength="50"
            ></TsFormInput>
            <span
              v-if="setting.dataList.length <= 500"
              class="tsfont-plus-o span-btn btn-add"
              title="新增"
              @click="addOption(index)"
            ></span>
            <span
              v-if="setting.dataList.length > 1"
              class="tsfont-minus-o span-btn btn-remove"
              title="删除"
              @click="removeOption(index)"
            ></span>
            <span v-if="setting.dataList.length > 1" class="tsfont-bar span-btn btn-move" title="移动"></span>
          </li>
        </draggable>
      </div>
    </TsFormItem>
    <TsForm
      v-else-if="setting.dataSource == 'matrix'"
      ref="matrixForm"
      :itemList="matrixJson"
      width="80%"
    >
      <template v-slot:matrixUuid>
        <div>
          <TsFormSelect
            ref="matrixUuid"
            v-model="matrixJson.matrixUuid.value"
            v-bind="matrixJson.matrixUuid"
            :selectItemList.sync="dataSourceJson"
            style="display: inline-block;width:82%"
            @on-change="changeMatrix(matrixJson.matrixUuid.value)"
          >
            <template v-slot:first-ul>
              <li class="tsfont-plus text-href first-slot" @click="$utils.matrixDataSourceRedirect()">数据源</li>
            </template>
          </TsFormSelect>
          <i
            v-if="matrixJson.matrixUuid.value"
            class="tsfont-edit text-tip-active"
            title="编辑选中数据源"
            @click="$utils.matrixDataSourceRedirect(matrixJson.matrixUuid.value, dataSourceJson)"
          ></i>
          <i class="tsfont-refresh text-tip-active" title="刷新数据源" @click="refreshDataSource()"></i>
        </div>
      </template>
    </TsForm>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsFormItem from '@/resources/plugins/TsForm/TsFormItem';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import TsForm from '@/resources/plugins/TsForm/TsForm';
export default {
  name: 'DataSource',
  components: {
    draggable,
    TsForm,
    TsFormItem,
    TsFormInput,
    TsFormSelect
  },
  props: {
    setting: Object,
    isMultiple: Boolean
  },

  data() {
    let _this = this;
    return {
      validJson: ['required'],
      dataSourceJson: null,
      dataSourceList: [
        { value: 'static', text: '静态数据源' },
        { value: 'matrix', text: '矩阵数据源' }
      ],
      matrixJson: {
        matrixUuid: {
          label: '矩阵',
          type: 'slot',
          value: '',
          dynamicUrl: '/api/rest/matrix/search',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'uuid',
          validateList: ['required'],
          transfer: true,
          labelWidth: '100'
        },
        valueName: {
          label: '值',
          type: 'select',
          value: '',
          dataList: _this.mappingDataList,
          validateList: ['required'],
          valueName: 'uuid',
          textName: 'name',
          transfer: true,
          errorMessage: '',
          labelWidth: '100',
          width: '82%'
        },
        textName: {
          label: '显示文字',
          type: 'select',
          value: '',
          dataList: _this.mappingDataList,
          validateList: ['required'],
          valueName: 'uuid',
          textName: 'name',
          transfer: true,
          labelWidth: '100',
          width: '82%'
        }
      }
    };
  },
  created() {
    this.initSetting();
  },
  mounted() {},
  destroyed() {},
  methods: {
    initSetting() {
      //初始化数据
      let _this = this;
      if (this.setting.dataSource == 'matrix') {
        this.matrixJson.matrixUuid.value = this.setting.matrixUuid;
        this.matrixJson.textName.value = this.setting.mapping.text;
        this.matrixJson.valueName.value = this.setting.mapping.value;

        if (_this.setting.matrixUuid) {
          this.$api.framework.matrix
            .getMatrixAttributeByUuid({ matrixUuid: _this.setting.matrixUuid })
            .then(res => {
              if (res.Status == 'OK') {
                _this.mappingDataList = res.Return.tbodyList || [];
                _this.matrixJson.textName.dataList = _this.mappingDataList;
                _this.matrixJson.valueName.dataList = _this.mappingDataList;
              }
            })
            .catch(error => {
              this.$Notice.error({ title: error.data.Message });
            });
        }
      }
    },
    addOption(index) {
      //新增下拉选项
      this.setting.dataList.splice(index + 1, 0, { value: '', text: '' });
    },
    removeOption(index) {
      //移除下拉选项
      this.$delete(this.setting.dataList, index);
    },

    autocompleteText(item, index) {
      //失焦后，如果下拉显示为空，自动把值赋值过来
      let somevalue = 0;
      let value = item.value;

      if (value && !getDefaultValue(this.setting.dataList, value, index)) {
        for (let a = 1; ; a++) {
          value = item.value + '_' + a;
          if (getDefaultValue(this.setting.dataList, value)) {
            break;
          }
        }
      }

      item.value = value;

      if (!item.text && item.value) {
        item.text = item.value;
      }
      this.$forceUpdate();
    },
    changeDataSource() {
      //改变数据源
      this.setting.dataList = [{ value: '', text: '' }];
      this.setting.mapping = { text: '', value: '' };
      this.setting.matrixUuid = '';
      this.setting.defaultValue = '';
    },
    changeMapping() {
      let _this = this;
      if (this.matrixJson.matrixUuid.value && this.matrixJson.textName.value && this.matrixJson.valueName.value) {
        let params = { matrixUuid: _this.matrixJson.matrixUuid.value, textField: _this.matrixJson.textName.value, valueField: _this.matrixJson.valueName.value };
        this.$api.framework.matrix.getMatrixDataForSelect(params).then(res => {
          if (res.Status == 'OK' && !res.Return.isRepeat) {
            _this.$set(_this.matrixJson.valueName, 'errorMessage', '');
          } else if (res.Status == 'OK' && res.Return.isRepeat) {
            _this.$set(_this.matrixJson.valueName, 'errorMessage', '属性列存在相同数据');
          }
        });
      }
    },
    changeMatrix(val) {
      let _this = this;
      this.setting.mapping = { value: '', text: '' };
      if (val) {
        this.$api.framework.matrix
          .getMatrixAttributeByUuid({ matrixUuid: val })
          .then(res => {
            if (res.Status == 'OK') {
              _this.mappingDataList = res.Return.tbodyList || [];
              _this.matrixJson.textName.dataList = _this.mappingDataList;
              _this.matrixJson.valueName.dataList = _this.mappingDataList;
            }
          })
          .catch(error => {
            this.$Notice.error({ title: error.data.Message });
          });
      }
    },
    refreshDataSource() {
      //刷新数据源
      this.matrixJson.matrixUuid.dynamicUrl = '/api/rest/matrix/search?refuuid=' + this.$utils.setUuid();
      if (this.matrixJson.matrixUuid.value) {
        let _this = this;
        this.$api.framework.matrix
          .getMatrixAttributeByUuid({ matrixUuid: this.matrixJson.matrixUuid.value })
          .then(res => {
            if (res.Status == 'OK') {
              _this.mappingDataList = res.Return.tbodyList || [];
              _this.matrixJson.textName.dataList = _this.mappingDataList;
              _this.matrixJson.valueName.dataList = _this.mappingDataList;
              this.$Message.success('刷新成功');
            }
          })
          .catch(error => {
            this.$Notice.error({ title: error.data.Message });
          });
      }
    },
    setDefaultvalue(item, index) {
      //设置默认值
      if (item && item.value) {
        item.isDefaultValue = !item.isDefaultValue;
        if (!this.isMultiple) {
          //单选
          this.setting.dataList.forEach((ary, i) => {
            if (index != i && ary.isDefaultValue) {
              ary.isDefaultValue = false;
            }
          });
        }
        this.$forceUpdate();
      }
    },
    getDefaultvalue() {
      let defaultValue = '';
      let _this = this;
      this.isMultiple && (defaultValue = []);
      this.setting.dataList &&
        this.setting.dataList.forEach(item => {
          item.isDefaultValue && (_this.isMultiple ? defaultValue.push(item.value) : (defaultValue = item.value));
        });
      this.setting.defaultValue = defaultValue;
      this.setting.value = defaultValue;
    },
    validComponent() {
      let _this = this;
      let componet = [
        // { ref: "url", message: "接口地址:请填写正确的格式" },
        { ref: 'valueName', message: '字段映射:值不能为空' },
        { ref: 'textName', message: '字段映射:显示文案不能为空' }
      ];
      let isValid = true;
      let hasNull = false;
      componet.forEach(item => {
        _this.$refs[item.ref] && !_this.$refs[item.ref].valid() && validList.push(item.message);
      });
      //当数据源选择静态数据源时

      if (_this.setting.dataSource == 'static') {
        for (let a = 0; a < _this.setting.dataList.length; a++) {
          let item = _this.setting.dataList[a];
          if (item.value == '' && !hasNull) {
            hasNull = true;
            isValid = false;
            this.$Message.error('值不可以为空');
            break;
          }
          if (item.text == '' && !hasNull) {
            hasNull = true;
            isValid = false;
            this.$Message.error('显示值不可以为空');
            break;
          }
        }
        this.$utils.validForm(_this.$el);
        this.getDefaultvalue(); //获取默认值
      } else if (_this.setting.dataSource == 'matrix' && this.$refs.matrixForm) {
        isValid = this.$refs.matrixForm.valid();
        if (isValid) {
          let data = this.$refs.matrixForm.getFormValue();
          this.setting.matrixUuid = data.matrixUuid;
          this.setting.mapping.text = data.textName;
          this.setting.mapping.value = data.valueName;
        }
      }
      return isValid;
    }
  },
  computed: {},
  watch: {}
};

function getDefaultValue(list, value, index) {
  //判断是否有重复数据
  let isDefaultValue = true;
  for (let i = 0; i < list.length; i++) {
    if (typeof index != 'undefined' && index != i && list[i].value == value) {
      isDefaultValue = false;
      break;
    } else if (typeof index == 'undefined' && list[i].value == value) {
      isDefaultValue = false;
      break;
    }
  }
  return isDefaultValue;
}
</script>
<style lang="less" scoped>
@import  '~@/resources/assets/css/process/formcomponent.less';
.staticListSetting {
  .static-title {
    padding-left: 25px;
    > label {
      line-height: 1;
      margin-bottom: 8px;
      display: inline-block;
    }
  }
  .dataSource-ul {
    list-style: none;
    > li {
      position: relative;
      padding-right: 70px;
      margin-bottom: 8px;
      padding-left: 25px;
      .imitate-radio {
        width: 24px;
        height: 30px;
        position: absolute;
        top: 0;
        left: 0;
        cursor: pointer;
        &:before,
        &:after {
          content: '';
          position: absolute;
          border-radius: 50%;
        }
        &:before {
          width: 16px;
          height: 16px;
          border: 1px solid;
          border-color: inherit;
          top: 8px;
          left: 4px;
        }
        &:after {
          width: 0;
          height: 0;
          top: 16px;
          left: 12px;
          transition: all 0.3s;
          opacity: 0;
        }
        &.selected {
          &:after {
            width: 8px;
            height: 8px;
            top: 12px;
            left: 8px;
            opacity: 1;
          }
        }
      }
      .span-btn {
        width: 20px;
        height: 28px;
        line-height: 28px;
        text-align: center;
        position: absolute;
        top: 2px;
        right: 0;
        cursor: ns-resize;
        vertical-align: middle;
        &.btn-add {
          right: 40px;
          cursor: pointer;
        }
        &.btn-remove {
          right: 20px;
          cursor: pointer;
        }
      }
     >div{
        display:inline-block;
        vertical-align: top;
      }
    }
    &.multiple-ul {
      > li {
        .imitate-radio {
          &:before,
          &:after {
            border-radius: 0;
          }
          &:after {
            border-radius: 2px;
            background: transparent;
            border-width: 3px;
            height: 10px;
            width: 6px;
            border-top: 0 none;
            border-left: 0 none;
            transform: rotate(45deg);
            top: 10px;
            left: 9px;
            border-color: #fff;
          }
          &.selected {
            &:hover {
              opacity: 0.8;
            }
          }
        }
      }
    }
  }
  .bg-primary {
    background-color: fade(@primary-color, 10%);
  }
}
.text-tip-active {
  padding: 0px 3px;
  margin-left: 5px;
}

</style>
