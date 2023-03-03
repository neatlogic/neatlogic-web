<template>
  <div class="service-management">
    <TsContain
      :isSiderHide="isSiderHide"
      border="border"
      :siderWidth="300"
      :enableCollapse="true"
    >
      <template v-slot:navigation>
        <i class="tsfont-plus add-root text-action" @click="addRootCatalog()">{{ $t('page.rootdirectory') }}</i>
      </template>
      <template v-slot:topLeft>
        <span>{{ formTitle }}</span>
      </template>
      <template v-slot:topRight>
        <div class="div-btn-contain action-group">
          <span v-if="formType == 'catalog'" class="action-item tsfont-plus" @click="addSubcatalog">{{ $t('page.subdirectory') }}</span>
          <span
            v-if="!$utils.isEmpty(catalogData.id) || !$utils.isEmpty(serviceData.id)" 
            :class="[(childrenCount != 0 && !$utils.isEmpty(childrenCount)) || disabledConfig.saving ? 'disable' : '', 'action-item tsfont-trash-o']"
            @click="delService()"
          >
            {{ formType == 'catalog' ? $t('term.autoexec.deletedirectory') : $t('term.autoexec.deleteservice') }}
          </span>
          <div class="action-item">
            <Button
              :disabled="disabledConfig.saving"
              type="primary"
              @click="saveCurrent()"
            >{{ $t('button.save') }}</Button>
          </div>
        </div>
      </template>
      <template v-slot:sider>
        <div class="border-color pl-md pr-md">
          <div v-scrollHidden class="left_wrapper">
            <Loading v-if="treeloading" :loadingShow="treeloading" type="fix"></Loading>
            <div class="search">
              <TsFormSelect v-bind="tsFormSelectSetting" tranfer @on-change="selectChannel"></TsFormSelect>
            </div>
            <div v-if="TsZtree.zNodes.length > 0" class="left_tree">
              <TsZtree v-if="TsZtree.zNodes && TsZtree.zNodes.length > 0" ref="ztree" v-bind="TsZtree"></TsZtree>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <div class="content pt-md" :class="[!isSiderHide ? 'ml-md' : '', formType == 'catalog' ? 'radius-lg bg-op' : '']">
          <div v-if="selectedTreeId" class="right_content input-border">
            <Component
              :is="formType"
              :id="selectedTreeId"
              :ref="formType"
              :type="formType"
              :selectedTreeNode="selectedTreeData"
              @save="saveEdit"
              @updateName="updateName"
            ></Component>
          </div>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
import scrollHidden from '@/resources/directives/scroll-hidden.js';
export default {
  name: 'CatalogManage',
  components: {
    TsZtree: resolve => require(['@/resources/plugins/ztree/TsZtree.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    catalog: resolve => require(['./catalog.vue'], resolve),
    service: resolve => require(['./service.vue'], resolve)
  },
  directives: {scrollHidden},
  props: {},
  data() {
    return { 
      isSiderHide: false,
      formType: 'catalog', //表单类型,默认目录表单
      formTitle: this.$t('term.autoexec.editdirectory'),
      treeloading: true,
      childrenCount: null,
      selectSaveId: '', //保存选中id
      serviceId: null,
      selectedTreeId: null,
      selectedTreeNode: {},
      selectedTreeData: {},
      catalogData: {
        //目录数据
        id: null,
        parentId: 0,
        name: ''
      },
      serviceData: {
        //服务数据
        id: null,
        parentId: 0,
        name: ''
      },
      tsFormSelectSetting: {
        name: 'ServiceSearch',
        search: true,
        dynamicUrl: '/api/rest/autoexec/service/search',
        rootName: 'tbodyList',
        valueName: 'id',
        textName: 'name',
        onChange: this.changeSelect,
        placeholder: this.$t('term.autoexec.searchservice'),
        transfer: true,
        border: 'bottom'
      },
      disabledConfig: {
        //禁止按钮连续调用接口
        deleting: false,
        saving: false
      },
      TsZtree: {
        id: 'service-management',
        zNodes: [],
        setting: {
          addDomList: [
            {
              icon: 'tsfont-plus',
              desc: this.$t('page.subdirectory'),
              isAddFn: function(treeNode) {
                if (treeNode.type == 'catalog') {
                  return true;
                } else {
                  return false;
                }
              },
              clickFn: (treeNode) => {
                this.addCatalogChildren(treeNode);
              }
            },
            {
              icon: 'ts-page',
              desc: this.$t('term.autoexec.addservice'),
              isAddFn: function(treeNode) {
                if (treeNode.type == 'catalog') {
                  return true;
                } else {
                  return false;
                }
              },
              clickFn: (treeNode) => {
                this.addService(treeNode);
              }
            },
            {
              icon: 'tsfont-trash-o',
              desc: this.$t('button.delete'),
              initFn: (treeNode, $span) => {
                if (treeNode.childrenCount != 0 && !this.$utils.isEmpty(treeNode.childrenCount)) {
                  $span[0].classList.add('text-disabled');
                  $span[0].title = this.$t('term.autoexec.citecatalognodelete');
                }
              },
              clickFn: (treeNode) => {
                this.deleteSeriveById(treeNode);
              }
            }
          ],
          view: {
            showIcon: true
          },
          data: {
            simpleData: {
              idKey: 'id',
              pIdKey: 'parentId'
            }
          },
          callback: {
            onClick: this.ztreeClick,
            onDrop: this.onDrop
          },
          edit: {
            drag: {
              autoExpandTrigger: true,
              isMove: true,
              prev: this.dropPrev,
              inner: this.dropInner,
              next: this.dropNext
            }
          }
        }
      }
    };
  },
  created() {
    let query = this.$route.query;
    if (query && query.id) {
      this.serviceId = parseInt(query.id);
      console.log(this.serviceId);
    }
  },
  beforeMount() {},
  mounted() {
    setTimeout(() => {
      this.getTreeList(true);
    }, 20);
  },
  methods: {
    addSubcatalog() {
      // 添加子目录
      if (this.selectedTreeNode && !this.$utils.isEmptyObj(this.selectedTreeNode)) {
        this.addCatalogChildren(this.selectedTreeNode);
      }
    },
    //获取服务目录服务树
    getTreeList(val) {
      this.$api.autoexec.catalogManage.getAllSeriveTree().then(res => {
        if (res.Status == 'OK') {
          let treeList = res.Return;
          this.TsZtree.zNodes = treeList;
          this.$nextTick(() => {
            if (val) {
              setTimeout(() => {
                if (val && this.serviceId) {
                  this.$refs.ztree && this.$refs.ztree.selectedNodeById(this.serviceId);
                } else if (val && treeList && treeList.length > 0) {
                  this.$refs.ztree && this.$refs.ztree.selectedNodeById(treeList[0].id);
                } else {
                  this.addRootCatalog();
                }
                this.treeloading = false;
              }, 20);
            } else {
              setTimeout(() => {
                this.$refs.ztree.selectedNodeById(this.selectSaveId);
                this.treeloading = false;
              }, 20);
            }
          });
        }
      });
    },
    //服务树点击事件
    ztreeClick: function(event, treeId, treeNode) {
      this.selectedTreeNode = treeNode;
      this.formType = treeNode.type;
      if (this.formType == 'service') {
        this.formTitle = this.$t('term.autoexec.editservice');
        this.childrenCount = treeNode.childrenCount;
        this.$set(this.serviceData, 'id', treeNode.id);
        this.$set(this.serviceData, 'parentId', treeNode.parentId);
        this.$set(this.serviceData, 'name', treeNode.name);
      } else if (this.formType == 'catalog') {
        this.formTitle = this.$t('term.autoexec.editdirectory');
        this.childrenCount = treeNode.childrenCount;
        this.$set(this.catalogData, 'id', treeNode.id);
        this.$set(this.catalogData, 'parentId', treeNode.parentId);
        this.$set(this.catalogData, 'name', treeNode.name);
      }
      this.selectedTreeId = treeNode.id;
      this.selectedTreeData = treeNode;
    },
    changeSelect(val) {
      // tsformSelect 选中
      this.$refs.ztree.selectedNodeById(val);
    },
    //添加根目录按钮
    addRootCatalog() {
      this.formType = 'catalog';
      this.formTitle = this.$t('term.autoexec.addrootdirectory');
      this.catalogData = {
        parentId: 0,
        id: null,
        name: ''
      };
      this.selectedTreeId = true;
      this.selectedTreeData = {};
    },
    //搜索服务点击
    selectChannel(val) {
      this.$set(this.serviceData, 'id', val);
    },
    //保存信息
    save() {
      if (!this.disabledConfig.saving) {
        this.disabledConfig.saving = true;
        if (this.formType == 'catalog') {
          this.$api.autoexec.catalogManage.saveSeriveInfo(this.catalogData)
            .then(res => {
              this.disabledConfig.saving = false;
              if (res.Status == 'OK') {
                this.selectSaveId = res.Return;
                this.$Message.success(this.$t('message.content.savesuccess'));
                this.getTreeList();
              }
            })
            .catch(error => {
              this.disabledConfig.saving = false;
            });
        } else if (this.formType == 'service') {
          this.$api.autoexec.catalogManage.saveSeriveInfo(this.serviceData)
            .then(res => {
              this.disabledConfig.saving = false;
              if (res.Status == 'OK') {
                this.selectSaveId = res.Return;
                this.$Message.success(this.$t('message.content.savesuccess'));
                this.getTreeList();
              }
            })
            .catch(error => {
              this.disabledConfig.saving = false;
            });
        }
      }
    },
    //ztree拖动
    onDrop(event, treeId, treeNodes, targetNode, moveType, isCopy) {
      if (targetNode == null) {
        return;
      }
      let treeNode = treeNodes[0];
      let data = {
        id: treeNode.id,
        moveType: moveType,
        targetId: targetNode.id
      };
      if (moveType != null) {
        this.$api.autoexec.catalogManage
          .moveCatalog(data)
          .then(res => {
            if (res) {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.content.executesuccess'));
              }
              this.getTreeList();
            }
          });
      }
    },
    dropInner(treeId, nodes, targetNode) {
      if (nodes && nodes.length != 1) {
        return false;
      }
      if (targetNode && targetNode.type == 'service') {
        return false;
      } else if (targetNode) {
        return true;
      }
      return false;
    },
    //按钮删除信息
    delService() {
      this.deleteSeriveById({
        childrenCount: this.childrenCount,
        type: this.formType,
        id: this.formType == 'catalog' ? this.catalogData.id : this.serviceData.id,
        name: this.formType == 'catalog' ? this.catalogData.name : this.serviceData.name
      });
    },
    //树节点删除
    deleteSeriveById(treeNode) {
      if (treeNode.childrenCount > 0) {
        return false;
      }
      let data = {
        id: treeNode.id
      };
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: treeNode.name}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.autoexec.catalogManage
            .deleteService(data)
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.content.deletesuccess'));
                vnode.isShow = false;
                this.getTreeList(true);
              }
            });
        }
      });
    },
    //添加子目录
    addCatalogChildren(treeNode) {
      this.$refs.ztree.updateNodeById(treeNode.id);
      this.formTitle = this.$t('dialog.title.addtarget', {target: this.$t('page.subdirectory')});
      this.formType = 'catalog';
      this.catalogData.parentId = treeNode.id;
      this.catalogData.id = '';
      this.catalogData.name = '';
      this.selectedTreeId = true;
      this.selectedTreeData = treeNode;
    },
    //添加服务
    addService(treeNode) {
      this.$refs.ztree && this.$refs.ztree.updateNodeById(treeNode.id);
      this.formTitle = this.$t('term.autoexec.addservice');
      this.formType = 'service';
      this.serviceData.parentId = treeNode.id;
      this.serviceData.id = '';
      this.serviceData.name = '';
      this.selectedTreeId = true;
      this.selectedTreeData = treeNode;
    },
    saveEdit(data) {
      //底部保存按钮
      if (data) {
        if (this.formType == 'service') {
          Object.assign(this.serviceData, data);
        } else if (this.formType == 'catalog') {
          Object.assign(this.catalogData, data);
        }
        this.save();
      }
    },
    saveCurrent() {
      //顶部保存按钮
      if (this.formType == 'service') {
        this.$refs.service.saveService();
      } else if (this.formType == 'catalog') {
        this.$refs.catalog.save();
      }
    },
    updateName(name) {
      this.serviceData.name = name;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/my-theme.less';
.service-management {
  .title {
    font-size: @font-size-chart;
  }
  /deep/.tscontain-body{
    padding-left:0px!important;
  }
  /deep/.ivu-split-pane{
    overflow-x: initial;
    overflow-y: initial;
  }
  .left_wrapper {
    width: 100%;
    height: 100%;
    .add-root {
      width: 100%;
      text-align: right;
      cursor: pointer;
      height: 20px;
    }
    .search {
      width: 100%;
      height: 40px;
    }
    .left_tree {
      .ztree {
        /deep/ li {
          overflow: inherit!important;
          width: 100%;
          a span{
            vertical-align: baseline;
          }
          span.button{
            margin-top: initial!important;
          }
        }
      }
    }
    .left_footer {
      text-align: center;
      cursor: pointer;
    }
  }
  .right_content {
    height: 100vh;
  }
  /deep/ .ivu-layout-content {
    overflow-y: hidden;
  }
  /deep/ .content {
    height: 100%;
    overflow: auto;
    .right {
      position: relative;
      height: 100%;
      overflow: hidden;
      padding: 0 @space-md;
      .right_content {
        padding-bottom: @space-md;
        .tsForm > .ivu-form-item {
          margin-bottom: 24px;
        }
        .selectColor {
          width: 30px;
          height: 30px;
          display: inline-block;
          margin-left: 10px;
        }
        .save {
          margin-left: 120px;
          margin-bottom: @space-md;
        }
      }
      .square {
        border: 1px solid;
        border-radius: 5px;
        width: 32px;
        height: 32px;
      }
      .menuIcon {
        font-size: 1.6em;
        display: inline-block;
        vertical-align: middle;
        margin-right: 5px;
      }
      .ckeditor {
        margin-top: 10px;
      }
      .slotForm {
        width: 75%;
        position: relative;
        .view {
          position: absolute;
          right: 0;
          top: -28px;
          height: 28px;
        }
      }
    }
  }
}
</style>
