<template>
  <div>
    <TsFormItem :label="$t('dialog.title.addtarget',{'target':$t('page.data')})" labelPosition="left" contentAlign="right">
      <TsFormSwitch
        v-model="config.isCanAdd"
        :trueValue="true"
        :falseValue="false"
        :disabled="disabled"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem
      labelWidth="250"
      :label="$t('term.framework.showimportexporttemplatetableoptions')"
      labelPosition="left"
      contentAlign="right"
      class="batch-operation-box"
    >
      <TsFormSwitch
        v-model="config.isShowImportExportBtn"
        :trueValue="true"
        :falseValue="false"
        :disabled="disabled"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('page.ordernumber')" labelPosition="left" contentAlign="right">
      <TsFormSwitch
        v-model="config.isShowNumber"
        :trueValue="true"
        :falseValue="false"
        :disabled="disabled"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('page.dragsort')" labelPosition="left" contentAlign="right">
      <TsFormSwitch
        v-model="config.isCanDrag"
        :trueValue="true"
        :falseValue="false"
        :disabled="disabled"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem
      :label="$t('term.framework.hideheaderwhendataempty')"
      labelPosition="left"
      contentAlign="right"
      labelWidth="180"
    >
      <TsFormSwitch
        v-model="config.hideHeaderWhenDataEmpty"
        :trueValue="true"
        :falseValue="false"
        :disabled="disabled"
      ></TsFormSwitch>
    </TsFormItem>
    <div class="th-setting pb-sm">
      <div class="title pb-sm">
        <div class="require-label pr-xs text-title">{{ $t('term.framework.thsetting') }}</div>
        <div v-if="formItem.hasOwnProperty('inherit') && !formItem.inherit" class="text-href">
          <span @click="updateTh()">{{ $t('term.framework.syncsceneattr') }}</span>
          <Tooltip
            theme="light"
            max-width="300"
            transfer
          >
            <i class="tsfont-info-o"></i>
            <div slot="content">{{ $t('message.framework.syncsceneattrtip') }}</div>
          </Tooltip>
        </div>
      </div>
      <div class="padding-md radius-md" :class="validClass('dataConfig')">
        <div class="tstable-container tstable-normal radius-sm bg-block">
          <table class="tstable-body" width="100%">
            <thead>
              <tr>
                <th v-if="!disabled"></th>
                <th>{{ $t('page.attribute') }}</th>
                <th><i class="tsfont-desktop" :title="$t('term.framework.pcshowtd')"></i></th>
                <th><i class="tsfont-phone" :title="$t('term.framework.mbshowtd')"></i></th>
                <th>{{ $t('page.require') }}</th>
                <th v-if="!disabled"></th>
              </tr>
            </thead>
            <draggable
              v-if="config.dataConfig && config.dataConfig.length > 0"
              tag="tbody"
              :list="config.dataConfig"
              handle=".tsfont-bar"
              class="tbody-main"
              ghost-class="li-active"
            >
              <tr v-for="(data, index) in config.dataConfig" :key="index" class="tstable-tr">
                <td v-if="!disabled">
                  <span class="tsfont-bar mr-xs" :title="$t('page.dragsort')" style="cursor:move"></span>
                </td>
                <td class="text-grey overflow" :title="data.label">
                  <div class="overflow" style="width: 80px" :title="data.label">
                    <Poptip
                      width="350"
                      trigger="hover"
                      :title="$t('page.exception')"
                      :disabled="!!data.key"
                      transfer
                    >
                      <span :class="!data.key? 'text-error' : ''"> {{ data.label }}</span>
                      <div slot="content">
                        {{ $t('form.validate.required',{'target':$t('page.englishname')}) }}
                      </div>
                    </Poptip>
                  </div>
                </td>
                <td>
                  <Checkbox v-model="data.isPC" :disabled="disabled"></Checkbox>
                </td>
                <td>
                  <Checkbox v-model="data.isMobile" :disabled="disabled"></Checkbox>
                </td>
                <td>
                  <Checkbox v-model="data.config.isRequired" :disabled="disabled || (data.handler === 'formtableselector' && data.config.saveData === false)"></Checkbox>
                </td>
                <td v-if="!disabled">
                  <span v-if="data.isExtra" class="tsfont-setting text-action" @click="openAttrConfigDialog(data)"></span>
                  <span v-if="source !== 'scene' && data.isExtra" class="ml-xs tsfont-plus-o text-action" @click="addExtraProperty(index)"></span>
                  <span v-if="data.isExtra" class="ml-xs tsfont-close-o text-action" @click="removeExtraProperty(data)"></span>
                </td>
              </tr>
            </draggable>
          </table>
          <div v-if="$utils.isEmpty(config.dataConfig)" class="margin-sm">
            <span class="text-href tsfont-plus" @click="addExtraProperty()">{{ $t('dialog.title.addtarget',{'target':$t('page.data')}) }}</span>
          </div>
        </div>
      </div>
    </div>
    <TsFormItem :label="$t('term.cmdb.uniquerule')" tooltip="根据属性设置，筛选出所有标记为'是否唯一'的属性，若选择下列属性配置多个字段的组合唯一性，则通过这些字段的组合来确保数据的唯一性；若未选择下列属性，则会单独对下列每个字段进行唯一性校验。" labelPosition="top">
      <TsFormCheckbox
        :value="config.uniqueRuleConfig"
        :dataList="handleUniqueRuleConfigDataList"
        class="checkbox-unique-rule-box"
        :disabled="disabled"
        @on-change="val => {
          setConfig('uniqueRuleConfig', val);
        }"
      ></TsFormCheckbox>
    </TsFormItem>
    <TsFormItem :label="$t('term.framework.defalinenum')" labelPosition="top">
      <TsFormInput
        :value="config.lineNumber"
        type="number"
        :disabled="disabled"
        @on-change="val => {
          setConfig('lineNumber', val);
        }"
      ></TsFormInput>
    </TsFormItem>
    <AttrConfigDialog
      v-if="isAttrConfigDialogShow && currentProperty"
      :formItemConfig="config"
      :property="currentProperty"
      :formItemList="formItemList"
      :initFormItemList="initFormItemList"
      :formItemUuid="formItem.uuid"
      :source="source"
      :extendConfigList="extendConfigList"
      @close="closeAttrConfigDialog"
    ></AttrConfigDialog>
  </div>
</template>
<script>
import base from '../base-config.vue';
import draggable from 'vuedraggable';

export default {
  name: '',
  components: {
    draggable,
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    AttrConfigDialog: () => import('./formtableinputer-attr-config-dialog.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormCheckbox: () => import('@/resources/plugins/TsForm/TsFormCheckbox')
  },
  extends: base,
  props: {},
  data() {
    return {
      isAttrConfigDialogShow: false,
      currentProperty: null,
      mappingDataList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (!this.config.hasOwnProperty('isCanAdd')) {
      this.$set(this.config, 'isCanAdd', true);
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    removeExtraProperty(data) {
      const index = this.config.dataConfig.findIndex(d => d === data);
      if (index > -1) {
        this.config.dataConfig.splice(index, 1);
      }
    },
    openAttrConfigDialog(data) {
      this.currentProperty = this.$utils.deepClone(data);
      this.isAttrConfigDialogShow = true;
    },
    closeAttrConfigDialog(property) {
      if (property) {
        const index = this.config.dataConfig.findIndex(d => d.uuid === property.uuid);
        if (index > -1) {
          this.$set(this.config.dataConfig, index, property);
        }
      }
      this.currentProperty = null;
      this.isAttrConfigDialogShow = false;
    },
    //添加扩展属性
    addExtraProperty(index) {
      const newIndex = this.config.dataConfig.length + 1;
      const newProperty = {
        uuid: this.$utils.setUuid(),
        label: this.$t('term.framework.extraattr') + '_' + newIndex,
        isPC: true,
        isMobile: false,
        isSearch: false,
        isSearchable: 0,
        handler: 'formtext',
        isExtra: true,
        hasValue: true,
        isDynamicValue: true,
        config: {
          isRequired: true
        }
      };
      if (!this.$utils.isEmpty(index)) {
        this.config.dataConfig.splice(index + 1, 0, newProperty);
      } else {
        this.config.dataConfig.push(newProperty);
      }
    },
    updateTh() {
      let itemConfig = this.initFormItemList.find(item => item.uuid === this.formItem.uuid);
      if (itemConfig && itemConfig.config) {
        itemConfig.config.dataConfig.forEach(th => {
          let findItem = this.config.dataConfig.find(d => d.uuid === th.uuid);
          if (!findItem) {
            this.config.dataConfig.push(th);
          }
        });
      }
    }
  },
  filter: {},
  computed: {
    handleUniqueRuleConfigDataList() {
      let dataList = [];
      let {dataConfig = [] } = this.config;
      dataConfig.forEach(item => {
        let {isUnique = false} = item.config || {};
        if (isUnique && item.handler !== 'formtableselector') {
          dataList.push({ text: item.label, value: item.uuid });
        }
      });
      return dataList.length > 0 ? dataList : [];
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
::v-deep .ivu-checkbox-wrapper {
  margin-right: 0;
}
.checkbox-unique-rule-box {
  ::v-deep .ivu-checkbox-wrapper {
    margin-right: 8px;
  }
}
.th-setting {
  .title {
    display: flex;
  }
}
.batch-operation-box {
  ::v-deep .text-tip-active {
    line-height: inherit;
  }
}

</style>
