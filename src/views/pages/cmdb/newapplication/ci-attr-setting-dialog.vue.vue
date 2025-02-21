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
            <TsFormTree
              ref="formItem"
              v-model="item.ciName"
              v-bind="treeConfig"
            ></TsFormTree>
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
    TsFormTree: () => import('@/resources/plugins/TsForm/TsFormTree'),
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
      treeConfig: {
        url: '/api/rest/resourcecenter/resourcetype/tree',
        valueName: 'name',
        textName: 'label',
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
        this.tableSettingList.splice(index, 0, { ciName: '', fieldList: [] });
      } else {
        this.tableSettingList.push({ ciName: '', fieldList: [] });
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
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
