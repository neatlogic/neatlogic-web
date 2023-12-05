<template>
  <div class="pl-nm pr-nm eoa-setting">
    <div class="flex-between setting">
      <div>
        <span class="text-grey">自动创建签报</span>
        <Tooltip
          max-width="300"
          content="当处理人唯一、审批模板唯一，且审批模板中的每个审批步骤均已指定审批人时，自动创建签报"
          theme="light"
          placement="bottom"
          :transfer="true"
        >
          <span class="text-href tsfont-info-o"></span>
        </Tooltip>
      </div>
      <div>
        <TsFormSwitch v-model="eoaConfig.auto"></TsFormSwitch>
      </div>
    </div>
    <div class="pb-sm">
      <div class="flex-between text-grey pb-xs">
        <div class="require-label">EOA模板</div>
        <div class="action-group"> 
          <span class="tsfont-edit"></span>
          <span class="action-item tsfont-refresh"></span>
        </div>
      </div>
      <div>
        <TsFormSelect
          v-model="eoaConfig.template"
          v-bind="templateConfig"
        ></TsFormSelect>
      </div>
      <div v-for="(item,index) in templateList" :key="index" class="template-list flex-between pt-sm">
        <div class="text-title overflow name">{{ item.name }}</div>
        <div class="text-href pl-sm" @click="editUser(item)">审批人</div>
      </div>
    </div>
    <EditTemplateDialog v-if="isShowTemplateDialog" :allFormitemList="allFormitemList" @close="close"></EditTemplateDialog>
  </div>
</template>
<script>
import {store} from '@/views/pages/process/flow/flowedit/floweditState.js';
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    EditTemplateDialog: resolve => require(['./eoa/edit-template-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      eoaConfig: {
        auto: 1,
        template: []
      },
      templateConfig: {
        dynamicUrl: '/api/rest/universal/enum/get',
        params: { enumClass: 'neatlogic.framework.common.constvalue.DeviceType' },
        multiple: true,
        firstLi: true,
        firstText: '模板',
        firstSelect: false,
        transfer: true,
        border: 'border'
      },
      templateList: [
        {
          name: 'asdsaddddddddddddddddddddddddddddasdsadddddddddddddddddddddddddddd'
        },
        {
          name: 'dasdsadddddddddddddddddddddddddddd'
        }
      ],
      isShowTemplateDialog: false
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
    editUser() {
      this.isShowTemplateDialog = true;
    },
    close() {
      this.isShowTemplateDialog = false;
    }
  },
  filter: {},
  computed: {
    allFormitemList() {
      return store.allFormitemList;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.eoa-setting {
  .setting {
    height: 40px;
    line-height: 40px;
  }
  .template-list {
    .name {
      flex: 1;
    }
  }
}
</style>
