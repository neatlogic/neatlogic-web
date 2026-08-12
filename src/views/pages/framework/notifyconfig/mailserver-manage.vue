<template>
  <div>
    <div class="action-group pb-sm">
      <span class="action-item tsfont-plus" @click="addMailServer()">{{ $t('page.add') }}</span>
    </div>
    <TsTable v-if="true" :theadList="theadList" v-bind="tableData">
      <template slot="isActive" slot-scope="{ row }">
        <i-switch
          :key="row.token"
          v-model="row.isActive"
          :true-value="1"
          :false-value="0"
          @on-change="handleIsActiveSwitchChange(row)"
        ></i-switch>
      </template>
      <template slot="isDefault" slot-scope="{ row }">
        <i-switch
          :key="row.token"
          v-model="row.isDefault"
          :true-value="1"
          :false-value="0"
          @on-change="handleIsDefaultSwitchChange(row)"
        ></i-switch>
      </template>
      <template slot="sslEnable" slot-scope="{ row }">
        <span v-if="row.sslEnable == 'true'" class="text-success">{{ $t('page.yes') }}</span>
        <span v-else class="text-grey">{{ $t('page.no') }}</span>
      </template>
      <template slot="action" slot-scope="{ row }">
        <div class="tstable-action">
          <ul class="tstable-action-ul">
            <li class="tsfont-edit" @click="editMailServer(row)">{{ $t('page.edit') }}</li>
            <li v-if="row.isDefault == 0" class="tsfont-trash-o" @click="deleteMailServer(row)">{{ $t('page.delete') }}</li>
          </ul>
        </div>
      </template>
    </TsTable>
    <MailServerEdit v-if="isShowMailServerEdit" :id="editId" @close="closeMailServerEdit"></MailServerEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    MailServerEdit: () => import('./mailserver-edit.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {},
  data() {
    return {
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('page.isactive'),
          key: 'isActive'
        },
        {
          title: this.$t('page.isdefault'),
          key: 'isDefault'
        },
        {
          title: this.$t('term.framework.smtphost'),
          key: 'host'
        },
        {
          title: this.$t('term.framework.smptport'),
          key: 'port'
        },
        {
          title: this.$t('term.framework.smptsslenable'),
          key: 'sslEnable'
        },
        {
          title: this.$t('page.emailaddress'),
          key: 'fromAddress'
        },
        {
          title: this.$t('page.username'),
          key: 'userName'
        },
        {
          title: this.$t('page.homeurl'),
          key: 'homeUrl'
        },
        {
          title: '',
          key: 'action',
          align: 'right'
        }
      ],
      tableData: null,
      isShowMailServerEdit: false,
      editId: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchMailServerList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchMailServerList() {
      this.$api.framework.mailserver.searchMailServerList({}).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
        }
      });
    },
    editMailServer(row) {
      this.isShowMailServerEdit = true;
      this.editId = row.id;
    },
    closeMailServerEdit(needRefresh) {
      this.isShowMailServerEdit = false;
      this.editId = null;
      if (needRefresh) {
        this.searchMailServerList();
      }
    },
    deleteMailServer(row) {
      this.$api.framework.mailserver.deleteMailServer({ id: row.id }).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.deletesuccess'));
          this.searchMailServerList();
        }
      });
    },
    handleIsActiveSwitchChange(row) {
      let param = {
        id: row.id,
        isActive: row.isActive
      };
      this.$api.framework.mailserver.updateMailServerIsActive(param).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.searchMailServerList();
        }
      });
    },
    handleIsDefaultSwitchChange(row) {
      let param = {
        id: row.id,
        isDefault: row.isDefault
      };
      this.$api.framework.mailserver.updateMailServerIsDefault(param).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.searchMailServerList();
        }
      });
    },
    addMailServer() {
      this.id = null;
      this.isShowMailServerEdit = true;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
