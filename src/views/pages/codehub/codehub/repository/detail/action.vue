<template>
  <div>
    <TsRow>
      <Col span="18">
        <div style="display: flex;">
          <TsFormSelect
            v-model="searchParams.userUuid"
            v-bind="userConfig"
            class="mr-sm"
            @on-change="() => changeCurrent()"
          ></TsFormSelect>
          <TimeSelect
            v-model="timeConfig.value"
            v-bind="timeConfig"
            class="mr-sm"
            style="width: 180px;"
            @on-change="() => changeCurrent()"
          ></TimeSelect>
          <TsFormSelect
            v-model="searchParams.actionSubject"
            v-bind="objectConfig"
            class="mr-sm"
            @on-change="() => changeCurrent()"
          ></TsFormSelect>
          <TsFormSelect
            v-model="searchParams.actionType"
            v-bind="typeConfig"
            @on-change="() => changeCurrent()"
          ></TsFormSelect>
        </div>
      </Col>
      <Col span="6">
        <InputSearcher
          v-model="searchParams.keyword"
          @change="() => changeCurrent()"
        ></InputSearcher>
      </Col>
    </TsRow>
    <Loading
      v-if="loadingShow"
      class="mt-sm"
      :loadingShow="loadingShow"
    ></Loading>
    <div v-else ref="table" class="mt-sm">
      <TsTable
        v-bind="tableConfig"
        :theadList="theadList"
        :height="tableHeight"
        @changeCurrent="changeCurrent"
        @changePageSize="changePageSize"
      >
        <template slot="userUuid" slot-scope="{row}">
          <UserCard
            v-if="row.userUuid"
            :uuid="row.userUuid"
            :hideAvatar="true"
          ></UserCard>
        </template>
        <template slot="action" slot-scope="{row}">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li class="tsfont-file-single" @click="showDetail(row)">{{ $t('page.detail') }}</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </div>
    <TsDialog
      v-if="setting.isShow"
      v-bind="setting"
      @on-close="close"
    >
      <div>
        <table style="word-break: break-all;">
          <colgroup>
            <col width="100" />
            <col />
          </colgroup>
          <tbody>
            <tr v-for="(item, dindex) in detailList" :key="dindex" class="mb-nm">
              <td class="text-grey text-right" nowrap>{{ item.label }}：</td>
              <td>{{ item.text }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </TsDialog>
  </div>
</template>

<script>
import editmixin from './edittabmixin.js';
export default {
  name: 'Action',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TimeSelect: resolve => require(['@/resources/components/TimeSelect/TimeSelect.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  mixins: [editmixin],
  props: {},
  data() {
    return {
      loadingShow: true,
      tableHeight: null,
      detailList: [],
      searchParams: {
        keyword: '',
        userUuid: '',
        actionType: '',
        actionSubject: ''
      },
      userConfig: {
        placeholder: this.$t('term.autoexec.operator'),
        transfer: true,
        width: 180,
        search: true,
        textName: 'userName',
        valueName: 'uuid',
        dynamicUrl: '/api/rest/user/search/forselect',
        rootName: 'tbodyList',
        border: 'border'
      },
      objectConfig: {
        width: 180,
        transfer: true,
        placeholder: this.$t('term.codehub.actionsubject'),
        border: 'border',
        dynamicUrl: '/api/rest/codehub/action/subject/search',
        rootName: 'subjectList',
        params: {belongType: 'repo'}
      },
      typeConfig: {
        width: 180,
        transfer: true,
        placeholder: this.$t('page.actiontype'),
        border: 'border',
        dynamicUrl: '/api/rest/codehub/action/subject/search',
        rootName: 'actionTypeList',
        params: {belongType: 'repo'}
      },
      timeConfig: {
        transfer: true,
        value: ''
      },
      theadList: [{
        title: this.$t('term.autoexec.operator'),
        key: 'userUuid'
      }, {
        title: this.$t('term.codehub.actionsubject'),
        key: 'actionSubjectName'
      }, {
        title: this.$t('page.actiontype'),
        key: 'actionTypeName'
      }, {
        title: this.$t('page.starttime'),
        key: 'startTime',
        type: 'time'
      }, {
        title: this.$t('page.endtime'),
        key: 'endTime',
        type: 'time'
      }, {
        key: 'action'
      }],
      tableConfig: {
        tbodyList: [],
        currentPage: 1,
        pageSize: 20
      },
      setting: {
        title: this.$t('page.viewdetails'),
        width: 'medium',
        type: 'slider',
        maskClose: true,
        hasFooter: false,
        isShow: false
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchList();
    if (this.$refs.table) {
      let totalHeight = window.innerHeight || document.body.clientHeight;
      this.tableHeight = (totalHeight - this.$refs.table.getBoundingClientRect().top - 32 - 34) + 'px';
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchList() {
      let param = {
        belongType: 'repo',
        belongId: this.id,
        ...this.searchParams,
        currentPage: this.tableConfig.currentPage,
        pageSize: this.tableConfig.pageSize
      };
      if (this.timeConfig.value) {
        Object.assign(param, this.timeConfig.value);
      }
      if (param && param.hasOwnProperty('actionSubject') && this.$utils.isEmpty(param.actionSubject)) {
        delete param.actionSubject;
      }
      this.loadingShow = true;
      this.$api.codehub.repositorydetail.getActives(param).then(res => {
        if (res.Status == 'OK') {
          Object.assign(this.tableConfig, res.Return);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    changeCurrent(currentPage = 1) {
      this.tableConfig.currentPage = currentPage;
      this.searchList();
    },
    changePageSize(pageSize) {
      this.tableConfig.currentPage = 1;
      this.tableConfig.pageSize = pageSize;
      this.searchList();
    },
    showDetail(row) {
      try {
        this.detailList = JSON.parse(row.detail);
        this.setting.isShow = true;
      } catch (error) {
        this.detailList = [];
        this.setting.isShow = true;
      }
    },
    close() {
      this.detailList = [];
      this.setting.isShow = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};

</script>
<style lang="less" scoped>
</style>
