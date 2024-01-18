<template>
  <div class="pl-nm pr-nm eoa-setting">
    <div class="flex-between setting">
      <div>
        <span class="text-grey">{{ $t('term.process.eoaautostart') }}</span>
        <Tooltip
          max-width="300"
          :content="$t('term.process.eoaautostarttip')"
          theme="light"
          placement="bottom"
          :transfer="true"
        >
          <span class="text-href tsfont-info-o"></span>
        </Tooltip>
      </div>
      <div>
        <TsFormSwitch v-model="isAutoStart"></TsFormSwitch>
      </div>
    </div>
    <div class="pb-sm">
      <div class="flex-between text-grey pb-xs">
        <div class="require-label">{{ $t('term.process.eoatemplate') }}</div>
        <div v-if="$AuthUtils.hasRole('EOA_BASE') && !$utils.isEmpty(templateIdList)" class="action-group"> 
          <span class="text-tip-active tsfont-edit" @click="editEoaTemplate()"></span>
          <span class="action-item tsfont-refresh" @click="refreshEoaTemplate()"></span>
        </div>
      </div>
      <div>
        <TsFormSelect
          ref="templateId"
          v-model="templateIdList"
          v-bind="templateConfig"
          @first="addTemplate()"
          @on-change="changeTemplateId"
        ></TsFormSelect>
      </div>
      <div v-for="(item,index) in eoaTemplateList" :key="index" class="template-list flex-between pt-sm">
        <div class="text-title overflow name">{{ item.name }}</div>
        <div class="text-href pl-sm" @click="editUser(item)">{{ $t('term.knowledge.approver') }}</div>
      </div>
    </div>
    <EditTemplateDialog
      v-if="isShowTemplateDialog"
      :allFormitemList="allFormitemList"
      :currentTemplate="currentTemplate"
      @close="close"
    ></EditTemplateDialog>
  </div>
</template>
<script>
import {store} from '@/views/pages/process/flow/flowedit/floweditState.js';
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    EditTemplateDialog: resolve => require(['./edit-template-dialog.vue'], resolve)
  },
  props: {
    eoaConfig: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      templateConfig: {
        dynamicUrl: '/api/rest/eoa/template/search',
        rootName: 'tbodyList',
        valueName: 'id',
        textName: 'name',
        dealDataByUrl: this.dealDataByUrl,
        multiple: true,
        firstLi: !!this.$AuthUtils.hasRole('EOA_BASE'),
        firstText: '模板',
        firstSelect: false,
        transfer: true,
        border: 'border',
        validateList: ['required']
      },
      isShowTemplateDialog: false,
      isAutoStart: 1,
      templateIdList: [],
      eoaTemplateList: [],
      currentTemplate: {}
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
    dealDataByUrl(list) {
      if (!this.$utils.isEmpty(this.eoaTemplateList)) {
        list.forEach(item => {
          let findItem = this.eoaTemplateList.find(e => e.id === item.id);
          if (findItem) {
            this.$set(findItem, 'name', item.name);
          }
        });
      }
      return list;
    },
    changeTemplateId(toValue, valueObject, selectItem) {
      let eoaTemplateList = [];
      if (!this.$utils.isEmpty(selectItem)) {
        selectItem.forEach(item => {
          let findItem = this.eoaTemplateList.find(e => e.id === item.id);
          if (findItem) {
            eoaTemplateList.push(findItem);
          } else {
            eoaTemplateList.push(item);
          }
        });
      }
      this.eoaTemplateList = eoaTemplateList;
    },
    editEoaTemplate() {
      window.open(HOME + '/process.html#/eoa-template-manage', '_blank');
    },
    refreshEoaTemplate() {
      this.$api.process.eoa.searchEoaTemplate({defaultValue: this.templateIdList}).then(res => {
        if (res.Status === 'OK') {
          let tbodyList = res.Return.tbodyList || [];
          if (tbodyList.length > 0) {
            tbodyList.forEach(item => {
              let findItem = this.eoaTemplateList.find(e => e.id === item.id);
              let mappingList = [];
              //更新步骤处理人，流程中只能更改eoa模板中未设置的步骤处理人
              if (findItem && !this.$utils.isEmpty(findItem.mappingList)) {
                if (item.config && item.config.stepList) {
                  let list = item.config.stepList.filter(s => {
                    return this.$utils.isEmpty(s.userList);
                  });
                  if (!this.$utils.isEmpty(list)) {
                    let idList = this.$utils.mapArray(list, 'id');
                    mappingList = findItem.mappingList.filter(m => {
                      return idList.includes(m.id);
                    });
                  }
                }
                this.$set(findItem, 'mappingList', mappingList);
              }
            });
          }
          this.$Message.success(this.$t('message.refreshsuccess'));
        }
      });
    },
    addTemplate() {
      window.open(HOME + '/process.html#/eoa-template-edit', '_blank');
    },
    editUser(item) {
      this.currentTemplate = item;
      this.isShowTemplateDialog = true;
    },
    close(list) {
      if (!this.$utils.isEmpty(list)) {
        let findItem = this.eoaTemplateList.find(item => item.id === this.currentTemplate.id);
        if (findItem) {
          let mappingList = [];
          list.forEach(item => {
            if (item.mappingMode && !this.$utils.isEmpty(item.valueList)) {
              mappingList.push({
                id: item.id,
                mappingMode: item.mappingMode,
                valueList: item.valueList ? (Array.isArray(item.valueList) ? item.valueList : [item.valueList]) : []
              });
            }
          });
          this.$set(findItem, 'mappingList', mappingList);
        }
      }
      this.isShowTemplateDialog = false;
    },
    valid() {
      let isValid = true;
      if (this.$refs.templateId) {
        isValid = this.$refs.templateId.valid();
      }
      return isValid;
    },
    getData() {
      let data = {
        isAutoStart: this.isAutoStart,
        eoaTemplateList: []
      };
      if (!this.$utils.isEmpty(this.eoaTemplateList)) {
        this.eoaTemplateList.forEach(item => {
          data.eoaTemplateList.push({
            id: item.id,
            mappingList: item.mappingList || []
          });
        });
      }
      return data;
    }
  },
  filter: {},
  computed: {
    allFormitemList() {
      return store.allFormitemList;
    }
  },
  watch: {
    eoaConfig: {
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          this.isAutoStart = val.isAutoStart;
          this.eoaTemplateList = val.eoaTemplateList || [];
          this.templateIdList = this.$utils.mapArray(this.eoaTemplateList, 'id');
        }
      },
      immediate: true,
      deep: true
    }
  }
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
