<template>
  <div>
    <TsRow>
      <Col span="18">
        <div style="display: flex;">
          <TsFormSelect
            v-model="user"
            v-bind="userConfig"
            class="mr-sm"
            :dataList="userList"
            @on-change="() => changeCurrent(1)"
          ></TsFormSelect>
          <TimeSelect
            v-model="time"
            v-bind="timeConfig"
            class="mr-sm"
            style="width: 180px;"
            @on-change="() => changeCurrent(1)"
          ></TimeSelect>
          <TsFormSelect
            v-model="objectVal"
            v-bind="objectConfig"
            class="mr-sm"
            :dataList="subjectList"
            @on-change="() => changeCurrent(1)"
          ></TsFormSelect>
          <TsFormSelect
            v-model="typeVal"
            v-bind="typeConfig"
            :dataList="actionTypeList"
            @on-change="() => changeCurrent(1)"
          ></TsFormSelect>
        </div>
      </Col>
      <Col span="6">
        <InputSearcher
          v-model="keyword"
          @change="() => changeCurrent(1)"
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
        <template slot="startTime" slot-scope="{row}">
          {{ row.startTime | formatDate }}
        </template>
        <template slot="endTime" slot-scope="{row}">
          {{ row.endTime | formatDate }}
        </template>
        <template slot="action" slot-scope="{row}">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li class="ts-pages" @click="showDetail(row.uuid)">{{ $t('page.detail') }}</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </div>
    <TsDialog
      v-if="isShow"
      v-bind="setting"
      @on-close="close"
    >
      <div>
        <table class="table">
          <colgroup>
            <col width="100" />
            <col />
          </colgroup>
          <tbody>
            <tr v-for="(d,dindex) in showInfo" :key="dindex" style="vertical-align: top;">
              <td class="text-tip text-right" nowrap>{{ d.label }}:</td>
              <td>{{ d.text }}</td>
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
      user: '',
      keyword: '',
      userConfig: {
        placeholder: this.$t('term.autoexec.operator'),
        transfer: true,
        width: 180,
        search: true,
        textName: 'userName',
        valueName: 'uuid',
        dynamicUrl: '/api/rest/user/search',
        rootName: 'tbodyList',
        border: 'border'
      },
      objectConfig: {
        width: 180,
        transfer: true,
        placeholder: this.$t('term.codehub.actionsubject'),
        border: 'border'
      },
      typeConfig: {
        width: 180,
        transfer: true,
        placeholder: this.$t('page.actiontype'),
        border: 'border'
      },
      timeConfig: {
        transfer: true
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
        key: 'startTime'
      }, {
        title: this.$t('page.endtime'),
        key: 'endTime'
      }, {
        key: 'action'
      }],
      tableConfig: {
        rowKey: 'id',
        tbodyList: [],
        currentPage: 1,
        pageSize: 20
      },
      time: null,
      actionTypeList: [],
      subjectList: [],
      objectVal: '',
      typeVal: '',
      loadingShow: true,
      userList: [],
      showInfo: null,
      isShow: false,
      setting: {
        title: this.$t('page.viewdetails'),
        width: 'medium',
        type: 'slider',
        maskClose: true,
        hasFooter: false,
        isShow: true
      },
      tableHeight: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getActiveObject();
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
        actionType: this.typeVal,
        keyword: this.keyword,
        currentPage: this.tableConfig.currentPage,
        pageSize: this.tableConfig.pageSize
      };
      if (this.user) {
        this.$set(param, 'userUuid', this.user);
      }
      if (this.time) {
        Object.assign(param, this.time);
      }
      if (this.objectVal) {
        this.$set(param, 'actionSubject', this.objectVal);
      }
      this.loadingShow = true;
      this.$api.codehub.repositorydetail.getActives(param).then(res => {
        if (res.Status == 'OK') {
          Object.assign(this.tableConfig, res.Return);
        } else {
          Object.assign(this.tableConfig, {
            currentPage: 1,
            pageCount: 1,
            pageSize: 1,
            rowNum: 1,
            tbodyList: []
          });
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    changeCurrent(currentPage) {
      this.tableConfig.currentPage = currentPage;
      this.searchList();
    },
    changePageSize(pageSize) {
      this.tableConfig.currentPage = 1;
      this.tableConfig.pageSize = pageSize;
      this.searchList();
    },
    getActiveObject() {
      let param = {
        belongType: 'repo'
      };
      this.$api.codehub.repositorydetail.getActiveObject(param).then(res => {
        if (res.Status == 'OK') {
          this.subjectList = res.Return.subjectList;
          this.actionTypeList = res.Return.actionTypeList;
        }
      });
    },
    showDetail(row) {
      this.showInfo = JSON.parse(row.detail);
      this.isShow = true;
    },
    close() {
      this.showInfo = null;
      this.isShow = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};

</script>
<style lang="less" scoped>
</style>
