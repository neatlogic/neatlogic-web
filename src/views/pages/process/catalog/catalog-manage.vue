<template>
  <div class="service-management">
    <TsContain
      :isSiderHide="isSiderHide"
      border="border"
      :siderWidth="300"
      :enableCollapse="true"
    ><template v-slot:navigation>
       <i class="tsfont-plus add-root text-action" @click="addRoot()">{{ $t('page.rootdirectory') }}</i>
     </template>
      <template v-slot:topLeft>
        <span>{{ formTitle }}</span>
      </template>
      <template v-slot:topRight>
        <div class="div-btn-contain action-group">
          <span v-if="catalogData.uuid !== '' || channelData.uuid !== ''" :class="[!(childrenCount == undefined || childrenCount == 0) || disabledConfig.saving ? 'disable' : '', 'action-item tsfont-trash-o']" @click="del()">{{ $t('page.delete') }}</span>
          <span :class="{ disable: disabledConfig.saving }" class="action-item ts-save" @click="saveCurrent()">{{ $t('page.save') }}</span>
        </div>
      </template>
      <template v-slot:sider>
        <div class="border-color pl-md pr-md">
          <div v-scrollHidden class="left_wrapper">
            <Loading v-if="treeloading" :loadingShow="treeloading" type="fix"></Loading>
            <div class="search">
              <TsFormSelect v-bind="selectSeting" tranfer @on-change="selectChannel"></TsFormSelect>
            </div>
            <div v-if="TsZtree.zNodes.length > 0">
              <TsZtree v-if="TsZtree.zNodes && TsZtree.zNodes.length > 0" ref="ztree" v-bind="TsZtree"></TsZtree>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <div class="content bg-op pt-md ts-border" :class="!isSiderHide ? 'ml-md' : ''">
          <div v-if="selectedUuid" class="right_content input-border">
            <item
              :is="formType"
              :ref="formType"
              :uuid="selectedUuid"
              @save="saveEdit"
              @updateName="updateName"
            ></item>
          </div>
        </div>
      </template>
    </TsContain>

  </div>
</template>
<script>
import TsZtree from '@/resources/plugins/ztree/TsZtree.vue';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect.vue';
import catalog from './catalog/edit/catalog.vue';
import channel from './catalog/edit/channel.vue';
import scrollHidden from '@/resources/directives/scroll-hidden.js';
export default {
  name: 'CatalogManage',
  components: {
    TsZtree,
    TsFormSelect,
    catalog,
    channel
  },
  directives: {scrollHidden},
  props: [''],
  data() {
    let _this = this;
    return { 
      isSiderHide: false,
      formType: 'catalog', //表单类型,默认目录表单
      formTitle: this.$t('dialog.title.edittarget', { target: this.$t('page.catalogue') }), //表单标题
      treeloading: true,
      parentUuid: '', //浏览器携带根目录
      processUuid: '', //流程id
      uuid: '', //服务id
      childrenCount: null,
      selectSaveUuid: '', //保存选中uuid
      selectedUuid: null,
      catalogData: {
        //目录数据
        uuid: '',
        parentUuid: '0'
      },
      channelData: {
        //服务数据
        uuid: '',
        parentUuid: '0'
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
              clickFn: function(treeNode) {
                _this.addCatalogChildren(treeNode);
              }
            },
            {
              icon: 'ts-page',
              desc: this.$t('dialog.title.addtarget', { target: this.$t('term.process.catalog') }),
              isAddFn: function(treeNode) {
                if (treeNode.type == 'catalog') {
                  return true;
                } else {
                  return false;
                }
              },
              clickFn: function(treeNode) {
                _this.addChannel(treeNode);
              }
            },
            {
              icon: 'tsfont-trash-o',
              desc: this.$t('page.delete'),
              initFn: function(treeNode, $span) {
                if (treeNode.childrenCount == undefined || treeNode.childrenCount == 0) {
                  //
                } else {
                  $span[0].classList.add('text-disabled');
                  $span[0].title = treeNode.type == 'catalog' ? _this.$t('term.autoexec.citecatalognodelete') : _this.$t('term.autoexec.citeservicenodelete');
                }
              },
              clickFn: function(treeNode) {
                _this.treeDel(treeNode);
              }
            }
          ],
          view: {
            showIcon: true
          },
          data: {
            simpleData: {
              idKey: 'uuid',
              pIdKey: 'parentUuid'
            }
          },
          callback: {
            onClick: this.ztreeClick,
            onDrop: _this.onDrop
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
      },
      selectSeting: {
        name: 'ServiceSearch',
        search: true,
        dynamicUrl: '/api/rest/process/catalog/channel/search',
        rootName: 'treeList', //通过url来获取数据的rootName
        valueName: 'uuid', //option渲染值
        textName: 'name', //text渲染值
        onChange: _this.treeselect,
        placeholder: this.$t('page.search'),
        transfer: true,
        border: 'bottom'
      },
      channelRelationList: [],
      disabledConfig: {
        //禁止按钮连续调用接口
        deleting: false,
        saving: false
      }
    };
  },

  created() {
    this.parentUuid = this.$route.query.parentUuid || '';
    this.processUuid = this.$route.query.processUuid || '';
    this.uuid = this.$route.query.uuid || '';
  },

  beforeMount() {},

  mounted() {
    setTimeout(() => {
      this.getTree(true);
    }, 20);
  },

  methods: {
    verticals() {
      this.isSiderHide = !this.isSiderHide;
    },
    // getItemlist: function(arr) {
    //   for (var i in arr) {
    //     arr[i].expand = true;
    //     if (arr[i].children && arr[i].children.length > 0) {
    //       this.getItemlist(arr[i].children);
    //     }
    //   }
    //   return arr;
    // },
    //获取服务目录服务树
    getTree: function(val) {
      let data = {};
      this.$api.process.service.searchTree(data).then(res => {
        if (res.Status == 'OK') {
          let treeList = res.Return;
          this.TsZtree.zNodes = treeList;
          this.$nextTick(() => {
            if (val) {
              setTimeout(() => {
                if (this.parentUuid != '') {
                  this.$refs.ztree && this.$refs.ztree.selectedNodeById(this.parentUuid);
                  this.addChannel(this.parentUuid);
                }
                if (this.uuid != '') {
                  this.$refs.ztree && this.$refs.ztree.selectedNodeById(this.uuid);
                } else if (val && this.parentUuid == '' && this.uuid == '' && treeList && treeList.length > 0) {
                  this.$refs.ztree && this.$refs.ztree.selectedNodeById(treeList[0].uuid);
                } else {
                  this.addRoot();
                }
                this.treeloading = false;
              }, 20);
            } else {
              setTimeout(() => {
                this.$refs.ztree.selectedNodeById(this.selectSaveUuid);
                this.treeloading = false;
              }, 20);
            }
          });
        }
      });
    },
    //服务树点击事件
    ztreeClick: function(event, treeId, treeNode) {
      let _this = this;
      this.formType = treeNode.type;
      if (this.formType == 'channel') {
        // this.$refs.channel.clearForm();
        this.formTitle = this.$t('dialog.title.edittarget', { target: this.$t('term.process.catalog') });
        this.childrenCount = treeNode.childrenCount;
        this.$set(this.channelData, 'uuid', treeNode.uuid);
        this.$set(this.channelData, 'parentUuid', treeNode.parentUuid);
      } else if (this.formType == 'catalog') {
        this.formTitle = this.$t('dialog.title.edittarget', { target: this.$t('page.catalogue') });
        // this.$refs.catalog.clearForm();
        this.childrenCount = treeNode.childrenCount;
        this.$set(this.catalogData, 'uuid', treeNode.uuid);
        this.$set(this.catalogData, 'parentUuid', treeNode.parentUuid);
      }
      this.selectedUuid = treeNode.uuid;
    },
    //树select选择中
    treeselect: function(val) {
      let uuid = val;
      this.$refs.ztree.selectedNodeById(uuid);
    },
    //添加根目录按钮
    addRoot: function() {
      this.formType = 'catalog';
      this.formTitle = this.$t('dialog.title.addtarget', { target: this.$t('page.rootdirectory') });
      this.catalogData.parentUuid = '0';
      this.catalogData.uuid = '';
      this.selectedUuid = true;
    },
    //搜索服务点击
    selectChannel: function(val) {
      let selectUuid = val;
      this.$set(this.channelData, 'uuid', val);
    },
    //保存信息
    save: function() {
      if (!this.disabledConfig.saving) {
        this.disabledConfig.saving = true;
        if (this.formType == 'catalog') {
          this.$api.process.service
            .saveCatalogInfo(this.catalogData)
            .then(res => {
              this.disabledConfig.saving = false;
              if (res.Status == 'OK') {
                this.selectSaveUuid = res.Return;
                this.$Message.success(this.$t('message.savesuccess'));
                this.getTree();
              }
            })
            .catch(error => {
              this.disabledConfig.saving = false;
            });
        } else if (this.formType == 'channel') {
          this.$api.process.service
            .saveChannelInfo(this.channelData)
            .then(res => {
              this.disabledConfig.saving = false;
              if (res.Status == 'OK') {
                this.selectSaveUuid = res.Return;
                this.$Message.success(this.$t('message.savesuccess'));
                this.getTree();
              }
            })
            .catch(error => {
              this.disabledConfig.saving = false;
            });
        }
      }
    },
    //ztree拖动
    onDrop: function(event, treeId, treeNodes, targetNode, moveType, isCopy) {
      if (targetNode == null) {
        return;
      }
      var treeNode = treeNodes[0];
      var parentId = null;
      var keyId = 'uuid';
      if (moveType == 'inner') {
        parentId = targetNode[keyId];
      } else {
        parentId = targetNode.getParentNode() == null ? 0 : targetNode.getParentNode()[keyId];
      }
      let data = {
        uuid: treeNode.uuid,
        moveType: moveType,
        parentUuid: parentId,
        targetUuid: targetNode.uuid
      };
      if (moveType != null) {
        if (moveType != null && treeNode.type == 'catalog') {
          this.$api.process.service
            .moveCatalog(data)
            .then(res => {
              if (res) {
                if (res.Status == 'OK') {
                  this.$Message.success(this.$t('message.executesuccess'));
                }
                this.getTree();
              }
            })
            .catch(error => {
              this.getTree();
            });
        } else if (moveType != null && treeNode.type == 'channel') {
          this.$api.process.service
            .moveChannel(data)
            .then(res => {
              if (res) {
                if (res.Status == 'OK') {
                  this.$Message.success(this.$t('message.executesuccess'));
                }
                this.getTree();
              }
            })
            .catch(error => {
              this.getTree();
            });
        }
      }
    },
    dropInner: function(treeId, nodes, targetNode) {
      if (nodes && nodes.length != 1) {
        return false;
      }
      var node = nodes[0];
      if (targetNode && targetNode.type == 'channel') {
        return false;
      } else if (targetNode) {
        return true;
      }
      return false;
    },
    //按钮删除信息
    del: function() {
      if (this.childrenCount > 0) {
        return false;
      }
      let refsName = this.formType;
      if (refsName == 'catalog') {
        let data = {
          uuid: this.catalogData.uuid
        };
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', {target: this.catalogData.name}),
          btnType: 'error',
          'on-ok': vnode => {
            if (!this.disabledConfig.deleting) {
              this.disabledConfig.deleting = true;
              this.$api.process.service
                .deleteCatalog(data)
                .then(res => {
                  if (res.Status == 'OK') {
                    this.$Message.success(this.$t('message.deletesuccess'));
                    vnode.isShow = false;
                    this.getTree(true);
                  }
                })
                .catch(error => {
                  this.disabledConfig.deleting = false;
                });
            }
          },
          'on-cancel': vnode => {}
        });
      } else if (refsName == 'channel') {
        let data = {
          uuid: this.channelData.uuid
        };
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', {target: this.channelData.name}),
          btnType: 'error',
          'on-ok': vnode => {
            if (!this.disabledConfig.deleting) {
              this.disabledConfig.deleting = true;
              this.$api.process.service
                .deleteChannel(data)
                .then(res => {
                  this.disabledConfig.deleting = false;
                  if (res.Status == 'OK') {
                    this.$Message.success(this.$t('message.deletesuccess'));
                    vnode.isShow = false;
                    this.getTree(true);
                  }
                })
                .catch(error => {
                  this.disabledConfig.deleting = false;
                });
            }
          },
          'on-cancel': vnode => {}
        });
      }
    },
    //树节点删除
    treeDel: function(treeNode) {
      if (treeNode.childrenCount > 0) {
        return false;
      }
      if (treeNode.type == 'catalog') {
        let data = {
          uuid: treeNode.uuid
        };
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', {target: treeNode.name}),
          btnType: 'error',
          'on-ok': vnode => {
            this.$api.process.service
              .deleteCatalog(data)
              .then(res => {
                if (res.Status == 'OK') {
                  this.$Message.success(this.$t('message.deletesuccess'));
                  vnode.isShow = false;
                  this.getTree(true);
                }
              })
              .catch(error => {
                this.$Message.error(error.data.Message);
              });
          },
          'on-cancel': vnode => {}
        });
      } else if (treeNode.type == 'channel') {
        let data = {
          uuid: treeNode.uuid
        };
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', {target: treeNode.name}),
          btnType: 'error',
          'on-ok': vnode => {
            this.$api.process.service
              .deleteChannel(data)
              .then(res => {
                if (res.Status == 'OK') {
                  this.$Message.success(this.$t('message.deletesuccess'));
                  vnode.isShow = false;
                  this.getTree(true);
                }
              });
          },
          'on-cancel': vnode => {}
        });
      }
    },
    //添加子目录
    addCatalogChildren: function(treeNode) {
      this.$refs.ztree.updateNodeById(treeNode.uuid);
      this.formTitle = this.$t('dialog.title.addtarget', { target: this.$t('page.subdirectory') });
      this.formType = 'catalog';
      this.catalogData.parentUuid = treeNode.uuid;
      this.catalogData.uuid = '';
      this.selectedUuid = true;
    },
    //添加服务
    addChannel: function(treeNode) {
      this.$refs.ztree && this.$refs.ztree.updateNodeById(treeNode.uuid);
      this.formTitle = this.$t('dialog.title.addtarget', { target: this.$t('term.process.catalog') });
      this.formType = 'channel';
      this.channelData.parentUuid = treeNode.uuid;
      this.channelData.uuid = '';
      if (this.processUuid != '') {
        this.channelData.processUuid = this.processUuid;
      }
      this.selectedUuid = true;
    },
    saveEdit(data) {
      //底部保存按钮
      if (data) {
        if (this.formType == 'channel') {
          Object.assign(this.channelData, data);
        } else if (this.formType == 'catalog') {
          Object.assign(this.catalogData, data);
        }
        this.save();
      }
    },
    saveCurrent() {
      //顶部保存按钮
      if (this.formType == 'channel') {
        this.$refs.channel.save();
      } else if (this.formType == 'catalog') {
        this.$refs.catalog.save();
      }
    },
    updateName(name) {
      this.channelData.name = name;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
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
    // overflow-y: auto;
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
