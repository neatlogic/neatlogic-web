<template>
  <div>
    <TsDialog v-if="attrData" v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig">
          <template v-slot:isRequired>
            <TsFormSwitch
              v-model="attrData.isRequired"
              :true-value="1"
              :false-value="0"
            ></TsFormSwitch>
          </template>
          <template v-slot:isUnique>
            <TsFormSwitch
              v-model="attrData.isUnique"
              :true-value="1"
              :false-value="0"
            ></TsFormSwitch>
          </template>
          <template v-slot:isSearchAble>
            <div>
              <TsFormSwitch
                v-model="attrData.isSearchAble"
                :true-value="1"
                :false-value="0"
              ></TsFormSwitch>
              <div class="text-grey">{{ $t('term.cmdb.searchablehelp') }}</div>
            </div>
          </template>
          <template v-slot:inputType>
            <div>
              <TsFormSwitch
                v-model="attrData.inputType"
                :true-value="'at'"
                :false-value="'mt'"
              ></TsFormSwitch>
              <div class="text-tip tips">{{ $t('message.cmdb.autoattr') }}</div>
            </div>
          </template>
          <template v-slot:type>
            <div>
              <RadioGroup v-model="attrData.type" :validateList="['required']" @on-change="toggleAttrType">
                <Radio
                  v-for="(attr, index) in attrTypeList"
                  :key="index"
                  style="width: 23%"
                  :label="attr.name"
                  :disabled="attr.disabled ? true : false"
                >
                  <i :class="attr.icon"></i>
                  <span>{{ attr.label }}</span>
                </Radio>
              </RadioGroup>
              <div v-if="isTypeError" class="text-error">{{ $t('form.placeholder.pleaseselect', { target: $t('page.type') }) }}</div>
            </div>
          </template>
          <template v-slot:attrConfig>
            <div v-if="handlers[attrData.type + 'attr']" class="ivu-form-item">
              <component
                :is="attrData.type + 'attr'"
                ref="handlerConfig"
                :config="attrData.config"
                :ciSimpleAttrList="ciSimpleAttrList"
                :ciId="ciId"
                :attrData="attrData"
                @setConfig="setConfig"
              ></component>
            </div>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import * as handlers from './attrhandler/config';

export default {
  name: '',
  components: {
    ...handlers,
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  props: {
    id: {
      type: Number
    },
    ciId: {
      type: Number
    }
  },
  data() {
    const _this = this;
    return {
      isTypeError: false,
      handlers: handlers,
      checkedBasicAttrList: [],
      ciSimpleAttrList: [], //目标模型的简单属性值
      isPropShow: false,
      attrData: {},
      propData: {},
      dialogConfig: {
        title: this.id ? this.$t('dialog.title.edittarget', { target: this.$t('page.attribute') }) : this.$t('dialog.title.addtarget', { target: this.$t('page.attribute') }),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      attrTypeList: [],
      formConfig: {
        id: {
          type: 'text',
          isHidden: true
        },
        name: {
          type: 'text',
          label: this.$t('page.uniquekey'),
          validateList: ['required', 'parameter'],
          maxlength: 25,
          onChange: function(value) {
            _this.$set(_this.attrData, 'name', value);
          }
        },
        label: {
          type: 'text',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: ['required'],
          onChange: function(value) {
            _this.$set(_this.attrData, 'label', value);
          }
        },
        type: {
          type: 'slot',
          label: this.$t('page.type')
        },
        targetCiId: {
          type: 'select',
          label: this.$t('term.cmdb.targetci'),
          url: 'api/rest/cmdb/ci/citype/search',
          validateList: ['required'],
          valueName: 'id',
          textName: 'label',
          childrenName: 'ciList',
          parentValueName: 'id',
          parentTextName: 'name',
          search: true,
          mode: 'group',
          transfer: true,
          showPath: true,
          isHidden: true,
          onChange: function(value) {
            _this.$set(_this.attrData, 'targetCiId', value);
            _this.getCiSimpleAttrList(value);
          }
        },
        attrConfig: {
          type: 'slot',
          label: this.$t('page.config'),
          hideLabel: true,
          isHidden: true
        },
        isRequired: {
          _belong: 'normal',
          type: 'slot',
          label: this.$t('page.isrequired')
        },
        isUnique: {
          _belong: 'normal',
          type: 'slot',
          label: this.$t('page.isunique')
        },
        inputType: {
          _belong: 'normal',
          type: 'slot',
          label: this.$t('page.autocollect')
        },
        isSearchAble: {
          _belong: 'normal',
          type: 'slot',
          isHidden: false,
          label: this.$t('term.cmdb.searchable')
        },
        groupName: {
          type: 'text',
          label: this.$t('page.attributegroup'),
          maxlength: 30,
          onChange: function(value) {
            _this.$set(_this.attrData, 'groupName', value);
          }
        },
        validatorId: {
          _belong: 'normal',
          transfer: true,
          type: 'select',
          label: this.$t('page.validate'),
          search: true,
          url: '/api/rest/cmdb/validator/search',
          params: { needPage: false },
          rootName: 'tbodyList',
          valueName: 'id',
          textName: 'name',
          onChange: function(value) {
            _this.$set(_this.attrData, 'validatorId', value);
          }
        },
        description: {
          type: 'textarea',
          label: this.$t('page.description'),
          maxlength: 200,
          onChange: function(value) {
            _this.$set(_this.attrData, 'description', value);
          }
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getAttrTypeList();
    this.getDataById();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    toggleNormalField(isHidden) {
      for (let k in this.formConfig) {
        if (this.formConfig[k]._belong === 'normal') {
          this.$set(this.formConfig[k], 'isHidden', isHidden);
        }
      }
    },
    getCiSimpleAttrList: function(ciId) {
      if (ciId) {
        this.$api.cmdb.ci.getAttrByCiId(ciId, { isSimple: true }).then(res => {
          this.ciSimpleAttrList = res.Return;
        });
      }
    },
    toggleAttrType(data) {
      this.$set(this.attrData, 'type', data);
      this.isTypeError = false;
      this.attrTypeList.forEach(item => {
        if (item.name === data) {
          this.attrData.needTargetCi = item.needTargetCi;
          this.attrData.needConfig = item.needConfig;
          this.attrData.canSearch = item.canSearch;
        }
      });
      this.initForm();
    },
    getAttrTypeList() {
      this.$api.cmdb.ci.getAttrTypeList().then(res => {
        this.attrTypeList = res.Return;
        let newData = [];

        if (this.id) {
          //如果是编辑，则禁用修改
          this.attrTypeList.forEach(item => {
            item.disabled = true;
          });
          this.attrTypeList.forEach(v => {
            newData.push({
              text: v.label,
              value: v.name,
              disabled: v.disabled
            });
          });
        } else {
          this.attrTypeList.forEach(v => {
            newData.push({
              text: v.label,
              value: v.name
            });
          });
        }
        //this.formConfig.type.dataList = newData;
      });
    },
    save: function() {
      const form = this.$refs['form'];
      const handlerConfig = this.$refs['handlerConfig'];
      if (!this.attrData.type) {
        this.isTypeError = true;
      }
      if (form.valid() && !this.isTypeError && (!handlerConfig || !handlerConfig.valid || handlerConfig.valid())) {
        this.attrData.ciId = this.ciId;
        this.$api.cmdb.ci.saveAttr(this.attrData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    initForm() {
      const id = this.formConfig.id.value;
      //不允许修改唯一标识
      if (id) {
        this.formConfig.name.disabled = true;
      } else {
        this.formConfig.name.disabled = false;
      }
      if (this.attrData.needTargetCi) {
        this.formConfig.targetCiId.isHidden = false;
      } else {
        this.formConfig.targetCiId.isHidden = true;
      }
      if (this.attrData.needConfig) {
        this.formConfig.attrConfig.isHidden = false;
      } else {
        this.formConfig.attrConfig.isHidden = true;
      }
      if (this.attrData.targetCiId) {
        this.getCiSimpleAttrList(this.attrData.targetCiId);
      }
      if (this.attrData.type == 'expression') {
        this.toggleNormalField(true);
      } else {
        this.toggleNormalField(false);
      }
      if (!this.attrData.canSearch) {
        this.$set(this.formConfig.isSearchAble, 'isHidden', true);
        this.attrData.isSearchAble = 0;
      } else {
        this.$set(this.formConfig.isSearchAble, 'isHidden', false);
      }
    },
    getDataById() {
      if (this.id) {
        this.$api.cmdb.ci.getAttrById(this.id).then(res => {
          if (res.Status == 'OK') {
            this.attrData = res.Return;
            for (let key in this.formConfig) {
              const element = this.formConfig[key];
              element.value = this.attrData[key];
            }
            this.initForm();
          }
        });
      } else {
        /* this.attrData = {};
        for (let key in this.formConfig) {
          const element = this.formConfig[key];
          element.value = this.attrData[key];
        }*/
        this.initForm();
      }
    },
    chooseProp: function() {
      this.isPropShow = true;
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
      //关闭弹窗之后置空属性
      this.propData = {};
      // this.attrData.
    },
    setConfig: function(data) {
      this.attrData.config = data;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.prop-icon {
  height: 50px;
  width: 50px;
  border-radius: 50px;
  padding-top: 12px;
}
</style>
