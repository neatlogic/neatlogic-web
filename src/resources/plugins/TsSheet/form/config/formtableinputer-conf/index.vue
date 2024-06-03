<template>
  <div>
    <TsFormItem :label="$t('term.pbc.adddata')" labelPosition="left" contentAlign="right">
      <TsFormSwitch
        v-model="config.isCanAdd"
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
                  <Checkbox v-model="data.config.isRequired" :disabled="disabled"></Checkbox>
                </td>
                <td v-if="!disabled">
                  <span v-if="data.isExtra" class="tsfont-setting text-action" @click="openAttrConfigDialog(data)"></span>
                  <span v-if="data.isExtra" class="ml-xs tsfont-plus-o text-action" @click="addExtraProperty()"></span>
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
      :formItemUuid="formItem.uuid"
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
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
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
  async created() {},
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
    addExtraProperty() {
      const index = this.config.dataConfig.filter(d => d.isExtra).length;
      this.config.dataConfig.push({
        uuid: this.$utils.setUuid(),
        label: this.$t('term.framework.extraattr') + '_' + (index + 1),
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
      });
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
  computed: {},
  watch: {
  }
};
</script>
<style lang="less" scoped>
/deep/ .ivu-checkbox-wrapper {
  margin-right: 0;
}
.th-setting {
  .title {
    display: flex;
  }
}

</style>
