<template>
  <div class="notify-card">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div class="search-box pb-md">
      <div class="add-tactics">
        <span class="tsfont-plus text-action" @click="add">{{ $t('page.scheduledtask') }}</span>
      </div>
      <div class="search-right input-border">
        <TsFormInput
          v-model.trim="searchParams.keyword"
          class="search"
          :placeholder="$t('page.keyword')"
          search
          clearable
          @on-enter="getTableDataSearch"
          @on-clear="getTableDataSearch"
        ></TsFormInput>
      </div>
    </div>
    <div class="notifytactics-card">
      <TsTable
        v-if="tableData"
        :hideAction="false"
        v-bind="tableData"
        @changePageSize="pageSize=>getTableDataSearch({pageSize})"
        @changeCurrent="currentPage=>getTableDataSearch({currentPage})"
      >
        <template slot="nextFireTime" slot-scope="{ row }">
          <div>
            <span>{{ row.nextFireTime | formatDate }}</span>
          </div>
        </template>
        <template v-slot:toVoList="{row}">
          <div v-if="row.toVoList && row.toVoList.length > 0">
            <span v-for="(user, uindex) in slice(row.toVoList, true)" :key="uindex">
              <span v-if="user.initType == 'email' || user.initType == 'custom'">{{ user.name }}</span>
              <UserCard
                v-else
                class="user-name"
                v-bind="user"
                hideAvatar
              ></UserCard>
            </span>
            <template v-if="row.toVoList.length > 3">
              <Dropdown placement="bottom-start" transfer>
                <span class="tsfont-option-vertical bg-block text-action"></span>
                <DropdownMenu slot="list">
                  <DropdownItem v-for="(receiver, index) in slice(row.toVoList, false)" :key="index" @click.stop>
                    <span v-if="receiver.initType == 'email' || receiver.initType == 'custom'">{{ receiver.name }}</span>
                    <UserCard
                      v-else
                      class="user-name"
                      v-bind="receiver"
                      hideAvatar
                    ></UserCard>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </template>
          </div>
          <div v-else>-</div>
        </template>
        <template slot="cron" slot-scope="{ row }">
          <div>
            <TsQuartz :value="row.cron" showType="read"></TsQuartz>
          </div>
        </template>
        <template v-slot:isActive="{row}">
          <TsFromSwitch
            :key="row.id"
            v-model="row.isActive"
            showStatus
            @on-change="updateStatus(row)"
          ></TsFromSwitch>
        </template>
        <template slot="action" slot-scope="{ row }">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li class="tsfont-putongjigui" @click.stop="viewRecord(row)">{{ $t('term.autoexec.executionrecord') }}</li>
              <li class="tsfont-edit icon" @click="editRow(row)">{{ $t('page.edit') }}</li>
              <li class="tsfont-trash-o icon" @click="deleteRow(row)">{{ $t('page.delete') }}</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </div>
    <TsDialog type="modal" :isShow.sync="addModel">
      <template v-slot:header>
        <div>{{ $t('dialog.title.addtarget',{'target':$t('page.scheduledtask')}) }}</div>
      </template>
      <template v-slot>
        <TsForm ref="mainForm" :itemList="formSetting"></TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="cancelAddFlow">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="okAddFlow">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
    <!-- 发送记录 -->
    <SendjobRecord :visible.sync="isRecordVisible" :rowData.sync="rowData" />
  </div>
</template>

<script>
import TsTable from '@/resources/components/TsTable/TsTable.vue';
import TsQuartz from '@/resources/plugins/TsQuartz/TsQuartz.vue';

export default {
  name: '',
  components: {
    TsTable,
    TsQuartz,
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFromSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    SendjobRecord: resolve => require(['./sendjob-record'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: [],
  data() {
    return {
      keyword: null,
      tableData: null,
      loadingShow: true,
      searchParams: {
        keyword: '',
        pageSize: 20,
        currentPage: 1
      },
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('term.framework.notifyhandler'),
          key: 'notifyHandler'
        },
        {
          title: this.$t('term.framework.tovouser'),
          key: 'toVoList'
        },
        {
          title: this.$t('page.executeplan'),
          key: 'cron'
        },
        {
          title: this.$t('page.status'),
          key: 'isActive'
        },
        {
          title: this.$t('term.framework.nextfiretime'),
          key: 'nextFireTime'
        },
        {
          title: this.$t('term.autoexec.executecount'),
          key: 'execCount'
        },
        {
          title: '',
          key: 'action',
          width: 10,
          align: 'right'
        }
      ],
      addModel: false,
      formSetting: [
        {
          type: 'text',
          name: 'name',
          value: '', //默认值
          maxlength: 30,
          width: '100%',
          label: this.$t('page.name'),
          validateList: ['required', 'name-special', {
            name: 'searchUrl', url: 'api/rest/notify/job/save'
          }]
        }
      ],
      rowData: null,
      isRecordVisible: false
    };
  },

  beforeCreate() {},

  created() {
    this.getTableDataSearch();
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
    getTableDataSearch(params = {}) {
      this.loadingShow = true;
      this.searchParams = { ...this.searchParams, currentPage: 1, ...params };
      this.$api.framework.tactics.searchJob(this.searchParams).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
          this.tableData.theadList = this.theadList;
          this.loadingShow = false;
        }
      });
    },
    add() {
      this.addModel = true;
      this.formSetting[0].value = null;
    },
    deleteRow(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: row.name}),
        btnType: 'error',
        'on-ok': vnode => {
          let data = { id: row.id };
          this.$api.framework.tactics
            .deleteJob(data)
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.getTableDataSearch();
                vnode.isShow = false;
              }
            });
        }
      });
    },
    editRow(row) {
      this.$router.push({
        path: '/timing-task-edit',
        query: {
          id: row.id,
          name: row.name
        }
      });
    },
    cancelAddFlow: function() {
      this.addModel = false;
    },
    okAddFlow() {
      let Form = this.$refs.mainForm;
      let name = Form.getFormValue().name;
      if (Form.valid()) {
        this.$router.push({
          path: '/timing-task-edit',
          query: {
            name: name,
            isnew: true
          }
        });
      }
    },
    async updateStatus(row) {
      const params = {id: row.id, isActive: row.isActive };
      try {
        const res = await this.$api.framework.tactics.updateStatusJob(params);
        this.$Message.success(this.$t('message.savesuccess'));
      } catch {
        row.isActive = (row.isActive === 1) ? 0 : 1;
      }
    },
    viewRecord(row) {
      this.isRecordVisible = true;
      this.rowData = row;
    },
    slice(list, key) {
      if (list.length > 0) {
        if (key) {
          return list.slice(0, 3);
        } else {
          return list.slice(3, list.length);
        }
      }
    }
  },

  filter: {},

  computed: {},

  watch: {}
};
</script>
