<template>
  <div class="bg-op padding env-example-radius">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div class="pb-nm">
      <TsRow>
        <Col :span="12">
          <ul class="action-group">
            <li v-if="hasEditConfigAuth" class="tsfont-plus text-href mt-sm text-action action-item" @click="openEnvInstanceEdit">{{ $t('page.instance') }}</li>
            <template v-else>
              <Tooltip
                max-width="400"
                placement="right"
                transfer
              >
                <span class="tsfont-plus text-disabled action-item">{{ $t('page.instance') }}</span>
                <ul slot="content">
                  <li>{{ $t('term.deploy.noconfigauthtip') }}</li>
                </ul>
              </Tooltip>
            </template>
            <li v-if="selectedInstanceIdList && selectedInstanceIdList.length > 0" class="tsfont-label text-href mt-sm text-action action-item" @click="batchAddBlueGreen">{{ $t('term.deploy.blueSet') }}</li>
          </ul>
        </Col>
        <Col :span="12">
          <InputSearcher
            v-if="hasInstance"
            v-model="keyword"
            :placeholder="$t('term.deploy.ipname')"
            @change="searchData"
          ></InputSearcher>
        </Col>
      </TsRow>
    </div>
    <div style="min-height: 200px;">
      <ul v-if="!hasInstance && hasEditConfigAuth" class="flex-center">
        <li>
          <span>{{ $t('term.deploy.notaddexampletip') }} </span>
          <span class="text-href" @click="openEnvInstanceEdit">{{ $t('dialog.title.addtarget', {target: $t('page.instance')}) }}</span>
        </li>
      </ul>
      <TsTable
        v-if="hasInstance"
        :tbodyList="tbodyList"
        :theadList="theadList"
        :multiple="true"
        @getSelected="getSelected"
      >
        <template slot="name" slot-scope="{ row }">
          <span v-if="row.name" class="text-href" @click.stop="toCiview(row)">{{ row.name }}</span>
        </template>
        <template slot="version" slot-scope="{ row }">
          <span v-if="row && row.version">{{ row.version }}</span>
          <span v-else>-</span>
        </template>
        <template slot="maintenanceWindow" slot-scope="{ row }">
          <span v-if="row.maintenanceWindow">{{ handleTimerange(row.maintenanceWindow) }}</span>
        </template>
        <template slot="blueGreenName" slot-scope="{ row }">
          <div v-if="row && row.blueGreenName">{{ row.blueGreenName }}({{ row.blueGreenSort }})</div>
          <div v-else>-</div>
        </template>
        <template slot="action" slot-scope="{ row }">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li class="tsfont-label text-action" @click="addBlueGreen(row)">{{ $t('term.deploy.blueSet') }}</li>
              <li class="tsfont-edit text-action" @click="editInstance(row)">{{ $t('page.edit') }}</li>
              <li class="tsfont-trash-o text-action" @click="deleteInstance(row)">{{ $t('page.delete') }}</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </div>
    <EnvInstanceEdit 
      v-if="isShowEnInstanceEdit" 
      :params="params" 
      :isEdit="isEdit" 
      :instanceData="instanceData"
      @close="closeEnvInstanceEdit"
    ></EnvInstanceEdit>
    <EnvInstanceBlueGreenDialog
      v-if="isShowInstanceBlueGreenDialog"
      :params="params"
      :instanceId="instanceId"
      :blueGreenId="blueGreenId"
      @close="closeInstanceBlueGreenDialog"
    ></EnvInstanceBlueGreenDialog>
    <EnvInstanceBlueGreenDialog
      v-if="isShowBatchInstanceBlueGreenDialog"
      :params="params"
      :instanceIdList="selectedInstanceIdList"
      @close="closeBatchInstanceBlueGreenDialog"
    ></EnvInstanceBlueGreenDialog>
  </div>
</template>
<script>
import handleTimeMixin from '../app/components/handleTimeMixin.js';
export default {
  name: '', // 实例列表
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    EnvInstanceEdit: () => import('./env-instance-edit'),
    EnvInstanceBlueGreenDialog: () => import('./env-instance-bluegreen-dialog.vue')

  },
  mixins: [handleTimeMixin],
  props: {
    params: {
      type: Object,
      default: function() {
        return {};
      }
    },
    hasEditConfigAuth: {
      // 是否有编辑配置权限
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      keyword: '',
      isShowEnInstanceEdit: false,
      hasInstance: false, // 是否添加有实例
      tbodyList: [],
      defaultTbodyList: [],
      theadList: [
        {
          key: 'selection'
        },
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('page.type'),
          key: 'typeLabel'
        },
        {
          title: this.$t('term.deploy.blueSet'),
          key: 'blueGreenName'
        },
        {
          title: this.$t('page.versions'),
          key: 'version'
        },
        {
          title: this.$t('page.ip'),
          key: 'ip'
        },
        {
          title: this.$t('page.port'),
          key: 'port'
        },
        {
          title: this.$t('page.maintenancewindow'),
          key: 'maintenanceWindow'
        },
        {
          title: '',
          key: 'action'
        }
      ],
      isShowInstanceBlueGreenDialog: false,
      isShowBatchInstanceBlueGreenDialog: false,
      instanceId: null,
      blueGreenId: null,
      selectedInstanceIdList: [],
      isEdit: false,
      instanceData: null,
      loadingShow: true
    };
  },
  beforeCreate() {},
  created() {
    this.searchEnvList();
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
    openEnvInstanceEdit() {
      this.isShowEnInstanceEdit = true;
    },
    closeEnvInstanceEdit(needRefresh) {
      this.isShowEnInstanceEdit = false;
      this.instanceData = null;
      this.isEdit = false;
      if (needRefresh) {
        this.searchEnvList();
      }
    },
    searchEnvList() {
      let params = {
        needPage: false,
        ...this.params
      };
      if (params) {
        this.loadingShow = true;
        this.$api.deploy.applicationConfig.getEnvInfo(params).then((res) => {
          if (res && res.Status == 'OK') {
            let {instanceList} = res.Return;
            this.tbodyList = [];
            this.defaultTbodyList = [];
            if (instanceList && instanceList.length > 0) {
              this.hasInstance = true;
              this.tbodyList = instanceList;
              this.defaultTbodyList = instanceList;
            }
          }
        }).finally(() => {
          this.loadingShow = false;
        });
      }
    },
    searchData() {
      // 实例列表，IP/名称查询
      if (this.keyword) {
        this.tbodyList = this.tbodyList.filter((item) => {
          return (item.ip && item.ip.indexOf(this.keyword) != -1) || (item.name && item.name.indexOf(this.keyword) != -1);
        });
      } else {
        this.tbodyList = this.defaultTbodyList;
      }
    },
    toCiview(row) {
      const {typeId, id} = row || {};
      window.open(HOME + '/cmdb.html#/ci/' + typeId + '/cientity-view/' + id, '_blank');
    },
    addBlueGreen(row) {
      this.instanceId = row.id;
      this.blueGreenId = row.blueGreenId;
      this.isShowInstanceBlueGreenDialog = true;
    },
    closeInstanceBlueGreenDialog(needRefresh) {
      this.searchEnvList();
      this.isShowInstanceBlueGreenDialog = false;
    },
    batchAddBlueGreen() {
      this.isShowBatchInstanceBlueGreenDialog = true;
    },
    closeBatchInstanceBlueGreenDialog(needRefresh) {
      if (needRefresh) {
        this.searchEnvList();
      }
      this.isShowBatchInstanceBlueGreenDialog = false;
    },
    editInstance(row) {
      this.isEdit = true;
      this.isShowEnInstanceEdit = true;
      this.instanceData = {
        ciId: row.typeId,
        id: row.id,
        name: row.name,
        ip: row.ip,
        port: row.port,
        maintenanceWindow: row.maintenanceWindow
      };
    },
    deleteInstance(row) {
      if (row) {
        let params = {
          appSystemId: this.params.appSystemId,
          appModuleId: this.params.appModuleId,
          envId: this.params.envId,
          instanceIdList: [
            row.id
          ]
        };
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.instance')}),
          btnType: 'error',
          'on-ok': vnode => {
            vnode.isShow = false;
            this.$nextTick(() => {
              this.$api.deploy.applicationConfig.deleteEnvInstance(params).then((res) => {
                if (res && res.Status == 'OK') {
                  this.$Message.success(this.$t('message.deletesuccess'));
                  this.searchEnvList();
                }
              });
            });
          }
        });
      }
    },
    getSelected(indexList, itemList) {
      this.selectedInstanceIdList = [];
      if (itemList && itemList.length > 0) {
        itemList.forEach(item => {
          this.selectedInstanceIdList.push(item.id);
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.env-example-radius {
  position: relative;
  height: calc(100vh - 50px - 50px - 32px - 16px);
  border-radius: 0 10px 10px;
}
</style>
