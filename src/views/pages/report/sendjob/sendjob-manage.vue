<template>
  <div>
    <TsContain border="border">
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="isDialogShow = true">{{ $t('term.report.sendplan') }}</span>
      </template>
      <template v-slot:topRight>
        <div>
          <InputSearcher
            v-model="searchParams.keyword"
            @change="search()"
          ></InputSearcher>
        </div>
      </template>
      <div slot="content">
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <TsTable
          class="table"
          :theadList="theadList"
          v-bind="tableConfig"
          @changeCurrent="currentPage=>search({currentPage})"
          @changePageSize="pageSize=>search({pageSize})"
        >
          <template v-slot:toNameList="{row}">
            <template v-if="row.toNameList.length <= 3">
              {{ row.toNameList.join('、') }}
            </template>
            <template v-else>
              {{ row.toNameList.slice(0,3).join('、') }}
              <Dropdown placement="bottom-start" transfer>
                <span class="text-action tsfont-option-horizontal"></span>
                <DropdownMenu slot="list">
                  <DropdownItem v-for="(toName, index) in row.toNameList.slice(3)" :key="index" @click.stop>{{ toName }}</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </template>
          </template>
          <template v-slot:name="{row}"><span class="text-href" @click.stop="toEditPage('edit',row)">{{ row.name }}</span></template>
          <template v-slot:cron="{row}">
            <TsQuartz :value="row.cron" showType="read" />
          </template>
          <template v-slot:isActive="{row}">
            <TsFormSwitch
              :key="row.id"
              v-model="row.isActive"
              showStatus
              @on-change="updateStatus(row)"
            ></TsFormSwitch>
          </template>
          <template v-slot:nextFireTime="{row}">
            {{ row.nextFireTime | formatDate }}
          </template>
          <template v-slot:action="{row}">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-putongjigui" @click="viewRecord(row)">{{ $t('term.report.sendrecord') }}</li>
                <!-- <li class="tsfont-edit" @click="toEditPage('edit',row)">编辑</li> -->
                <li class="tsfont-copy" @click="toEditPage('copy',row)">{{ $t('page.copy') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>

    <!-- 发送记录 -->
    <SendjobRecord v-if="isRecordVisible" :rowData="rowData" @close="isRecordVisible=false" />

    <!-- 添加对话框 -->
    <TsDialog
      :isShow.sync="isDialogShow"
      :title="$t('term.report.addsendplan')"
      @on-ok="toEditPage('add', {name})"
      @on-cancel="$refs.form.clearForm()"
    >
      <Tsform ref="form" :itemList="formConfig" />
    </TsDialog>
  </div>
</template>

<script>
export default {
  name: 'SendjobManage',
  components: {
    TsTable: resolve => require(['components/TsTable/TsTable'], resolve),
    Tsform: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsQuartz: resolve => require(['@/resources/plugins/TsQuartz/TsQuartz'], resolve),
    SendjobRecord: resolve => require(['./sendjob-record'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  data() {
    let _this = this;
    return {
      isLoading: false,
      isDialogShow: false,
      isRecordVisible: false,
      name: '',
      rowData: null,
      formConfig: {
        name: {
          type: 'text',
          width: '100%',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: ['required', 'name-special', { name: 'searchUrl', url: 'api/rest/report/sendjob/save' }],
          onChange: value => {
            this.name = value;
          }
        }
      },
      searchParams: {
        keyword: '',
        currentPage: 1,
        pageSize: 20
      },
      theadList: [
        {title: this.$t('page.name'), key: 'name'},
        {title: this.$t('page.emailtitle'), key: 'emailTitle'},
        {title: this.$t('page.recipient'), key: 'toNameList'},
        {title: this.$t('page.executeplan'), key: 'cron'},
        {title: this.$t('page.status'), key: 'isActive'},
        {title: this.$t('term.report.nextsendingtime'), key: 'nextFireTime'},
        {title: this.$t('term.report.sendtimes'), key: 'execCount'},
        {title: '', key: 'action'}
      ],
      tableConfig: {
        tbodyList: [],
        rowNum: 0,
        pageSize: 20,
        currentPage: 1
      }
    };
  },
  created() {
    this.search();
  },
  methods: {
    async search(params = {}) {
      this.isLoading = true;
      this.searchParams = {...this.searchParams, currentPage: 1, ...params};
      const res = await this.$api.report.sendjob.search(this.searchParams);
      const {jobList: tbodyList, rowNum, pageSize, currentPage} = res.Return;
      this.tableConfig = { tbodyList, rowNum, pageSize, currentPage };
      this.isLoading = false;
    },
    async updateStatus(row) {
      const params = {id: row.id, isActive: row.isActive };
      try {
        const res = await this.$api.report.sendjob.updateStatus(params);
        this.$Message.success(this.$t('message.savesuccess'));
      } catch {
        row.isActive = (row.isActive === 1) ? 0 : 1;
      }
    },
    toEditPage(operation, {id, name} = {}) {
      if (operation != 'add' || (this.$refs.form && this.$refs.form.valid())) {
        this.$router.push({path: 'sendjob-edit', query: {operation, id, name}});
      }
    },
    viewRecord(row) {
      this.isRecordVisible = true;
      this.rowData = row;
    }
  }
};
</script>
