<template>
  <Layout>
    <Sider hide-trigger class="bg-op" :style="siderStyle">
      <ul class="type-ul">
        <li
          v-for="t in typeList"
          :key="t.value"
          class="type-li"
          :class="selectedType == t.value ? 'active text-href' : 'text-action'"
          @click="selectedType = t.value"
        >{{ t.name }}</li>
      </ul>
    </Sider>
    <Content :style="siderStyle" class="padding-md">
      <div v-if="selectedType == 'auth'">
        <div style="margin-bottom: 10px">
          <Button type="primary" @click="addAuth()">
            <i class="ts-plus"></i>
            {{ $t('page.authority') }}
          </Button>
          <Button v-if="!isDowning" v-download="downloadPath" class="ml-sm">{{ $t('term.codehub.exportexcel') }}</Button>
          <Button v-else loading class="ml-sm">{{ $t('term.codehub.exporting') }}</Button>
        </div>
        <div>
          <TsTable
            v-if="!isLoading"
            v-bind="tableData"
            :tbodyList="authList"
            @changeCurrent="changeCurrent"
            @changePageSize="changePageSize"
          >
            <template slot="name" slot-scope="{ row }">
              <UserinfoSVN
                :id="row.sid"
                :row="row"
                :repositoryId="id"
                :type="row.type"
              ></UserinfoSVN>
            </template>
            <template slot="acc" slot-scope="{ row }">
              {{ getText(row.acc, 'acc') }}
            </template>
            <template slot="action" slot-scope="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="tsfont-edit" @click="editAuth(row)">{{ $t('page.edit') }}</li>
                  <li class="tsfont-trash-o" @click="delAuth(row)">{{ $t('page.delete') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
          <Loading v-else-if="isLoading" loadingShow style="min-height: 100px"></Loading>
        </div>
        <AuthAdd
          v-if="isEdit"
          :id="id"
          :accList="accList"
          :editConfig="editConfig"
          @close="close"
        ></AuthAdd>
      </div>
    </Content>
  </Layout>
</template>
<script>
import settingmixin from './settingmixin.js';
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    AuthAdd: resolve => require(['./svn/auth-add.vue'], resolve),
    UserinfoSVN: resolve => require(['@/views/pages/codehub/codehub/repository/components/userinfo-svn.vue'], resolve)
  },
  filters: {},
  directives: { download },
  mixins: [settingmixin],
  props: [''],
  data() {
    return {
      selectedType: 'auth',
      typeList: [
        {
          name: this.$t('page.authsetting'),
          value: 'auth'
        }
      ],
      tableData: {
        theadList: [
          {
            title: this.$t('page.resources'),
            key: 'path'
          },
          {
            title: this.$t('term.codehub.usergourpname'),
            key: 'name'
          },
          {
            title: this.$t('page.authority'),
            key: 'acc'
          },
          {
            key: 'action'
          }
        ],
        rowKey: 'keyid'
      },
      isEdit: false,
      authList: [],
      isLoading: false,
      accList: [
        {
          text: this.$t('page.readonly'),
          value: 'r'
        },
        {
          text: this.$t('term.codehub.readwrite'),
          value: 'rw'
        },
        {
          text: this.$t('term.codehub.notauth'),
          value: '-'
        }
      ],
      isDowning: false, //是否在下载中
      editConfig: null //编辑内容
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addAuth() {
      this.editConfig = null;
      this.isEdit = true;
    },
    editAuth(row, type) {
      let newConfig = {};
      newConfig = JSON.parse(JSON.stringify(row));
      this.editConfig = newConfig;
      this.isEdit = true;
    },
    delAuth(row) {
      let authItem = {
        path: row.path,
        acclist: [{ userid: row.sid, type: row.type }]
      };
      let param = {
        repositoryId: this.id,
        authList: [authItem]
      };
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('page.authority')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.codehub.repositorydetail.deleteSvnAuth(param).then(res => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.getList();
              vnode.isShow = false;
            } 
          });
        }
      });
    },
    changeCurrent() {},
    changePageSize() {},
    close(isReload) {
      this.editConfig = null;
      this.isEdit = false;
      if (isReload) {
        this.getList();
      }
    },
    getList() {
      //获取权限列表
      let param = {
        repositoryId: this.id
      };
      this.isLoading = true;
      this.$api.codehub.repositorydetail
        .getSvnAuthList(param)
        .then(res => {
          if (res.Status == 'OK' && typeof res.Return == 'object' && Object.keys(res.Return).length) {
            this.authList = [];
            Object.keys(res.Return).forEach(auth => {
              let pathList = res.Return[auth].map(r => {
                return {
                  path: auth,
                  keyid: auth + '_' + r.sid,
                  ...r
                };
              });
              this.authList.push(...pathList);
            });
          } else {
            this.authList = [];
          }
        })
        .finally(res => {
          this.isLoading = false;
        });
    },
    changeDownStatus(type, event) {
      //下载进度和状态的监听
      if (type == 'start') {
        this.isDowning = true;
      } else if (type != 'progress') {
        this.isDowning = false;
      }
    }
  },
  computed: {
    downloadPath() {
      return {
        url: '/api/binary/codehub/repository/svn/repoauthdownload',
        params: {
          repositoryId: this.id
        },
        changeStatus: this.changeDownStatus
      };
    },
    getText() {
      return function(val) {
        let item = this.accList.find(a => {
          return a.value == val;
        });
        return item && item.text ? item.text : this.$t('term.codehub.notauth');
      };
    },
    siderStyle() {
      return {
        height: 'calc(100vh - 130px)',
        overflow: 'auto'
      };
    }
  },
  watch: {}
};
</script>
<style lang='less' scoped>
.type-ul {
  padding-left: 10px;
  .type-li {
    line-height: 40px;
    position: relative;
    padding-left: 10px;
    transition: all 0.3s;
    margin-bottom: 5px;
    &.active {
      padding-left: 14px;
      font-size: 110%;
      font-weight: bold;
      &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        width: 1px;
        height: 20px;
        margin-top: -10px;
        border: 1px solid;
      }
    }
  }
}
</style>
