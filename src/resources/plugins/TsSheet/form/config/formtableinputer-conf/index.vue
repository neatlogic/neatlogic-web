<template>
  <div>
    <TsFormItem label="序号" labelPosition="left" contentAlign="right">
      <TsFormSwitch
        v-model="config.isShowNumber"
        :trueValue="true"
        :falseValue="false"
        :disabled="disabled"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem label="拖拽排序" labelPosition="left" contentAlign="right">
      <TsFormSwitch
        v-model="config.isCanDrag"
        :trueValue="true"
        :falseValue="false"
        :disabled="disabled"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem
      label="表头设置"
      labelPosition="top"
      required
    >
      <div class="padding-md radius-md" :class="validClass('dataConfig')">
        <div class="tstable-container tstable-normal radius-sm bg-block">
          <table class="tstable-body" width="100%">
            <thead>
              <tr>
                <th v-if="!disabled"></th>
                <th>属性</th>
                <th><i class="tsfont-desktop" title="PC端显示列"></i></th>
                <th><i class="tsfont-phone" title="移动端显示列"></i></th>
                <th>必填</th>
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
                  <span class="tsfont-bar mr-xs" title="拖动排序" style="cursor:move"></span>
                </td>
                <td class="text-grey overflow" :title="data.label">
                  <div class="overflow" style="width: 80px" :title="data.label">
                    {{ data.label }}
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
                  <span v-if="data.isExtra" class="ts-setting text-action" @click="openAttrConfigDialog(data)"></span>
                  <span v-if="data.isExtra" class="ml-xs tsfont-plus-o text-action" @click="addExtraProperty()"></span>
                  <span v-if="data.isExtra" class="ml-xs tsfont-close-o text-action" @click="removeExtraProperty(data)"></span>
                </td>
              </tr>
            </draggable>
          </table>
          <div v-if="$utils.isEmpty(config.dataConfig)" class="margin-sm">
            <span class="text-href tsfont-plus" @click="addExtraProperty()">添加数据</span>
          </div>
        </div>
      </div>
    </TsFormItem>
    <TsFormItem label="默认行数" labelPosition="top">
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
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    AttrConfigDialog: resolve => require(['./formtableinputer-attr-config-dialog.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
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
  mounted() {},
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
        label: '扩展属性_' + (index + 1),
        isPC: true,
        isMobile: false,
        isSearch: false,
        isSearchable: 0,
        handler: 'formtext',
        isExtra: true,
        hasValue: true,
        config: {
          isRequired: true
        }
      });
    }
  },
  filter: {},
  computed: {
    componentList() {
      const componentList = [];
      this.formItemList.forEach(d => {
        if (d.uuid != this.formItem.uuid && (d.handler === 'formselect' || d.handler === 'formradio' || d.handler === 'checkbox')) {
          componentList.push({ value: d.uuid, text: d.label });
        }
      });
      return componentList;
    }
  },
  watch: {
  }
};
</script>
<style lang="less" scoped>
/deep/ .ivu-checkbox-wrapper {
  margin-right: 0;
}
</style>
