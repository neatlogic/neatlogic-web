<template>
  <TsDialog
    v-bind="setting"
    :isShow="true"
    :loading="isSaveLoading"
    @on-close="close"
    @on-ok="save"
  >
    <div>
      <div>
        <Button class="mb-sm" @click="addData()">{{ $t('term.pbc.adddata') }}</Button>
      </div>
      <div v-for="(item,index) in tableSettingList" :key="index" class="pb-xs">
        <TsRow :gutter="8">
          <Col span="10">
            <TsFormSelect
              ref="formItem"
              v-model="item.viewName"
              v-bind="viewConfig"
              :dealDataByUrl="(nodeList)=>dealDataByViewList(nodeList, item.viewName)"
            ></TsFormSelect>
          </Col>
          <Col span="12">
            <TsFormSelect
              ref="formItem"
              v-model="item.fieldList"
              v-bind="attrConfig"
              class="mr-sm"
            ></TsFormSelect>
          </Col>
          <Col span="2">
            <span class="text-action tsfont-plus pr-xs" @click="addData(index+1)"></span>
            <span class="text-action tsfont-minus" @click="deleteItem(index)"></span>
          </Col>
        </TsRow>
      </div>
    </div>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  filters: {},
  props: {
   
  },
  data() {
    return {
      id: null,
      config: {},
      tableSettingList: [],
      setting: {
        title: '设置',
        width: 'medium'
      },
      viewConfig: {
        dynamicUrl: '/api/rest/resourcecenter/application/assetlist/view/list',
        rootName: 'tbodyList',
        placeholder: '选择模型',
        transfer: true,
        showPath: true,
        search: true,
        border: 'border',
        validateList: ['required']
      },
      attrConfig: {
        url: '/api/rest/resourcecenter/assetlist/theadlist',
        rootName: 'tbodyList',
        textName: 'text',
        valueName: 'value',
        placeholder: '选择表头字段',
        multiple: true,
        transfer: true,
        border: 'border',
        validateList: ['required']
      },
      isSaveLoading: false
    };
  },
  beforeCreate() {},
  created() {
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
        if (res.Status == 'OK') {
          this.id = res.Return.id || null;
          this.config = res.Return.config || {};
          this.tableSettingList = this.config.tableSettingList || [];
        }
      });
    },
    addData(index) {
      if (index) {
        this.tableSettingList.splice(index, 0, { viewName: '', fieldList: [] });
      } else {
        this.tableSettingList.push({ viewName: '', fieldList: [] });
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
      this.$api.cmdb.applicationManage.saveApplicationlistSetting(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$emit('close', true);
        }
      }).finally(() => {
        this.isSaveLoading = false;
      });
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
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
