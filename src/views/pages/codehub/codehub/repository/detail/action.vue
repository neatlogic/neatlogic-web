<template>
  <div>
    <div
      ref="top"
      class="input-border"
      style="padding:0 16px;"
    >
      <Row :gutter="16">
        <i-col span="18" class="top-search">
          <span class="mr-10" style="display:inline-block;">
            <FormSelect
              v-model="user"
              v-bind="userConfig"
              class="mr-10"
              :dataList="userList"
              @on-change="searchList('init')"
            ></FormSelect>
          </span>
          <TimeSelect
            v-model="time"
            v-bind="timeConfig"
            class="mr-10"
            @on-change="searchList('init')"
          ></TimeSelect>
          <FormSelect
            v-model="objectVal"
            v-bind="objectConfig"
            class="mr-10"
            :dataList="subjectList"
            @on-change="searchList('init')"
          ></FormSelect>
          <FormSelect
            v-model="typeVal"
            v-bind="typeConfig"
            :dataList="actionTypeList"
            @on-change="searchList('init')"
          ></FormSelect>
        </i-col>
        <i-col span="6">
          <FormInput
            v-model.trim="keyword"
            suffix="i-icon ts-search"
            placeholder="关键字"
            @keyup.enter.native="searchList('init')"
          ></FormInput>
        </i-col>
      </Row>
    </div>
    <div ref="table" class="padding-md" style="padding-bottom:0">
      <TsTable
        v-bind="tableConfig"
        :tbodyList="actionList"
        :height="height"
        @changeCurrent="changeCurrent"
        @changePageSize="changePageSize"
      >
        <template slot="startTime" slot-scope="{row}">
          {{ row.startTime | formatDate }}
        </template>
        <template slot="endTime" slot-scope="{row}">
          {{ row.endTime | formatDate }}
        </template>
        <template slot="actions" slot-scope="{row}">
          <div class="text-action ts-pages" @click="showDetail(row)">详情</div>
        </template>
      </TsTable>
    </div>
    <TsDialog
      v-if="isShow"
      v-bind="setting"
      :isShow="isShow"
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
import FormInput from '@/resources/plugins/TsForm/TsFormInput.vue';
import FormSelect from '@/resources/plugins/TsForm/TsFormSelect.vue';
import TimeSelect from '@/resources/components/TimeSelect/TimeSelect.vue';
import editmixin from './edittabmixin.js';
export default {
  name: 'Action',
  components: {
    FormInput,
    FormSelect,
    TimeSelect,
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve)
  },
  mixins: [editmixin],
  props: {},
  data() {
    let _this = this;
    return {
      keyword: '',
      userConfig: {
        placeholder: '操作人',
        transfer: true,
        width: 150,
        search: true,
        textName: 'userName',
        valueName: 'userId',
        dynamicUrl: '/api/rest/codehub/user/search',
        idListName: 'idList',
        rootName: 'tbodyList',
        hasReturn: true
      },
      objectConfig: {
        width: 140,
        transfer: true,
        placeholder: '操作对象'
      },
      typeConfig: {
        width: 140,
        transfer: true,
        placeholder: '操作类型'
      },
      timeConfig: {
        width: '180px',
        transfer: true
      },
      tableConfig: {
        theadList: [{
          title: '操作人',
          key: 'userId'
        }, {
          title: '操作对象',
          key: 'actionSubjectName'
        }, {
          title: '操作类型',
          key: 'actionTypeName'
        }, {
          title: '开始时间',
          key: 'startTime'
        }, {
          title: '结束时间',
          key: 'endTime'
        }, {
          width: '80',
          key: 'actions'
        }],
        rowKey: 'uuid',
        tbodyList: [],
        currentPage: 1,
        pageSize: 20
      },
      time: null,
      actionTypeList: [],
      subjectList: [],
      user: '',
      objectVal: '',
      typeVal: '',
      actionList: [],
      searching: true,
      userList: [],
      showInfo: null,
      isShow: false,
      setting: {
        title: '查看详情',
        width: 'medium',
        type: 'slider',
        maskClose: true,
        hasFooter: false
      },
      height: null

    };
  },
  beforeCreate() {},
  created() {

  },
  beforeMount() {},
  mounted() {
    this.getActiveObject();
    this.searchList();
    if (this.$refs.table) {
      let totlheight = window.innerHeight || document.body.clientHeight;
      this.height = (totlheight - this.$refs.table.getBoundingClientRect().top - 32 - 34) + 'px';
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {

  },
  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    searchList(isInit) {
      isInit && (this.currentPage = 1);
      let param = {
        belongType: 'repo',
        belongUuid: this.uuid
      };

      if (this.time) {
        Object.assign(param, this.time);
      }
      this.user && Object.assign(param, {userId: this.user});
      this.objectVal && Object.assign(param, {actionSubject: this.objectVal});
      this.typeVal && Object.assign(param, {actionType: this.typeVal});
      this.keyword && Object.assign(param, {keyword: this.keyword});
      this.searching = true;
      this.tableConfig.currentPage && Object.assign(param, {currentPage: this.tableConfig.currentPage});
      this.tableConfig.pageSize && Object.assign(param, {pageSize: this.tableConfig.pageSize});
      this.$api.codehub.repositorydetail.getActives(param).then(res => {
        if (res.Status == 'OK') {
          Object.assign(this.tableConfig, {
            currentPage: res.Return.currentPage,
            pageCount: res.Return.pageCount,
            pageSize: res.Return.pageSize,
            rowNum: res.Return.rowNum
          });
          this.actionList = res.Return.list || [];
        } else {
          Object.assign(this.tableConfig, {
            currentPage: 1,
            pageCount: 1,
            pageSize: 1,
            rowNum: 1
          });
          this.actionList = [];
        }
      }).finally(res => {
        this.searching = false;
      });
    },
    changeCurrent(val) {
      this.tableConfig.currentPage = val;
      this.searchList();
    },
    changePageSize(val) {
      this.tableConfig.pageSize = val;
      this.tableConfig.currentPage = 1;
      this.searchList();
    },
    getUserlist() {
      // let param = {
      //   mode: 0
      // };
      // this.$https.post('/user/searchUserByNameJson.do', param).then(res => {
      //   if (res && typeof res == 'object') {
      //     this.userList = res || [];
      //   } else {
      //     this.userList = [];
      //   }
      // });
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

  computed: {
  },

  watch: {
  }
};

</script>
<style lang="less" scoped>
.top-search{
  /deep/ .form-li{
    display: inline-block;
  }
}
</style>
