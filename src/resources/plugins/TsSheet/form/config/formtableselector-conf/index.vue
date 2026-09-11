<template>
  <div>
    <template v-if="isTableInputer">
      <TsFormItem
        :label="$t('form.nestedSelector.saveData')"
        labelPosition="right"
        contentAlign="left"
        :tooltip="$t('form.nestedSelector.saveHelp')"
      >
        <TsFormSwitch
          :value="config.saveData !== false"
          :trueValue="true"
          :falseValue="false"
          :disabled="disabled"
          @on-change="changeSaveData"
        ></TsFormSwitch>
      </TsFormItem>
      <TsFormItem v-if="config.saveData !== false" :label="$t('form.nestedSelector.saveMode')" :labelPosition="isTableInputer ? 'right' : 'top'">
        <TsFormRadio
          :value="config.saveMode || 'selected'"
          :dataList="[{ value: 'selected', text: $t('form.nestedSelector.selected') }, { value: 'allMatched', text: $t('form.nestedSelector.allMatched') }]"
          :disabled="disabled"
          @on-change="changeSaveMode"
        ></TsFormRadio>
      </TsFormItem>
    </template>
    <TsFormItem :label="$t('page.disabledd')" :labelPosition="isTableInputer ? 'right' : 'left'" :contentAlign="isTableInputer ? 'left' : 'right'">
      <TsFormSwitch
        :value="config.disableAddData"
        :trueValue="true"
        :falseValue="false"
        :disabled="disabled"
        @on-change="(val)=>{
          $set(config, 'disableAddData', val);
        }"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('page.disabledelete')" :labelPosition="isTableInputer ? 'right' : 'left'" :contentAlign="isTableInputer ? 'left' : 'right'">
      <TsFormSwitch
        :value="config.disableDeleteData"
        :trueValue="true"
        :falseValue="false"
        :disabled="disabled"
        @on-change="(val)=>{
          $set(config, 'disableDeleteData', val);
        }"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem
      :label="$t('term.framework.hideheaderwhendataempty')"
      labelPosition="left"
      :contentAlign="isTableInputer ? 'left' : 'right'"
    >
      <TsFormSwitch
        v-model="config.hideHeaderWhenDataEmpty"
        :trueValue="true"
        :falseValue="false"
        :disabled="disabled"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.framework.selectmode')" :labelPosition="isTableInputer ? 'right' : 'left'" :contentAlign="isTableInputer ? 'left' : 'right'">
      <TsFormRadio v-model="config.mode" :dataList="modeList" :disabled="disabled || forceNormalMode"></TsFormRadio>
    </TsFormItem>
    <TsFormItem
      :label="$t('page.matrix')"
      :labelPosition="isTableInputer ? 'right' : 'top'"
      :validateList="['required']"
    >
      <div :class="[validClass('matrixUuid'), isTableInputer ? 'matrix-source' : 'radius-sm padding-md']">
        <TsFormSelect
          v-model="config.matrixUuid"
          v-bind="matrixConfig"
          :selectItemList.sync="selectMatrixConfig"
          :disabled="disabled"
          @first="$utils.matrixDataSourceRedirect()"
          @change="changeMatrixSource"
          @change-label="changeMatrixLabel"
        >
          <template v-slot:option="{item}">
            <div>{{ item.name }}<span v-if="item.type" class="text-grey cen-align">({{ item.type }})</span></div>
          </template>
        </TsFormSelect>
        <div v-if="!disabled" class="matrix-btn">
          <i
            v-if="config.matrixUuid"
            class="tsfont-edit pl-xs text-tip-active"
            :title="$t('page.edit')"
            @click="$utils.matrixDataSourceRedirect(config.matrixUuid, selectMatrixConfig)"
          ></i>
          <i class="tsfont-rotate-right pl-xs text-tip-active" :title="$t('page.refresh')" @click="refreshMatrixConfig(config.matrixUuid)"></i>
        </div>
      </div>
    </TsFormItem>
    <TsFormItem
      v-if="config.dataSource === 'matrix' && config.matrixUuid"
      :tooltip="$t('message.framework.matrixtip')"
      :label="$t('term.framework.matrixattr')"
      :labelPosition="isTableInputer ? 'right' : 'top'"
    >
      <div class="padding-md radius-md bg-block">
        <div class="tstable-container tstable-normal radius-lg">
          <table class="tstable-body">
            <thead>
              <tr>
                <th v-if="!disabled"></th>
                <th>{{ $t('page.attribute') }}</th>
                <th><i class="tsfont-desktop" :title="$t('term.framework.pcshowtd')"></i></th>
                <th><i class="tsfont-phone" :title="$t('term.framework.mbshowtd')"></i></th>
                <th><i class="tsfont-search" :title="$t('term.framework.searchcondition')"></i></th>
                <th></th>
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
                  <span class="tsfont-bar pr-xs" :title="$t('page.dragsort')" style="cursor:move"></span>
                </td>
                <td class="text-grey">
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
                <td><Checkbox v-model="data.isPC" :disabled="disabled"></Checkbox></td>
                <td><Checkbox v-model="data.isMobile" :disabled="disabled"></Checkbox></td>
                <td>
                  <div v-if="data.isSearchable == 1">
                    <Checkbox v-model="data.isSearch" :disabled="disabled"></Checkbox>
                  </div>
                </td>
                <td v-if="!disabled">
                  <span class="tsfont-setting text-action" @click="openAttrConfigDialog(data)"></span>
                  <span v-if="source !== 'scene' && data.isExtra" class="pl-xs tsfont-plus-o text-action" @click="addExtraProperty(index)"></span>
                  <span v-if="data.isExtra" class="pl-xs tsfont-close-o text-action" @click="removeExtraProperty(data)"></span>
                </td>
              </tr>
            </draggable>
          </table>
          <div v-if="source !== 'scene'" class="margin-sm" style="text-align:center">
            <Button style="width:100%" :disabled="disabled" @click="addExtraProperty()"><span class="tsfont-plus">{{ $t('term.framework.extraattr') }}</span></Button>
          </div>
        </div>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('term.cmdb.uniquerule')" :tooltip="$t('form.nestedSelector.uniqueHelp')" :labelPosition="isTableInputer ? 'right' : 'top'">
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
    <!-- <TsFormItem label="分页" :labelPosition="isTableInputer ? 'right' : 'left'" :contentAlign="isTableInputer ? 'left' : 'right'">
      <TsFormSwitch v-model="config.needPage" :trueValue="true" :falseValue="false"></TsFormSwitch>
    </TsFormItem>-->
    <TsFormItem
      :label="$t('page.pagesize')"
      :labelPosition="isTableInputer ? 'right' : 'top'"
    >
      <TsFormInput
        v-model="config.pageSize"
        :min="10"
        :max="100"
        type="number"
        :disabled="disabled"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem v-if="config.matrixUuid && selectMatrixConfig" :labelPosition="isTableInputer ? 'right' : 'top'" :label="$t('page.filtercondition')">
      <div class="bg-block padding-md radius-md" :class="validClass('sourceColumnList')">
        <DataSourceFilter
          v-model="config.sourceColumnList"
          :dataList="mappingDataList"
          :matrixUuid="config.matrixUuid"
          :matrixType="selectMatrixConfig.type"
          :disabled="disabled"
        ></DataSourceFilter>
      </div>
    </TsFormItem>
    <AttrConfigDialog
      v-if="isAttrConfigDialogShow && currentProperty"
      :formItemUuid="formItem.uuid"
      :isNeedTable="!isTableInputer"
      :formItemConfig="config"
      :property="currentProperty"
      :formItemList="formItemList"
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
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormCheckbox: () => import('@/resources/plugins/TsForm/TsFormCheckbox'),
    AttrConfigDialog: () => import('./formtableselector-attr-config-dialog.vue'),
    DataSourceFilter: () => import('../common/data-source-filter.vue')
  },
  extends: base,
  props: { isTableInputer: { type: Boolean, default: false } },
  data() {
    return {
      modeList: [
        { value: 'dialog', text: this.$t('term.framework.dialogmode') },
        { value: 'normal', text: this.$t('term.framework.normalmode') }
      ],
      dataSourceList: [
        { value: 'matrix', text: this.$t('page.matrix') },
        { value: 'integration', text: this.$t('page.integration') }
      ],
      isAttrConfigDialogShow: false,
      currentProperty: null,
      mappingDataList: [],
      matrixConfig: {
        dynamicUrl: '/api/rest/matrix/search',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'uuid',
        firstLi: true,
        firstText: this.$t('page.datasource'),
        transfer: true
      },
      selectMatrixConfig: null
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
    changeSaveData(value) {
      this.$set(this.config, 'saveData', value);
      this.$set(this.config, 'isUnique', false);
      if (!value) {
        this.$set(this.config, 'mode', 'normal');
        this.$set(this.config, 'isRequired', false);
        if (this.formItem.reaction) this.$delete(this.formItem.reaction, 'required');
      }
    },
    changeSaveMode(value) {
      this.$set(this.config, 'saveMode', value);
      if (value === 'allMatched') this.$set(this.config, 'mode', 'normal');
    },
    removeExtraProperty(data) {
      const index = this.config.dataConfig.findIndex(d => d === data);
      if (index > -1) {
        this.config.dataConfig.splice(index, 1);
      }
    },
    openAttrConfigDialog(data) {
      this.currentProperty = data;
      this.isAttrConfigDialogShow = true;
    },
    closeAttrConfigDialog(property) {
      if (property) {
        const index = this.config.dataConfig.findIndex(d => d === this.currentProperty);
        if (index > -1) {
          this.$set(this.config.dataConfig, index, property);
        }
      }
      this.currentProperty = null;
      this.isAttrConfigDialogShow = false;
    },
    //添加扩展属性
    addExtraProperty(index) {
      if (this.disabled) {
        return;
      }
      const newIndex = this.config.dataConfig.filter(d => d.isExtra).length + 1;
      const newProperty = {
        uuid: this.$utils.setUuid(),
        key: '',
        label: this.$t('term.framework.extraattr') + '_' + newIndex,
        isPC: true,
        isMobile: false,
        isSearch: false,
        isSearchable: 0,
        handler: 'formtext',
        isExtra: true,
        hasValue: true
      };
      if (!this.$utils.isEmpty(index)) {
        this.config.dataConfig.splice(index + 1, 0, newProperty);
      } else {
        this.config.dataConfig.push(newProperty);
      }
    },
    changeMatrixSource(matrixUuid) {
      this.$set(this.config, 'dataConfig', []);
      this.$set(this.config, 'sourceColumnList', []);
      if (this.isTableInputer) {
        // 切换或清空矩阵后，旧属性的唯一规则及联动过滤均失效；刷新同一矩阵不走此入口。
        this.$set(this.config, 'uniqueRuleConfig', []);
        if (this.formItem.reaction) this.$set(this.formItem.reaction, 'filter', {});
      }
      this.changeMatrix(matrixUuid);
    },
    changeMatrix(matrixUuid) {
      // 切换、清空或连续刷新都会使旧请求失效，旧响应不能修改属性或结束新请求的编辑状态。
      const requestVersion = this._matrixRequestVersion = (this._matrixRequestVersion || 0) + 1;
      const isCurrent = () => requestVersion === this._matrixRequestVersion && this.config.matrixUuid === matrixUuid && !this._isDestroyed && !this._isBeingDestroyed;
      if (matrixUuid) {
        //更新了矩阵需要重新刷新columnList,先把表单组件变成不就绪状态，等columnList加载完再重新改为就绪状态
        this.formItem.isEditing = true;
        this.tbodyList = [];
        return this.$api.framework.matrix.getMatrixAttributeByUuid({ matrixUuid: matrixUuid }).then(res => {
          if (!isCurrent()) return;
          //获取矩阵的属性
          const dataList = res.Return.tbodyList || [];
          //删除矩阵中不存在的值
          for (let i = this.config.dataConfig.length - 1; i >= 0; i--) {
            const data = this.config.dataConfig[i];
            if (!data.isExtra && !dataList.find(d => d.uniqueIdentifier === data.key)) {
              this.config.dataConfig.splice(i, 1);
            }
          }
          //补充矩阵新增的数据
          dataList.forEach(item => {
            let findItem = this.config.dataConfig.find(d => d.key === item.uniqueIdentifier);
            if (!findItem) {
              //矩阵的数据默认都是用formtext作为输入组件
              this.config.dataConfig.push({ uuid: this.$utils.setUuid(), matrixAttrUuid: item.uuid, key: item.uniqueIdentifier, label: item.name, isPC: true, isMobile: false, isSearch: false, isSearchable: item.isSearchable, handler: 'formtext', hasValue: true });
            } else {
              //唯一标识相同时，更新矩阵的属性数据
              const attrMapping = {
                label: 'name',
                isSearch: 'isSearch', 
                isSearchable: 'isSearchable'
              };
              Object.keys(findItem).forEach(key => {
                if (item.hasOwnProperty(attrMapping[key]) && !this.$utils.isSame(findItem[key], item[attrMapping[key]])) {
                  this.$set(findItem, key, item[attrMapping[key]]);
                }
              });
            }
          });
        }).catch(err => {
          if (!isCurrent()) return;
          //有异常时只保留扩展字段
          this.config.dataConfig = this.config.dataConfig.filter(d => d.isExtra);
        }).finally(() => {
          if (isCurrent()) this.$delete(this.formItem, 'isEditing');
        });
      }
      this.$delete(this.formItem, 'isEditing');
    },
    dealDataFilter(nodeList) {
      //处理矩阵数据为表单需要的数据结构
      let columlist = [];
      if (this.config.mapping.value && this.config.mapping.text && nodeList) {
        nodeList.forEach(d => {
          if (d[this.config.mapping.text]) {
            if (this.config.mapping.value != this.config.mapping.text) {
              columlist.push({
                text: d[this.config.mapping.text].text,
                value: d[this.config.mapping.value].value,
                html: d[this.config.mapping.text].text + "<small class='text-grey'>(" + d[this.config.mapping.value].text + ')</small>'
              });
            } else {
              columlist.push({
                text: d[this.config.mapping.text].text,
                value: d[this.config.mapping.value].value,
                html: d[this.config.mapping.text].text
              });
            }
          }
        });
      }
      return columlist;
    },
    changeMatrixLabel(label, item) {
      this.$set(this.config, 'matrixType', item.type);
    },
    refreshMatrixConfig(matrixUuid) {
      this.matrixConfig.dynamicUrl = '/api/rest/matrix/search?refuuid=' + this.$utils.setUuid();
      this.changeMatrix(matrixUuid);
      this.$Message.success(this.$t('message.refreshsuccess'));
    }
  },
  filter: {},
  computed: {
    forceNormalMode() {
      return this.isTableInputer && (this.config.saveData === false || this.config.saveMode === 'allMatched');
    },
    handleUniqueRuleConfigDataList() {
      let dataList = [];
      let {dataConfig = [] } = this.config;
      dataConfig.forEach(item => {
        let {isUnique = false} = item.config || {};
        if (isUnique) {
          dataList.push({ text: item.label, value: item.uuid });
        }
      });
      return dataList.length > 0 ? dataList : [];
    }
  },
  watch: {
    'config.matrixUuid': {
      handler: function(val) {
        // 过滤条件的可选属性单独加载，也必须忽略旧矩阵或已关闭面板的响应。
        const requestVersion = this._mappingRequestVersion = (this._mappingRequestVersion || 0) + 1;
        const isCurrent = () => requestVersion === this._mappingRequestVersion && this.config.matrixUuid === val && !this._isDestroyed && !this._isBeingDestroyed;
        this.mappingDataList = [];
        if (val) {
          return this.$api.framework.matrix.getMatrixAttributeByUuid({ matrixUuid: val }).then(res => {
            if (isCurrent() && res.Status == 'OK') {
              this.mappingDataList = res.Return.tbodyList;
            }
          }).catch(() => {
            if (isCurrent()) this.mappingDataList = [];
          });
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.table-inputer-config {
  .matrix-source {
    display: flex;
    align-items: center;
    gap: 8px;
    > :first-child {
      flex: 1;
      min-width: 0;
    }
    .matrix-btn {
      position: static;
      display: flex;
      flex-shrink: 0;
      align-items: center;
    }
  }
  > ::v-deep .ivu-form-item {
    margin-bottom: 16px;
    > .ivu-form-item-content {
      text-align: left;
      min-width: 0;
    }
  }
}

 ::v-deep .ivu-checkbox-wrapper {
  margin-right: 0;
}
.matrix-btn {
  position: absolute;
  right: 0;
  top: -30px;
}
</style>
