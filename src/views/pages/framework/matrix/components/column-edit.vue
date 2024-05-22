<template>
  <TsDialog
    type="modal"
    v-bind="dialogConfig"
    class-name="attributeDialog"
    :okBtnDisable="!matrixAttributeList || matrixAttributeList.length == 0"
    @on-close="close()"
    @on-ok="okAddMatrixAttribute"
  >
    <template>
      <div class="wrapper">
        <div class="item-left border-color">
          <div class="action-group">
            <div class="action-item tsfont-plus" @click="addAttribute">{{ $t('page.attribute') }}</div>
          </div>
          <div class="list">
            <div class="list-title">
              <div class="item-move">{{ $t('page.sort') }}</div>
              <div class="item-content">{{ $t('term.pbc.propertyname') }}</div>
            </div>
            <div v-if="matrixAttributeList.length > 0">
              <vuedraggable v-model="matrixAttributeList" :options="{ chosenClass: 'choose', animation: '150', handle: '.move' }">
                <transition-group>
                  <div
                    v-for="(item, index) in matrixAttributeList"
                    :key="item.uuid"
                    class="list-item"
                    :class="item.uuid == matrixAttributeSelectData.uuid ? 'active' : ''"
                    :index="index"
                    @click="matrixAttributeClick(item)"
                  >
                    <div class="item-move move">
                      <i class="tsfont-bar"></i>
                    </div>
                    <div class="item-content">{{ item.name }}</div>
                    <div v-if="item.isDeletable == 1" class="item-del tsfont-trash-o" @click.stop="removeAttribute(item.uuid)"></div>
                    <Tooltip
                      v-else
                      max-width="320"
                      theme="light"
                      placement="top"
                      transfer
                    >
                      <div class="item-del text-disabled tsfont-trash-o"></div>
                      <div slot="content">
                        <p>{{ $t('message.framework.keycanotdel') }}</p>
                        <p v-if="item.isDisabledDependency">{{ $t('message.framework.targetattrscanotdel', {target: item.name}) }}</p>
                      </div>
                    </Tooltip>
                  </div>
                </transition-group>
              </vuedraggable>
            </div>
            <div v-else>
              <no-data></no-data>
            </div>
          </div>
        </div>
        <div v-show="matrixAttributeList.length > 0" class="item-right">
          <TsForm ref="attributeDialogForm" :item-list="attributeDialogForm" :label-width="70"></TsForm>
          <div v-if="matrixAttributeSelectData && matrixAttributeSelectData.type == 'select'" class="dataList">
            <!-- start_静态数据源 -->
            <div class="static-main bg-op">
              <div class="input-border">
                <div class="static-title">
                  <label class="formsetting-label text-grey require-label" style="line-height: 1;margin-bottom: 8px;width: 148px;">{{ $t('page.value') }}</label>
                  <label class="formsetting-label text-grey require-label" style="line-height: 1;margin-bottom: 8px;width: 148px;">{{ $t('page.displaytext') }}</label>
                </div>
                <vuedraggable
                  v-if="dataList && dataList.length > 0"
                  tag="ul"
                  class="dataSource-ul"
                  :list="dataList"
                  handle=".tsfont-bar"
                  ghost-class="bg-primary"
                >
                  <li v-for="(item, index) in dataList" :key="index">
                    <Checkbox
                      v-model="item.defaultValue"
                      :true-value="1"
                      :false-value="0"
                      style="display: inline-block;padding-top:4px"
                      @on-change="defaultValueClick(arguments, item, index)"
                    ></Checkbox>
                    <TsFormInput
                      ref="inputValid"
                      v-model="item.value"
                      :placeholder="$t('form.placeholder.pleaseinput',{'target':$t('page.value')})"
                      style="width: 148px;padding-right: 5px;display: inline-block;vertical-align: top;"
                      maxlength="50"
                      :validate-list="validJson"
                      @on-blur="autocompleteText(item, index)"
                    ></TsFormInput>
                    <TsFormInput
                      ref="inputValid"
                      v-model="item.text"
                      :placeholder="$t('form.placeholder.pleaseinput',{'target':$t('page.displaytext')})"
                      style="width: 148px;display: inline-block;vertical-align: top;"
                      maxlength="50"
                      :validate-list="validJson"
                    ></TsFormInput>
                    <span class="tsfont-plus-o span-btn btn-add" :title="$t('page.new')" @click="addOption(index)"></span>
                    <span
                      v-if="dataList.length > 1"
                      class="tsfont-minus-o span-btn btn-remove"
                      :title="$t('page.delete')"
                      @click="removeOption(index)"
                    ></span>
                    <span v-if="dataList.length > 1" class="tsfont-bar span-btn btn-move" :title="$t('page.move')"></span>
                  </li>
                </vuedraggable>
              </div>
            </div>
            <!-- end_静态数据源 -->
          </div>
        </div>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    vuedraggable: () => import('vuedraggable'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue')
  },
  props: {
    matrixUuid: { type: String }
  },
  data() {
    const _this = this;
    return {
      dataList: [{ value: '', text: '' }],
      validJson: ['required'],
      matrixAttributeSelectData: [], //选中矩阵属性数据
      dialogConfig: {
        title: this.$t('page.attrsmanage'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      attributeDialogForm: [
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          maxlength: 20,
          width: '100%',
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {'target': this.$t('page.name')}) }, { name: 'name-special' }]
        },
        {
          type: 'text',
          name: 'uniqueIdentifier',
          label: this.$t('page.uniquekey'),
          maxlength: 50,
          width: '100%',
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {'target': this.$t('page.name')}) }, { name: 'key-special' }]
        },
        {
          type: 'select',
          name: 'type',
          label: this.$t('page.type'),
          width: '100%',
          url: '/api/rest/universal/enum/get?enumClass=neatlogic.framework.matrix.constvalue.MatrixAttributeType',
          transfer: true,
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.type')}) }, { name: 'name-special' }],
          onChange() {
            _this.dataList = [{ value: '', text: '' }];
          }
        }
        // {
        //   type: "switch",
        //   name: "isRequired",
        //   label: "必填",
        //   value: "0",
        // }
      ],
      matrixAttributeList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getMatrixAttribute();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    /*validComponent() {
      let _this = this;
      let validList = [];
      let val = [];
      let hasNull = false; //是否含有空的静态数据
      this.$refs.inputValid &&
        this.$refs.inputValid.forEach(item => {
          item.valid();
        });
      _this.dataList &&
        _this.dataList.forEach((item, a) => {
          if (item.value == '' && !hasNull) {
            hasNull = true;
            validList.push('静态数据源：值不可以为空');
          }
          if (item.text == '' && !hasNull) {
            hasNull = true;
            validList.push('静态数据源：显示值不可以为空');
          }
          if (item.isDefaultValue) {
            //默认选中数据处理
            val.push(item.value);
          }
        });
      return validList;
    },*/
    //新增下拉选项
    addOption(index) {
      this.dataList.splice(index + 1, 0, { value: '', text: '' });
    },
    //移除下拉选项
    removeOption(index) {
      this.$delete(this.dataList, index);
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    //属性列表点击
    matrixAttributeClick(item) {
      let validList = [];
      if (!this.$refs.attributeDialogForm.valid()) {
        validList.push(false);
      }
      if (this.$refs.inputValid != undefined) {
        this.$refs.inputValid.forEach(item => {
          if (!item.valid()) {
            validList.push(false);
          }
        });
      }
      if (validList.length > 0) {
        return;
      }
      this.matrixAttributeSelectData = item;
      this.formSetValue(item);
    },
    //确定添加属性
    okAddMatrixAttribute: function() {
      let validList = [];
      if (!this.$refs.attributeDialogForm.valid()) {
        validList.push(false);
      }
      if (this.$refs.inputValid != undefined) {
        this.$refs.inputValid.forEach(item => {
          if (!item.valid()) {
            validList.push(false);
          }
        });
      }
      if (validList.length > 0) {
        return;
      }
      //根据顺序调整sort属性
      this.matrixAttributeList.forEach((item, index) => {
        item.sort = index;
      });
      let data = {
        matrixUuid: this.matrixUuid,
        matrixAttributeList: this.matrixAttributeList
      };
      this.$api.framework.matrix.saveMatrixAttribute(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        }
      });
    },
    //默认值点击
    defaultValueClick(val, item, index) {
      item.defaultValue = val[0];
      if (val[0] == '1') {
        this.dataList.forEach((citem, cindex) => {
          if (cindex != index) {
            // citem.defaultValue = 0;
            this.$set(citem, 'defaultValue', 0);
          }
        });
      }
      //console.log(this.dataList);
    },
    //获取矩阵属性
    getMatrixAttribute: function() {
      let data = {
        matrixUuid: this.matrixUuid
      };
      return this.$api.framework.matrix.getMatrixAttributeByUuid(data).then(res => {
        if (res.Status == 'OK') {
          this.matrixAttributeList = res.Return.tbodyList;
          this.matrixAttributeList &&
            this.matrixAttributeList.forEach(async item => {
              if (item.uniqueIdentifier && item.uniqueIdentifier.length > 0) {
                this.$set(item, 'isNewUniqueIdentifier', false);
              } else {
                this.$set(item, 'isNewUniqueIdentifier', true);
              }
              // 补充是否被表单引用
              let isDisabledDependency = await this.$frameworkUtils.isDependency(item.uuid, 'matrixattr');
              if (isDisabledDependency) {
                this.$set(item, 'isDisabledDependency', isDisabledDependency);
              }
            });
          this.matrixAttributeSelectData = res.Return.tbodyList[0];
          if (res.Return.tbodyList[0] != undefined) this.formSetValue(res.Return.tbodyList[0]);
        }
      });
    },
    //失焦后，如果下拉显示为空，自动把值赋值过来
    autocompleteText(item, index) {
      let somevalue = 0;
      let value = item.value;
      if (value && !this.getDefaultValue(this.dataList, value, index)) {
        for (let a = 1; ; a++) {
          value = item.value + '_' + a;
          if (this.getDefaultValue(this.dataList, value)) {
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
    //判断是否有重复数据
    getDefaultValue(list, value, index) {
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
    },
    //新增属性
    addAttribute() {
      let key = null;
      if (this.matrixAttributeList.length > 0) {
        if (this.$refs.attributeDialogForm && !this.$refs.attributeDialogForm.valid()) {
          return;
          //key = false;
        } else {
          key = true;
        }
      } else {
        key = true;
      }
      if (key) {
        let data = {
          type: '',
          matrixUuid: this.matrixUuid,
          name: '',
          uuid: this.$utils.setUuid(),
          isDeletable: 1,
          isNewLabel: true,
          isNewUniqueIdentifier: true
          // isRequired:0
        };
        this.dataList = [{ value: '', text: '' }];
        this.matrixAttributeList.push(data);
        this.matrixAttributeSelectData = data;
        this.formSetValue(data);
      }
    },
    //删除属性
    removeAttribute(uuid) {
      this.matrixAttributeList.forEach((item, index) => {
        if (item.uuid == uuid) {
          this.matrixAttributeList.splice(index, 1);
        }
        //如果新增属性又删除了把选第一个属性选中
        if (this.matrixAttributeSelectData.uuid == uuid) {
          this.matrixAttributeSelectData = this.matrixAttributeList[0];
          this.formSetValue(this.matrixAttributeList[0]);
        }
      });
    },
    //表单赋值
    formSetValue(val) {
      if (this.matrixAttributeList.length > 0) {
        this.attributeDialogForm.forEach(item => {
          switch (item.name) {
            case 'name':
              item.value = val.name;
              break;
            case 'uniqueIdentifier':
              item.value = val.uniqueIdentifier;
              if (val.isNewUniqueIdentifier) {
                item.disabled = false;
              } else {
                item.disabled = true;
              }
              break;
            case 'type':
              item.value = val.type;
              if (val.isNewLabel) {
                item.disabled = false;
              } else {
                item.disabled = true;
              }
              break;
            // case 'isRequired':
            //   item.value = val.isRequired
            //   break;
          }
        });
        if (val.type == 'select' && val.config != undefined) {
          if (typeof val.config == 'string') {
            this.dataList = JSON.parse(val.config).dataList;
          } else {
            this.dataList = val.config.dataList;
          }
        }
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    dataList: {
      handler: function(newVal) {
        this.matrixAttributeList.forEach(item => {
          if (item.uuid === this.matrixAttributeSelectData.uuid && item.type == 'select') {
            item.config = {};
            item.config.dataList = JSON.parse(JSON.stringify(newVal));
          }
        });
      },
      deep: true
    },
    attributeDialogForm: {
      handler: function(newVal) {
        let obj = this.matrixAttributeList.find(d => d.uuid == this.matrixAttributeSelectData.uuid);
        if (obj != undefined) {
          newVal.forEach(item => {
            if (item.name == 'name') {
              obj.name = item.value;
            } else if (item.name == 'uniqueIdentifier') {
              obj.uniqueIdentifier = item.value;
            } else if (item.name == 'type') {
              obj.type = item.value;
            }
          });
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';

.attributeDialog {
  .wrapper {
    position: relative;
    display: flex;
    height: 100%;
    .item-left {
      width: 40%;
      border-right: 1px solid;
      height: 100%;
      overflow: auto;
      .list {
        margin-top: @space-md;
        .list-item {
          margin-bottom: 4px;
          &:hover {
            background: fade(@primary-hover-color, 10%);
          }
          padding: @space-xs @space-md;
          width: 100%;
          display: flex;
          cursor: pointer;
        }
        .list-title {
          padding: @space-xs @space-md;
          width: 100%;
          display: flex;
        }
        .item-move {
          width: 20%;
          cursor: ns-resize;
        }
        .item-content {
          width: 70%;
        }
        .item-del {
          width: 10%;
        }

        .active {
          background: fade(@primary-hover-color, 10%);
          color: @primary-color;
        }
      }
    }
    .item-right {
      width: 60%;
      padding: 0 @space-md;
      height: 100%;
      overflow: auto;
      .formsetting-label {
        line-height: 2.4;
        display: inline-block;
        &.label-switch {
          padding-right: 50px;
          width: 100%;
          display: inline-block;
          position: relative;
          .label-right {
            position: absolute;
            right: 0;
            top: 10px;
          }
        }
      }
      .dataList {
        .static-main {
          padding: @space-xs;
          .text-right {
            text-align: right;
          }
          .static-title {
            padding-left: 25px;
            padding-right: 70px;
            opacity: 0.6;
          }
          .dataSource-ul {
            list-style: none;
            > li {
              position: relative;
              padding-right: 70px;
              margin-bottom: 8px;
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
                  background: #fff;
                  border: 1px solid #ddd;
                  top: 8px;
                  left: 4px;
                }
                &:after {
                  width: 0;
                  height: 0;
                  background: #00bcd4;
                  top: 16px;
                  left: 12px;
                  transition: all 0.3s;
                  border: 1px solid #00bcd4;
                  opacity: 0;
                }
                &:hover {
                  &:before {
                    border-color: #00bcd4;
                  }
                }
                &.selected {
                  &:before {
                    border-color: #00bcd4;
                  }
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
                    &:before {
                      background: #00bcd4;
                    }
                    &:hover {
                      opacity: 0.8;
                    }
                  }
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
  }
}
</style>
