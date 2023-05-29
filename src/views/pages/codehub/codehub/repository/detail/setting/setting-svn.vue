<template>
  <Layout>
    <Sider hide-trigger class="bg-op" :style="siderStyle">
      <ul class="type-ul">
        <li
          v-for="t in typeList"
          :key="t.value"
          class="type-li"
          :class="selectedType==t.value?'active text-href':'text-action'"
          @click="selectedType=t.value"
        >{{ t.name }}</li>
      </ul>
    </Sider>
    <Content :style="siderStyle" class="padding-md">
      <div v-if="selectedType=='auth'">
        <div style="margin-bottom:10px;">
          <Button type="primary" @click="addAuth()"><i class="ts-plus"></i>权限</Button> 
          <Button v-if="!isDowning" v-download="downloadPath" class="ml-10">导出Excel</Button> 
          <Button v-else loading class="ml-10">导出中</Button> 
        </div>
        <div>
          <TsTable
            v-if="!isLoading"
            v-bind="tabledata"
            :tbodyList="authList"
            @changeCurrent="changeCurrent"
            @changePageSize="changePageSize"
          >
            <template slot="name" slot-scope="{row}">
              <UserCard
                :id="row.sid"
                :row="row"
                :repositoryUuid="uuid"
                :type="row.type"
              ></UserCard>
            </template>
            <template slot="acc" slot-scope="{row}">
              {{ getText(row.acc,'acc') }}
            </template>
            <template slot="actions" slot-scope="{row}">
              <div class="action-group">
                <div class="action-item text-action ts-edit" @click="editAuth(row)">编辑</div>
                <div class="action-item text-action ts-trash" @click="delAuth(row)">删除</div>
              </div>
            </template>
          </TsTable>
          <Loading v-else-if="isLoading" loadingShow style="min-height:100px;"></Loading>
        </div>
        <AuthAdd
          v-if="isEdit"
          :isShow="isEdit"
          :uuid="uuid"
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
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard'], resolve)

  },
  filters: {},
  directives: { download},
  mixins: [settingmixin],
  props: [''],
  data() {
    return {
      selectedType: 'auth',
      typeList: [{
        name: '权限设置',
        value: 'auth'
      }],
      tabledata: {
        theadList: [{
          title: '资源',
          key: 'path'
        }, {
          title: '用户名/组名',
          key: 'name'
        }, {
          title: '权限',
          key: 'acc'
        }, {
          key: 'actions',
          width: 80
        }],
        rowKey: 'keyid'
      },
      isEdit: false,
      authList: [],
      isLoading: false,
      accList: [
        {
          text: '只读',
          value: 'r'
        }, {
          text: '读写',
          value: 'rw'          
        }, {
          text: '无权限',
          value: false          
        }
      ],
      isDowning: false, //是否在下载中
      editConfig: null//编辑内容
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
  activated() {
  },
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
        'path': row.path, 
        'acclist': [{ 'userid': row.sid, 'type': row.type }]
      };
      let param = {
        'repositoryUuid': this.uuid,
        'authList': [authItem]
      };
      let _this = this;
      _this.$createDialog({
        title: '删除确认',
        content: '是否确认删除该权限',
        btnType: 'error',
        'on-ok': function(vnode) {
          _this.$api.codehub.repositorydetail.deleteSvnAuth(param).then((res) => {
            if (res && res.Status == 'OK') {
              _this.$Message.success('删除成功');
              _this.getList();
              vnode.isShow = false;
            } else {
              _this.$Message.error(res.Message);
            }
          });
        }
      });
    },
    changeCurrent() {

    },
    changePageSize() {
      
    },
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
        repositoryUuid: this.uuid
      };
      this.isLoading = true;
      this.$api.codehub.repositorydetail.getSvnAuthList(param).then(res => {
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
      }).finally(res => {
        this.isLoading = false;
      });
    },
    changeDownStatus(type, event) { //下载进度和状态的监听
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
        url: '/module/codehub/api/binary/repository/svn/repoauthdownload',
        params: {
          repositoryUuid: this.uuid
        },
        changeStatus: this.changeDownStatus
      };
    },
    getText() {
      return function(val) {
        let item = this.accList.find(a => {
          return a.value == val;
        });
        return item && item.text ? item.text : '无权限';
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
.type-ul{
  padding-left: 10px;
  .type-li{
    line-height: 40px;
    position: relative;
    padding-left: 10px;
    transition: all .3s;
    margin-bottom: 5px;
    &.active{
      padding-left: 14px;
      font-size:110%;
      font-weight: bold;
      &:before{
        content:'';
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
