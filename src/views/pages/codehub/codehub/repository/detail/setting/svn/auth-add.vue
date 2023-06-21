<template>
  <TsDialog
    v-if="isShow"
    v-bind="setting"
    :isShow="isShow"
    @on-close="close"
    @on-ok="saveEdit"
  >
    <div style="height: calc(100vh - 134px);">
      <Split v-if="!isloading && pathList.length && !editConfig" v-model="split">
        <div slot="left" style="overflow:auto;max-height:calc(100vh - 134px);">
          <PathTree
            :list="pathList"
            :repositoryUuid="uuid"
            :selectPath="currentPath"
            @selectedPath="selectedPath"
          ></PathTree>
        </div>
        <div slot="right">
          <div>
            <TsForm ref="editform" :itemList="formConfig">
              <template slot="memberType">
                <div>
                  <div v-if="editConfig">{{ editConfig.name }}</div>
                  <TsFormSelect
                    v-else
                    ref="memberItem"
                    v-model="memberVal"
                    v-bind="memberConfig"
                    requireFirstLoad
                  ></TsFormSelect>
                </div>
              </template>
              <template slot="groupType">
                <div>
                  <div v-if="editConfig">{{ editConfig.name }}</div>
                  <TsFormSelect
                    v-else
                    ref="groupItem"
                    v-model="groupVal"
                    v-bind="groupConfig"
                    requireFirstLoad
                  ></TsFormSelect>
                </div>
              </template>
              <template slot="pathList">
                <div>
                  <div v-if="currentPath && currentPath.length">
                    <Tag
                      v-for="pa in currentPath"
                      :key="pa"
                      :closable="editConfig?false:true"
                      @on-close="handleClose(pa)"
                    >{{ pa }}</Tag>
                  </div>
                  <div v-else-if="valid.path" class="text-tips">-</div>
                  <div v-else-if="!valid.path" class="text-danger">请至少选择一个资源</div>
                </div>
              </template>
              <!-- membertype -->
            </TsForm>
          </div>
        </div>
      </Split>
      <div v-else-if="!isloading && pathList.length && editConfig">
        <div>
          <TsForm ref="editform" :itemList="formConfig">
            <template slot="memberType">
              <div>
                <div v-if="editConfig">{{ editConfig.name }}</div>
                <TsFormSelect
                  v-else
                  ref="memberItem"
                  v-model="memberVal"
                  v-bind="memberConfig"
                  requireFirstLoad
                ></TsFormSelect>
              </div>
            </template>
            <template slot="groupType">
              <div>
                <div v-if="editConfig">{{ editConfig.name }}</div>
                <TsFormSelect
                  v-else
                  ref="groupItem"
                  v-model="groupVal"
                  v-bind="groupConfig"
                  requireFirstLoad
                ></TsFormSelect>
              </div>
            </template>
            <template slot="pathList">
              <div>
                <div v-if="currentPath && currentPath.length">
                  <Tag
                    v-for="pa in currentPath"
                    :key="pa"
                    :closable="editConfig?false:true"
                    @on-close="handleClose(pa)"
                  >{{ pa }}</Tag>
                </div>
                <div v-else-if="valid.path" class="text-tips">-</div>
                <div v-else-if="!valid.path" class="text-danger">请至少选择一个资源</div>
              </div>
            </template>
            <!-- membertype -->
          </TsForm>
        </div>        
      </div>
      <div v-else-if="!isloading" class="text-tip">暂无可添加权限的资源</div>
      <Loading v-else loadingShow></Loading>
    </div>
  </TsDialog>
</template>
<script>
import PathTree from './path-tree.vue';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect.vue';
export default {
  name: '',
  components: {
    PathTree,
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsFormSelect
  },
  provide() {
    return {
      repositoryUuid: this.uuid
    };
  },
  filters: {},
  props: {
    isShow: Boolean,
    uuid: String,
    accList: Array,
    editConfig: [Object, String]
  },
  data() {
    let _this = this;
    return {
      split: 0.3,
      setting: {
        title: _this.editConfig ? '编辑授权' : '添加授权',
        maskClose: false,
        width: 'medium',
        type: 'slider'
      },
      pathList: [],
      currentPath: [], //当前选中哪个路径
      isLoading: true,
      formConfig: [
        {
          type: 'radio',
          label: '类型',
          name: 'authType',
          validateList: ['required'],
          value: 'member',
          dataList: [{
            text: '用户',
            value: 'member'
          }, {
            text: '组',
            value: 'group'
          }],
          onChange(val) {
            _this.changeType(val);
          }
        }, {
          type: 'slot',
          label: '用户名/组名',
          name: 'memberType',
          validateList: ['required']         
        }, {
          type: 'slot',
          label: '用户名/组名',
          name: 'groupType',
          validateList: ['required'],
          isHidden: true       
        }, {
          type: 'select',
          label: '权限',
          name: 'auth',
          value: false,
          validateList: ['required'],
          width: '300px',
          dataList: _this.accList,
          clearable: false,
          onChange(val) {
            _this.changeAuth(val);
          }       
        }, {
          type: 'slot',
          label: '已选资源',
          name: 'pathList',
          validateList: ['required']         
        }
      ],
      authType: 'member',
      authValue: false,
      groupVal: null,
      memberVal: null,
      groupConfig: {
        width: '300px',
        transfer: true,
        validateList: ['required'],
        dynamicUrl: '/api/rest/codehub/repository/svn/getgroup',
        params: {
          'repositoryUuid': _this.uuid
        },
        //keyword: 'search',
        clearable: false,
        multiple: true,
        search: true     
      },
      memberConfig: {
        width: '300px',
        transfer: true,
        validateList: ['required'],
        dynamicUrl: '/api/rest/codehub/repository/svn/getmemberbygroup',
        params: {
          'repositoryUuid': _this.uuid,
          'groupName': ''
        },
        //keyword: 'search',
        clearable: false,
        multiple: true,
        search: true     
      },
      pathConfig: {
        width: '300px',
        validateList: ['required'],
        type: 'textarea'
      },
      pathVal: '', //输入的资源路径
      valid: {
        path: true
      }, 
      isloading: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getTree();
    if (this.editConfig && typeof this.editConfig == 'object') {
      if (this.editConfig.type == 'group') {
        this.formConfig.forEach(f => {
          if (f.name == 'authType') {
            this.$set(f, 'value', this.editConfig.type);
            this.$set(f, 'readonly', true);
          } else if (f.name == 'auth') {
            this.$set(f, 'value', this.editConfig['acc'] || false);
          }
        });
        this.authType = this.editConfig.type == 'group' ? 'group' : 'member';
        this.groupVal = [this.editConfig['sid']];
        this.authValue = this.editConfig['acc'];
        this.currentPath = [this.editConfig['path']];
      } else {
        this.formConfig.forEach(f => {
          if (f.name == 'authType') {
            this.$set(f, 'value', 'member');
            this.$set(f, 'readonly', true);
          } else if (f.name == 'auth') {
            this.$set(f, 'value', this.editConfig['acc'] || false);
          }
        });
        this.authType = this.editConfig.type == 'group' ? 'group' : 'member';
        this.memberVal = [this.editConfig['sid']];
        this.authValue = this.editConfig['acc'];
        this.currentPath = [this.editConfig['path']];
      }
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    saveEdit() {
      let isPass = true;
      if (!(this.currentPath && this.currentPath.length)) {
        Object.assign(this.valid, {
          path: false
        });
        isPass = false;
      } else {
        Object.assign(this.valid, {
          path: true
        });       
      }
      if (!this.$refs.editform.valid()) {
        isPass = false;
      }
      if (this.authType == 'member' && this.$refs.memberItem && !this.$refs.memberItem.valid()) {
        isPass = false;
      } else if (this.authType != 'member' && this.$refs.groupItem && !this.$refs.groupItem.valid()) {
        isPass = false;
      }
      if (!isPass) {
        return;
      }
      let param = {
        repositoryUuid: this.uuid,
        authList: []
      };
      let authList = [];

      if (this.currentPath && this.currentPath.length) {
        this.currentPath.forEach(c => {
          let item = {
            path: c,
            acclist: []
          };

          if (this.authType == 'member') {
            if (this.memberVal && this.memberVal.length) {
              this.memberVal.forEach(m => {
                item.acclist.push({
                  'userid': m,
                  'acc': this.authValue || '', 
                  'type': 'person'
                });
              });
            }
          } else {
            if (this.groupVal && this.groupVal.length) {
              this.groupVal.forEach(g => {
                item.acclist.push({
                  'userid': g,
                  'acc': this.authValue || '', 
                  'type': 'group'
                });
              });
            }
          }

          authList.push(item);
        });
      }

      Object.assign(param, {
        'authList': authList
      });
      this.$api.codehub.repositorydetail.saveSvnAuth(param).then(res => {
        if (res && res.Status == 'OK') {
          this.$emit('close', true);
        }
      });
    },
    close() {
      this.$emit('close');
    },
    getTree() {
      //获取路径树的第一层
      let param = {
        repositoryUuid: this.uuid
      };
      this.isloading = true;
      this.$api.codehub.repositorydetail.getSvnAuthTree(param).then(res => {
        if (res.Status == 'OK') {
          if (res.Return && res.Return.length) {
            this.pathList = res.Return.map(r => {
              return {
                path: r.path,
                type: r.type,
                hasChild: r.type && r.type == 'D',
                children: null,
                showchild: false,
                parentPath: '',
                fullpath: r.path
              };
            });
          } else {
            this.pathList = [];
          }
        } else {
          this.pathList = [];
        }
      }).finally(e => {
        this.isloading = false;
      });
    },
    selectedPath(path, isIn) {
      if (!isIn && this.currentPath.indexOf(path) == -1) {
        //没有则新增
        this.currentPath.push(path);
      } else if (isIn && this.currentPath.indexOf(path) > -1) {
        this.currentPath = this.currentPath.filter(c => {
          return c != path;
        });
      }
    },
    getAuth(path) {
      //获取权限列表
      this.pathVal = path.join(',');
      // let param = {
      //   repositoryUuid: this.uuid,
      //   path: path
      // };
      // this.isLoading = true;
      // this.$api.codehub.repositorydetail.getSvnAuthList(param).then(res => {
      //   console.log(res);
      // }).finally(res => {
      //   this.isLoading = false;
      // });
    },
    changeType(val) {
      this.authType = val;
      if (val == 'group') {
        this.memberVal = null;
        this.setFormVisable('memberType', false);
        this.setFormVisable('groupType', true);
      } else {
        this.groupVal = null;
        this.setFormVisable('memberType', true);
        this.setFormVisable('groupType', false);
      }
      this.authValue = false;
      this.setFormVal('auth', false);
    },
    changeAuth(val) {
      this.authValue = val;
    },
    setFormVal(key, val) {
      this.formConfig.forEach(f => {
        if (f.name == key) {
          Object.assign(f, {
            value: val
          });
        }
      });
    },    
    setFormVisable(key, val) {
      this.formConfig.forEach(f => {
        if (f.name == key) {
          Object.assign(f, {
            isHidden: !val
          });
        }
      });
    },
    handleClose(path) {
      this.selectedPath(path, true);
    }
  },
  computed: {
  },
  watch: {
    currentPath: {
      handler: function(val) {
        if (val) {
          this.getAuth(val);
        }
      }  
    }
  }

};

</script>
<style lang='less'>

</style>
