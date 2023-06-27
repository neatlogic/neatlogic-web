<template>
  <TsDialog
    
    v-bind="setting"
    @on-close="close"
    @on-ok="saveEdit"
  >
    <div style="height: calc(100vh - 134px);">
      <Split v-if="!isloading && pathList.length && !editConfig" v-model="split">
        <div slot="left" style="overflow:auto;max-height:calc(100vh - 134px);">
          <PathTree
            :list="pathList"
            :repositoryId="id"
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
                  <div v-else-if="!valid.path" class="text-danger">{{ $t('term.codehub.selectoneresource') }}</div>
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
                <div v-else-if="!valid.path" class="text-danger">{{ $t('term.codehub.selectoneresource') }}</div>
              </div>
            </template>
            <!-- membertype -->
          </TsForm>
        </div>        
      </div>
      <div v-else-if="!isloading" class="text-tip">{{ $t('term.codehub.noaddauthresource') }}</div>
      <Loading v-else loadingShow></Loading>
    </div>
    <template v-slot:footer>
      <div class="footer-btn-contain">
        <Button type="text" @click="close">{{ $t('page.cancel') }}</Button>
        <Button type="primary" :disabled="isSubmit" @click="saveEdit">{{ $t('page.confirm') }}</Button>
      </div>
    </template>
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
      repositoryId: this.id
    };
  },
  filters: {},
  props: {
    id: Number,
    accList: Array,
    editConfig: [Object, String]
  },
  data() {
    return {
      split: 0.3,
      setting: {
        title: this.editConfig ? this.$t('term.codehub.editauth') : this.$t('term.codehub.addauth'),
        maskClose: false,
        width: 'medium',
        type: 'slider',
        isShow: true
      },
      isSubmit: false, //是否提交中，需要禁用调提交按钮
      pathList: [],
      currentPath: [], //当前选中哪个路径
      isLoading: true,
      formConfig: [
        {
          type: 'radio',
          label: this.$t('page.type'),
          name: 'authType',
          validateList: ['required'],
          value: 'member',
          dataList: [{
            text: this.$t('page.user'),
            value: 'member'
          }, {
            text: this.$t('term.codehub.group'),
            value: 'group'
          }],
          onChange: (val) => {
            this.changeType(val);
          }
        }, {
          type: 'slot',
          label: this.$t('term.codehub.usergourpname'),
          name: 'memberType',
          validateList: ['required']         
        }, {
          type: 'slot',
          label: this.$t('term.codehub.usergourpname'),
          name: 'groupType',
          validateList: ['required'],
          isHidden: true       
        }, {
          type: 'select',
          label: this.$t('page.authority'),
          name: 'auth',
          value: false,
          validateList: ['required'],
          dataList: this.accList,
          clearable: false,
          onChange: (val) => {
            this.changeAuth(val);
          }       
        }, {
          type: 'slot',
          label: this.$t('term.codehub.selectresource'),
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
          'repositoryId': this.id
        },
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
          'repositoryId': this.id,
          'groupName': ''
        },
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
        repositoryId: this.id,
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
      this.isSubmit = true;
      this.$api.codehub.repositorydetail.saveSvnAuth(param).then(res => {
        if (res && res.Status == 'OK') {
          this.$emit('close', true);
        }
      }).finally(res => {
        this.isSubmit = false;
      });
    },
    close() {
      this.$emit('close');
    },
    getTree() {
      //获取路径树的第一层
      let param = {
        repositoryId: this.id
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
      //   repositoryId: this.id,
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
