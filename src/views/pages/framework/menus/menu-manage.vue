<!--菜单管理 -->
<template>
  <div class="menumanagement">
    <TsContain :hideHeader="true">
      <template v-slot:sider>
        <div class="body-left">
          <div class="body-left-title">
            <span>{{ $t('term.framework.acmenulist') }}</span>
            <a class="add" href="javascript:void(0);" @click="addZtree('formItem')">{{ $t('dialog.title.addtarget', {target: $t('term.framework.firstlevelmenu')}) }}</a>
          </div>
          <div id="areaTree" class="body-left-body">
            <ul id="treeDemo" class="ztree"></ul>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <div class="body-right">
          <div id="divMain" class="step-panel">
            <div class="body-right-top">
              <span>{{ formItem.formtitle }}</span>
            </div>
            <Form
              id="mainForm"
              ref="formItem"
              label-position="right"
              :label-width="150"
              :model="formItem"
              :rules="menurules"
            >
              <FormItem :label="$t('term.framework.parentmenu') + '：'" prop="parentName">
                <Input
                  v-model="formItem.parentName"
                  placeholder
                  disabled
                  style="width:200px"
                />
              </FormItem>
              <FormItem :label="$t('page.name') + '：'" prop="name">
                <Input
                  v-model="formItem.name"
                  :placeholder="$t('page.name')"
                  maxlength="10"
                  show-word-limit
                  style="width:200px"
                />
              </FormItem>
              <FormItem :label="$t('term.framework.belongmodule') + '：'" prop="selectmodule">
                <Select v-model="formItem.selectmodule" style="width:200px">
                  <Option v-for="item in formItem.moduleList" :key="item.value" :value="item.value">{{ item.text }}</Option>
                </Select>
              </FormItem>
              <FormItem label="URL：" prop="url">
                <Input
                  v-model="formItem.url"
                  placeholder="URL"
                  maxlength="50"
                  show-word-limit
                  style="width:520px"
                />
              </FormItem>
              <FormItem :label="$t('page.description') + '：'" prop="description">
                <Input
                  v-model="formItem.description"
                  :placeholder="$t('page.description')"
                  maxlength="50"
                  show-word-limit
                  style="width:520px"
                />
              </FormItem>

              <FormItem :label="$t('term.framework.isenable') + '：'" prop="isActive">
                <i-switch v-model="formItem.isActive" :true-value="1" :false-value="0">
                  <span slot="open"></span>
                  <span slot="close"></span>
                </i-switch>
              </FormItem>
              <FormItem :label="$t('term.framework.defaultopen') + '：'" prop="isAuto">
                <i-switch v-model="formItem.isAuto" :true-value="1" :false-value="0">
                  <span slot="open"></span>
                  <span slot="close"></span>
                </i-switch>
              </FormItem>
              <FormItem :label="$t('term.framework.openmode') + '：'" prop="openMode">
                <RadioGroup v-model="formItem.openMode">
                  <Radio label="tab">{{ $t('term.framework.hrefself') }}</Radio>
                  <Radio label="blank">{{ $t('term.framework.newtab') }}</Radio>
                </RadioGroup>
              </FormItem>
              <FormItem :label="$t('term.framework.selecticon') + '：'" prop="icon">
                <Input v-model="formItem.icon" style="display:none" />
                <a href="javascript:void(0)" @click="changeIcon = true">
                  <i id="menuIcon" :class="[formItem.icon, { square: formItem.icon == '' }]" style="color:#666;"></i>
                  <span>{{ $t('page.choose') }}</span>
                </a>
                <Drawer
                  id="menuDrawer"
                  v-model="changeIcon"
                  :title="$t('term.framework.iconselect')"
                  width="900"
                  :mask-closable="false"
                >
                  <div class="select-icon tsscroll-container">
                    <div
                      v-for="(item, index) in menuicon"
                      :key="index"
                      class="iconclass-item"
                      :class="{ actived: index === iconindex }"
                      @click="selecticon(item, index)"
                    >
                      <i :class="item.icon" style="font-size:25px" aria-hidden="true"></i>
                      <div class="fz12 text-lighten">{{ item.icon }}</div>
                    </div>
                  </div>
                  <div class="drawer-footer">
                    <Button style="margin-right: 8px" @click="(changeIcon = false), (formItem.icon = ''), (iconindex = '')">{{ $t('page.cancel') }}</Button>
                    <Button type="primary" @click="changeIcon = false">{{ $t('page.confirm') }}</Button>
                  </div>
                </Drawer>
              </FormItem>
              <FormItem :label="$t('page.authority') + '：'" prop="selectRole">
                <!-- <Select multiple filterable v-model="formItem.selectRole" style="width:520px">
                  <Option
                    v-for="item in formItem.roleNameList"
                    :value="item.value"
                    :key="item.value"
                  >{{ item.label }}</Option>
                </Select> -->
                <UserSelect
                  :value.sync="formItem.authorityList"
                  width="100%"
                  :groupList="['processUserType', 'user', 'team', 'role', 'common']"
                  style="width:520px"
                ></UserSelect>
                <!-- {{formItem.selectRole}} -->
              </FormItem>
            </Form>
          </div>
        </div>
      </template>
    </TsContain>
    <div class="btn-bar">
      <div class="btn-group">
        <Button type="primary" @click="submitbtn()">{{ $t('page.save') }}</Button>
      </div>
    </div>
  </div>
</template>

<script>
import '@/resources/assets/js/jquery-1.11.1.js';
import '@/resources/plugins/ztree/js/jquery.ztree.all.min.js';
import '@/resources/plugins/ztree/css/zTreeStyle.css';
import UserSelect from '@/resources/components/UserSelect/UserSelect.vue';
export default {
  name: '',

  components: { 
    UserSelect
  },
  props: [],
  data() {
    return {
      changeIcon: false,
      iconindex: '', //选中图标index
      menuicon: [
        {
          keyword: 'setting ' + this.$t('page.setting') + ' ' + this.$t('page.config'),
          icon: 'ts-setting'
        },
        {
          keyword: 'search ' + this.$t('page.search'),
          icon: 'tsfont-search'
        },
        {
          keyword: 'upload ' + this.$t('page.upload'),
          icon: 'ts-upload'
        },
        {
          keyword: 'link ' + this.$t('page.link'),
          icon: 'tsfont-attachment'
        },
        {
          keyword: '',
          icon: 'ts-notice'
        },
        {
          keyword: '',
          icon: 'tsfont-question-o'
        },
        {
          keyword: '',
          icon: 'ts-alert'
        },
        {
          keyword: '',
          icon: 'ts-linechart'
        },
        {
          keyword: '',
          icon: 'ts-m-request'
        },
        {
          keyword: '',
          icon: 'ts-typelist'
        },
        {
          keyword: '',
          icon: 'ts-m-works'
        },
        {
          keyword: '',
          icon: 'ts-dev-security'
        },
        {
          keyword: '',
          icon: 'ts-email'
        },
        {
          keyword: '',
          icon: 'ts-tags'
        },
        {
          keyword: '',
          icon: 'ts-m-playbook'
        },
        {
          keyword: '',
          icon: 'ts-batch-ops'
        },
        {
          keyword: '',
          icon: 'ts-m-batchdeploy'
        },
        {
          keyword: '',
          icon: 'ts-m-stack'
        },
        {
          keyword: '',
          icon: 'ts-m-signature'
        },
        {
          keyword: '',
          icon: 'ts-dictionary'
        },
        {
          keyword: '',
          icon: 'ts-report'
        },
        {
          keyword: '',
          icon: 'ts-m-auth'
        },
        {
          keyword: '',
          icon: 'ts-cloud'
        },
        {
          keyword: '',
          icon: 'ts-pulse'
        },
        {
          keyword: '',
          icon: 'ts-m-dashboard'
        },
        {
          keyword: '',
          icon: 'ts-m-dashboard-job'
        },
        {
          keyword: '',
          icon: 'ts-m-auth'
        },
        {
          keyword: '',
          icon: 'ts-m-browser'
        },
        {
          keyword: '',
          icon: 'ts-m-certificate'
        },
        {
          keyword: '',
          icon: 'ts-m-callcenter'
        },
        {
          keyword: '',
          icon: 'ts-m-cmdb'
        },
        {
          keyword: '',
          icon: 'ts-m-ip'
        },
        {
          keyword: '',
          icon: 'ts-m-home'
        },
        {
          keyword: '',
          icon: 'ts-m-monitor'
        },
        {
          keyword: '',
          icon: 'ts-m-plugin'
        },
        {
          keyword: '',
          icon: 'ts-m-octopus'
        },
        {
          keyword: '',
          icon: 'ts-m-apm'
        },
        {
          keyword: '',
          icon: 'ts-m-deployment'
        },
        {
          keyword: '',
          icon: 'ts-sitemap'
        }
      ],
      formItem: {
        id: null,
        parentName: '-',
        parentId: 1,
        formtitle: this.$t('dialog.title.addtarget', {target: this.$t('term.framework.firstlevelmenu')}),
        name: '', //名称
        url: '', //url
        description: '', //描述
        moduleList: [
          //模块列表
        ],
        selectmodule: '',
        isActive: 1, //是否启用
        isAuto: 1, //是否打开
        openMode: 'tab', //打开方式
        icon: '',
        authorityList: []
      },
      menurules: {
        name: [{ required: true, message: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.name')}), trigger: 'blur' }],
        selectmodule: [{ required: true, message: this.$t('form.placeholder.pleaseselect', {target: this.$t('term.framework.belongmodule')}), trigger: 'change' }],
        icon: [{ required: true, message: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.tag')}), trigger: 'change' }]
      },
      setting: {
        view: {
          showIcon: false,
          dblClickExpand: true,
          showLine: true,
          selectedMulti: false,
          nameIsHTML: true,
          enable: true,
          showTitle: false,
          addHoverDom: this.addHoverDom,
          removeHoverDom: this.removeHoverDom
        },
        data: {
          simpleData: {
            enable: true,
            idKey: 'id',
            pIdKey: 'parentId'
          }
        },
        callback: {
          // beforeDrag: beforeDrag,
          // beforeDrop: beforeDrop,
          // onDrop : onDrop,
          // onClick:editNode,
          beforeClick: this.ztreeClick
        },
        edit: {
          drag: {
            isCopy: false,
            isMove: true,
            prev: true,
            next: true,
            inner: false
          },
          showRemoveBtn: false,
          showRenameBtn: false,
          enable: true
        }
      },
      zNodes: []
    };
  },
  beforeCreate() {},
  created() {
    this.getztree();
    this.getModelList();
  },
  beforeMount() {},

  mounted() {
    let _this = this;
    window.addchildren = function(treeNodename, treeId) {
      _this.addchildren(treeNodename, treeId);
    };
    window.delchildren = function(id) {
      _this.delchildren(id);
    };
  },

  methods: {
    //获取左侧树节点
    getztree: function() {
      var _this = this;
      this.$api.framework.menu
        .menuList()
        .then(res => {
          if (res) {
            if (res.Status == 'OK') {
              let menuList = res.Return.menuList;
              _this.zNodes = menuList;
              $.fn.zTree.init($('#treeDemo'), _this.setting, _this.zNodes).expandAll(true);
            } else {
              //
            }
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    //树节点点击事件
    ztreeClick: function(treeId, treeNode, clickFlag) {
      let _this = this.formItem;
      _this.formtitle = _this.$t('dialog.title.edittarget', {target: _this.$t('page.menu')});
      _this.id = treeNode.id;
      if (treeNode.parentName !== null) {
        _this.parentName = treeNode.parentName;
      } else {
        _this.parentName = 'root';
      }
      if (treeNode.parentId !== null) {
        _this.parentId = treeNode.parentId;
      } else {
        _this.parentId = 1;
      }
      _this.name = treeNode.name;
      _this.url = treeNode.url;
      _this.description = treeNode.description;
      _this.selectmodule = treeNode.module;
      _this.isActive = treeNode.isActive;
      _this.isAuto = treeNode.isAuto;
      _this.icon = treeNode.icon;
      event.preventDefault(); //阻止跳转
    },
    //点击添加一级菜单
    addZtree: function(name) {
      this.formItem.formtitle = this.$t('dialog.title.addtarget', {target: this.$t('term.framework.firstlevelmenu')});
      let treeObj = $.fn.zTree.getZTreeObj('treeDemo');
      treeObj.cancelSelectedNode();
      this.$refs[name].resetFields();
      this.formItem.id = null;
      this.formItem.parentId = 1;
      this.iconindex = '';
    },
    //鼠标移进节点
    addHoverDom: function(treeId, treeNode) {
      //   if (!isCanDo) {
      // 	return false;
      // }
      let name = treeNode.name;
      let id = treeNode.id;
      let sObj = $('#' + treeNode.tId + '_span');
      if (treeNode.editNameFlag || $('#addBtn_' + treeNode.id).length > 0 || $('#delBtn_' + treeNode.id).length > 0) {
        return;
      }
      let addStr = `<i class="tsfont-plus addbtn" id="addBtn_${treeNode.id}" title="${this.$t('term.framework.childmenu')}" onfocus="this.blur();" style="color:#999;padding-top: 6px;"></i>`;
      let delStr = `<i class="tsfont-trash-o delbtn" id="delBtn_${treeNode.id}" title="${this.$t('dialog.title.deletetarget', {target: this.$t('page.menu')})}" onfocus="this.blur();" style="color:#999;padding-top: 6px;"></i>`;
      sObj.after(delStr);
      if (treeNode.parentId == null) {
        sObj.after(addStr);
      }
      sObj.siblings('.addbtn').click(function(e) {
        let treeObj = $.fn.zTree.getZTreeObj('treeDemo');
        treeObj.selectNode(treeNode); //更改选中的状态
        addchildren(name, id);
        e.stopPropagation();
      });
      sObj.siblings('.delbtn').click(function(e) {
        delchildren(id);
        e.stopPropagation();
      });
    },
    //鼠标移出节点
    removeHoverDom: function(treeId, treeNode) {
      $('#addBtn_' + treeNode.id).remove();
      $('#delBtn_' + treeNode.id).remove();
    },
    //添加子菜单
    addchildren: function(treeNodename, treeId) {
      this.$refs.formItem.resetFields();
      let _this = this.formItem;
      _this.formtitle = _this.$t('dialog.title.addtarget', {target: this.$t('term.framework.firstlevelmenu')});
      _this.parentName = treeNodename;
      _this.parentId = treeId;
      _this.id = null;
      this.iconindex = '';
    },
    //删除菜单
    delchildren: function(id) {
      var _this = this;
      let data = {
        id: id
      };

      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.menu')}),
        btnType: 'error',
        'on-ok': vnode => {
          _this.$api.framework.menu
            .delMenu(data)
            .then(res => {
              vnode.isShow = false;
              if (res) {
                if (res.Status == 'OK') {
                  this.$Message.success(this.$t('message.deletesuccess'));
                  this.getztree();
                }
              }
            })
            .catch(error => {
              vnode.isShow = false;
              this.$Message.error(this.$t('message.deletefailed'));
            });
        }
      });
    },
    //添加菜单
    submitbtn: function() {
      this.$refs.formItem.validate(valid => {
        if (valid) {
          let _this = this.formItem;
          let formData = {
            id: _this.id,
            parentId: _this.parentId,
            parentName: _this.parentName,
            name: _this.name,
            url: _this.url,
            description: _this.description,
            module: _this.selectmodule,
            isActive: _this.isActive,
            isAuto: _this.isAuto,
            openMode: _this.openMode,
            icon: _this.icon,
            roleNameList: _this.roleNameList
          };
          this.$api.framework.menu
            .saveMenu(formData)
            .then(res => {
              if (res) {
                if (res.Status == 'OK') {
                  this.$Message.success(this.$t('message.savesuccess'));
                  this.getztree();
                } else {
                  //
                }
              }
            })
            .catch(error => {
              this.$Message.error(this.$t('message.savefailed'));
            });
        } else {
          this.$Message.error(this.$t('term.framework.formuncomplete'));
        }
      });
    },
    //选择图标
    selecticon: function(item, index) {
      this.iconindex = index;
      this.formItem.icon = item.icon;
    },
    //获取模块列表
    getModelList: function() {
      let data = {};
      this.$api.common
        .getModule(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.formItem.moduleList = res.Return;
            console.log(this.formItem);
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
    //获取权限列表
  },

  computed: {},

  watch: {}
};
</script>

<style lang="less">
.menumanagement {
  .body-left {
    .body-left-title {
      .add {
        float: right;
      }
      span {
        font-size: 16px;
      }
      a {
        font-size: 14px;
      }
      #btnAddMenu {
        margin-right: 16px;
      }
    }
  }
  .body-right {
    position: relative;
    .step-panel {
      padding-bottom: 56px;
      .body-right-top {
        height: 60px;
        line-height: 60px;
        padding-left: 10px;
        color: #3a3a3a;
        font-size: 16px;
      }
      .square {
        border: 1px solid #ddd;
        border-radius: 5px;
        width: 32px;
        height: 32px;
      }
      #menuIcon {
        font-size: 1.6em;
        display: inline-block;
        vertical-align: middle;
        margin-right: 5px;
      }
    }
    .ivu-input[disabled],
    fieldset[disabled] .ivu-input {
      color: #666;
    }
  }
  .btn-bar {
    position: absolute;
    width: 100%;
    height: 56px;
    bottom: 0;
    left: 0;
    background-color: #fff;
    box-shadow: 0px -1px 2px 0px rgba(0, 0, 0, 0.04);
    line-height: 56px;
    text-align: right;
    padding-right: 24px;
  }
}
#menuDrawer {
  .select-icon {
    width: 100%;
    height: 100%;
    padding-bottom: 40px;
    .iconclass-item {
      cursor: pointer;
      border-radius: 4px;
      padding: 5px;
      text-align: center;
      display: inline-block;
      margin: 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 200px;
      text-align: center;
      border: 0px solid #eee;
      &:hover {
        color: #336eff;
      }
      .text-lighten {
        color: #999;
      }
    }
    .actived {
      background-color: #e9eefb;
      border-color: #e9eefb !important;
    }
  }
  .drawer-footer {
    background-color: #fff;
    border-top: 1px solid #dddddd;
    padding: 8px;
    text-align: right;
    position: absolute;
    bottom: 0px;
    left: 0px;
    width: 100%;
  }
}
</style>
