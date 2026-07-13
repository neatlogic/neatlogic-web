<template>
  <TsDialog
    v-bind="setting"
    :isShow="true"
    :loading="isSaveLoading"
    @on-close="close"
    @on-ok="save"
  >
    <div>
      <Tabs v-model="activeTab" :animated="false">
        <TabPane :label="$t('term.cmdb.assetlist')" name="tableSetting">
          <div>
            <Button class="mb-sm" @click="addData()">{{ $t('term.pbc.adddata') }}</Button>
          </div>
          <draggable
            v-if="tableSettingList && tableSettingList.length"
            class="clearfix"
            tag="div"
            :list="tableSettingList"
            handle=".move"
          >
            <div v-for="(item,index) in tableSettingList" :key="index" class="bg-op radius-sm mb-md">
              <div class="flex-between border-base-bottom padding-sm">
                <span
                  class="move tsfont-bar pr-xs"
                  :title="$t('term.cmdb.dragtosort')"
                  @click.stop
                ></span>
                <div>
                  <span class="text-action tsfont-plus pr-xs" @click="addData(index+1)"></span>
                  <span class="text-action tsfont-trash-o pr-xs" @click="deleteItem(index)"></span>
                  <span class="text-action" :class="item._isShow?'tsfont-down':'tsfont-up'" @click="toggleshow(item)"></span>
                </div>
              </div>
              <div class="padding-sm">
                <TsFormItem :label="$t('term.cmdb.assetlist')" labelPosition="left">
                  <TsFormSelect
                    ref="formItem"
                    v-model="item.viewName"
                    v-bind="viewConfig"
                    :dealDataByUrl="(nodeList)=>dealDataByViewList(nodeList, item.viewName)"
                    @on-change="(val)=>changeViewName(val, item)"
                  ></TsFormSelect>
                </TsFormItem>
                <div v-show="item._isShow">
                  <TsFormItem :label="$t('term.cmdb.tableheadattr')" labelPosition="left">
                    <div>
                      <Tag
                        v-for="(a,aindex) in assetTheadlist"
                        :key="aindex"
                        :checked="item.fieldList.includes(a.value)"
                        checkable
                        color="primary"
                        size="medium"
                        class="border-color tag"
                        @on-change="selectItem(a.value, item)"
                      >{{ a.text }}</Tag>
                    </div>
                    <div v-if="$utils.isEmpty(item.fieldList)" class="text-error">{{ $t('form.placeholder.pleaseselect',{'target':$t('page.attribute')}) }}</div>
                  </TsFormItem>
                  <template v-if="item.fieldList && item.fieldList.length > 0">
                    <Divider orientation="left" style="font-size: 14px">{{ $t('term.process.attrdragtip') }}</Divider>
                    <draggable
                      class="clearfix"
                      tag="div"
                      :list="item.fieldList"
                      handle=".move"
                    >
                      <Tag
                        v-for="value in item.fieldList"
                        :key="value"
                        :name="value"
                        closable
                        size="medium"
                        @on-close="handleClose(value, item)"
                      ><span class="move tsfont-bar"></span> {{ getAssetTheadLabel(value) }}</Tag>
                    </draggable>
                  </template>
                </div>
              </div>
            </div>
          </draggable>
        </TabPane>
        <TabPane v-if="moduleName" :label="$t('term.cmdb.managedapp')" name="visibleApp">
          <TsFormItem :labelWidth="0" label="" labelPosition="left">
            <TsFormSelect
              v-model="visibleAppSystemIdList"
              v-bind="visibleAppConfig"
            ></TsFormSelect>
            <div class="text-tip mt-xs">{{ $t('term.cmdb.managedappdisplaytip') }}</div>
          </TsFormItem>
        </TabPane>
      </Tabs>
    </div>
  </TsDialog>
</template>
<script>
import draggable from 'vuedraggable';

const ALL_APP_SYSTEM_ID = -1;
export default {
  name: '',
  components: {
    draggable,
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  filters: {},
  props: {
    moduleName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      id: null,
      config: {},
      tableSettingList: [],
      activeTab: 'tableSetting',
      setting: {
        title: this.$t('page.setting'),
        type: 'slider',
        width: 'medium'
      },
      viewConfig: {
        dynamicUrl: '/api/rest/resourcecenter/application/assetlist/view/list',
        rootName: 'tbodyList',
        placeholder: this.$t('form.placeholder.pleaseselect', { target: this.$t('page.model') }),
        transfer: true,
        showPath: true,
        search: true,
        border: 'border',
        validateList: ['required']
      },
      visibleAppConfig: {
        dynamicUrl: '/api/rest/resourcecenter/appsystem/list/forselect',
        rootName: 'tbodyList',
        textName: 'abbrName',
        valueName: 'id',
        dealDataByUrl: (nodeList) => this.dealVisibleAppList(nodeList),
        search: true,
        transfer: true,
        multiple: true,
        border: 'border',
        clearable: true,
        placeholder: this.$t('form.placeholder.pleaseselect', { target: this.$t('term.cmdb.app') })
      },
      isSaveLoading: false,
      assetTheadlist: [],
      visibleAppSystemIdList: []
    };
  },
  beforeCreate() {},
  created() {
    this.getAppAssetTheadlist();
    this.getApplicationlistSetting();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getApplicationlistSetting() {
      this.$api.cmdb.applicationManage.getApplicationlistSetting().then(res => {
        if (res.Status == 'OK' && res.Return) {
          this.id = res.Return.id || null;
          this.config = res.Return.config || {};
          this.tableSettingList = this.config.tableSettingList || [];
          this.syncVisibleAppSystemIdList();
          if (this.tableSettingList.length) {
            this.tableSettingList.forEach(item => {
              this.$set(item, '_isShow', true);
            }); 
          }
        }
      });
    },
    addData(index) {
      if (index) {
        this.tableSettingList.splice(index, 0, { viewName: '', fieldList: [], _isShow: true });
      } else {
        this.tableSettingList.push({ viewName: '', fieldList: [], _isShow: true });
      }
    },
    deleteItem(index) {
      this.tableSettingList.splice(index, 1);
    },
    close() {
      this.$emit('close');
    },
    save() {
      let formItems = this.$refs.formItem;
      let isValid = true;
      formItems.forEach(item => {
        if (item.valid && !item.valid()) {
          isValid = false;
        }
      });
      this.tableSettingList.forEach(item => {
        if (this.$utils.isEmpty(item.fieldList)) {
          isValid = false;
        } 
      });
      if (!isValid) {
        return;
      }
      this.isSaveLoading = true;
      let data = {
        config: {
          tableSettingList: this.tableSettingList
        }
      };
      if (this.id) {
        data.id = this.id;
      }
      if (this.moduleName) {
        const moduleVisibleAppSystemIdListMap = this.config.moduleVisibleAppSystemIdListMap || {};
        moduleVisibleAppSystemIdListMap[this.moduleName] = this.visibleAppSystemIdList || [];
        data.config.moduleVisibleAppSystemIdListMap = moduleVisibleAppSystemIdListMap;
      }
      this.$api.cmdb.applicationManage.saveApplicationlistSetting(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$emit('close', true);
        }
      }).finally(() => {
        this.isSaveLoading = false;
      });
    },
    dealVisibleAppList(nodeList) {
      return [{ id: ALL_APP_SYSTEM_ID, abbrName: this.$t('term.cmdb.allapps') }, ...(nodeList || [])];
    },
    dealDataByViewList(nodeList, viewName) {
      nodeList.forEach(item => {
        if (item.value !== viewName && this.tableSettingList.find(i => i.viewName == item.value)) {
          this.$set(item, '_disabled', true);
        } else {
          this.$set(item, '_disabled', false);
        }
      });
      return nodeList;
    },
    getAppAssetTheadlist() {
      this.$api.cmdb.applicationManage.getAppAssetTheadlist().then(res => {
        if (res.Status == 'OK' && res.Return) {
          this.assetTheadlist = res.Return.tbodyList || [];
        }
      }); 
    },
    changeViewName(val, item) {
      if (val) {
        this.$set(item, 'fieldList', this.$utils.mapArray(this.assetTheadlist, 'value'));
      } else {
        this.$set(item, 'fieldList', []);
      }
    },
    selectItem(value, item) {
      if (item.fieldList.includes(value)) {
        item.fieldList.splice(item.fieldList.indexOf(value), 1);
      } else {
        item.fieldList.push(value);
      }
    },
    handleClose(value, item) {
      item.fieldList.splice(item.fieldList.indexOf(value), 1); 
    },
    toggleshow(item) {
      this.$set(item, '_isShow', !item._isShow); 
    },
    syncVisibleAppSystemIdList() {
      const moduleVisibleAppSystemIdListMap = this.config.moduleVisibleAppSystemIdListMap || {};
      this.visibleAppSystemIdList = moduleVisibleAppSystemIdListMap[this.moduleName] || [];
    }
  },
  computed: {
    getAssetTheadLabel() {
      return (value) => {
        let label = '';
        this.assetTheadlist.forEach(item => {
          if (item.value == value) {
            label = item.text;
          }
        }); 
        return label;
      };
    }
  },
  watch: {
    visibleAppSystemIdList(val) {
      if (!Array.isArray(val) || val.length <= 1) {
        return;
      }
      if (val.includes(ALL_APP_SYSTEM_ID)) {
        const lastValue = val[val.length - 1];
        this.visibleAppSystemIdList = lastValue === ALL_APP_SYSTEM_ID ? [ALL_APP_SYSTEM_ID] : val.filter(item => item !== ALL_APP_SYSTEM_ID);
      }
    },
    moduleName() {
      this.syncVisibleAppSystemIdList();
    }
  }
};
</script>
<style lang="less" scoped>
.tag {
  border-width: 1px !important;
  border-style: solid !important;
  cursor: pointer;
}
.move {
  cursor: move;
}
</style>
