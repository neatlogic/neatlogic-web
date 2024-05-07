<template>
  <div class="service-management">
    <TsContain
      :isSiderHide="isSiderHide"
      border="border"
      :siderWidth="300"
      :enableCollapse="true"
    ><template v-slot:navigation>
       <span class="tsfont-plus text-action" @click="addRoot()">{{ $t('page.rootdirectory') }}</span>
     </template>
      <template v-slot:topLeft>
        <span>{{ regionName }}</span>
      </template>
      <template v-slot:topRight>
        <div v-if="currentTab === 'info'" class="action-group">
          <span
            v-if="regionData.id !== null && childrenCount < 1"
            class="action-item tsfont-trash-o"
            :class="handleClassName"
            @click="deleteRegion()"
          >{{ $t('page.delete') }}</span>
          <span :class="{ disable: disabledConfig.saving }" class="action-item tsfont-save" @click="saveRegion()">{{ $t('page.save') }}</span>
        </div>
      </template>
      <template v-slot:sider>
        <div class="pl-md pr-md">
          <Loading v-if="treeloading" :loadingShow="treeloading" type="fix"></Loading>
          <TsFormSelect v-bind="selectSetting"></TsFormSelect>
          <TsZtree
            ref="treeObj"
            idKey="id"
            :nodes="nodeList"
            :hoverDomList="hoverDomList"
            :beforeClick="beforeClick"
            :onClick="clickNode"
            :onDrop="onDrop"
            :value="regionData.id"
            :beforeDrop="beforeDrop"
            :expandAll="false"
          ></TsZtree>
        </div>
      </template>
      <template v-slot:content>
        <Tabs v-model="currentTab" class="block-tabs">
          <TabPane :label="infoLabel" name="info">
            <div class="content pt-md radius-lg pb-md" :class="!isSiderHide ? 'ml-md' : ''">
              <TsForm
                ref="regionForm"
                v-model="regionData"
                :itemList="regionFormItemList"
              ></TsForm>
            </div>
          </TabPane>
          <TabPane v-if="regionData.id" :label="teamLabel" name="team">
            <RegionTeam :regionId="regionData.id" type="team"></RegionTeam>
          </TabPane>
        </Tabs>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: 'CatalogManage',
  components: {
    TsZtree: resolve => require(['@/resources/plugins/TsZtree/TsZtree.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    RegionTeam: resolve => require(['./region-team'], resolve)
  },
  directives: {},
  props: [''],
  data() {
    return {
      currentTab: 'info',
      selectSaveId: null,
      infoLabel: null,
      teamLabel: null,
      isSiderHide: false,
      regionName: this.$t('dialog.title.edittarget', { target: '地域' }), //表单标题
      treeloading: true,
      childrenCount: null,
      regionFormItemList: {
        id: {
          type: 'text',
          isHidden: true,
          disabled: true
        },
        parentId: {
          type: 'select',
          label: '上级地域',
          multiple: false,
          dynamicUrl: '/api/rest/region/search',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          search: true,
          transfer: true,
          width: '75%',
          readonly: true
        },
        name: {
          type: 'text',
          label: '地域名称',
          width: '75%',
          validateList: [{ name: 'required', message: '地域名称必填' }]
        },
        workTimeUuid: {
          type: 'select',
          label: '服务窗口',
          multiple: false,
          dynamicUrl: '/api/rest/worktime/search',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'uuid',
          search: true,
          width: '75%',
          isHidden: true,
          transfer: true
        },
        isActive: {
          type: 'radio',
          width: '75%',
          label: this.$t('page.status'),
          dataList: [
            {
              text: this.$t('page.enabled'),
              value: 1
            },
            {
              text: this.$t('page.disable'),
              value: 0
            }
          ]
        }
      },
      regionData: {
        //目录数据
        id: null,
        name: null,
        parentId: 0,
        workTimeUuid: null,
        isActive: 1
      },
      selectSetting: {
        name: 'regionSearch',
        search: true,
        dynamicUrl: '/api/rest/region/search',
        rootName: 'tbodyList',
        valueName: 'id',
        textName: 'name',
        onChange: this.treeSelected,
        placeholder: this.$t('page.search'),
        transfer: true,
        border: 'bottom'
      },
      disabledConfig: {
        //禁止按钮连续调用接口
        deleting: false,
        saving: false
      },
      nodeList: [],
      hoverDomList: [
        {
          icon: 'tsfont-plus',
          desc: this.$t('page.subdirectory'),
          isAddFn: (treeNode) => {
            return true;
          },
          clickFn: (treeNode) => {
            this.addChildren(treeNode);
          }
        },
        {
          icon: 'tsfont-putongjigui',
          desc: this.$t('dialog.title.addtarget', { target: this.$t('term.process.catalog') }),
          isAddFn: (treeNode) => {
            if (treeNode.type == 'catalog') {
              return true;
            } else {
              return false;
            }
          },
          clickFn: (treeNode) => {
            this.addChannel(treeNode?.id);
          }
        },
        {
          icon: 'tsfont-trash-o',
          desc: this.$t('page.delete'),
          initFn: (treeNode, $span) => {
            if (treeNode.childrenCount == undefined || treeNode.childrenCount == 0) {
              //
            } else {
              $span[0].classList.add('text-disabled');
              $span[0].title = treeNode.type == 'catalog' ? this.$t('term.autoexec.citecatalognodelete') : this.$t('term.autoexec.citeservicenodelete');
            }
          },
          clickFn: (treeNode) => {
            this.nodeDelete(treeNode);
          }
        }
      ]
    };
  },
  async created() {
    await this.getTreeList(true);
    this.infoLabel = this.getLabel(this.$t('page.basicinfo'), 'info');
    this.teamLabel = this.getLabel(this.$t('page.group'), 'team');
  },
  beforeMount() {},
  mounted() {
  },
  methods: {
    //获取服务目录服务树
    async getTreeList(isFirst) {
      await this.$api.framework.region.searchTree().then(res => {
        if (res.Status == 'OK') {
          this.nodeList = res.Return || [];
          if (!isFirst) {
            this.$set(this.regionData, 'id', this.selectSaveId);
          } else if (!this.$utils.isEmpty(this.nodeList)) {
            this.$set(this.regionData, 'id', this.nodeList[0]?.id || null);
          } else {
            this.addRoot();
          }
          this.treeloading = false;
        }
      });
    },
    beforeClick(zTreeObj, node) {
      if (!this.isCancelSelected) {
        this.isCancelSelected = true;
      }
      if (!this.regionData.id || this.regionData.id != node.id) {
        zTreeObj.cancelSelectedNode();
        return true;
      } else {
        return false;
      }
    },
    clickNode(tree, node) {
      let {id = '', name = '', parentId = null, childrenCount = null, isActive = 1, workTimeUuid = null} = node || {};
      this.childrenCount = childrenCount;
      // 编辑目录
      this.regionName = this.$t('dialog.title.edittarget', { target: '地域' });
      this.$set(this.regionData, 'id', id);
      this.$set(this.regionData, 'name', name);
      this.$set(this.regionData, 'isActive', isActive);
      this.$set(this.regionData, 'workTimeUuid', workTimeUuid);
      this.$set(this.regionData, 'parentId', parentId);
    },
    treeSelected(id) {
      //树select选择中
      this.$set(this.regionData, 'id', id);
    },
    //添加根目录按钮
    addRoot() {
      this.regionName = this.$t('dialog.title.addtarget', { target: this.$t('page.rootdirectory') });
      this.$set(this.regionData, 'parentId', 0);
      this.$set(this.regionData, 'id', null);
      this.$set(this.regionData, 'name', null);
      this.$set(this.regionData, 'workTimeUuid', null);
      this.$set(this.regionData, 'isActive', 1);
      this.$refs.treeObj.cancelSelectedAllNode();
      this.currentTab = 'info';
    },
    //树上方搜索地域
    selectRegion(id) {
      this.regionName = this.$t('dialog.title.edittarget', { target: '地域' });
      this.$set(this.regionData, 'id', id);
    },
    saveRegion() {
      let regionForm = this.$refs['regionForm'];
      if (!regionForm.valid()) {
        return;
      }
      let regionFormData = regionForm.getFormValue();
      Object.assign(this.regionData, regionFormData);
      this.$api.framework.region.saveRegion(this.regionData)
        .then(res => {
          if (res.Status === 'OK') {
            this.selectSaveId = res.Return;
            this.$Message.success(this.$t('message.savesuccess'));
            this.getTreeList(false);
          }
        })
        .finally(() => {
        });
    },
    beforeDrop(tree, treeNodes, targetNode, moveType) {
      
    },
    cancelSelectedAllNode() {},
    onDrop(tree, treeNodes, targetNode, moveType, isCopy) {
      let treeNode = treeNodes[0];
      let parentId = null;
      let keyId = 'id';
      if (moveType === 'inner') {
        parentId = targetNode?.[keyId] || 0;
      } else {
        parentId = targetNode && targetNode.getParentNode() === null ? 0 : (targetNode?.getParentNode()?.[keyId] || 0);
      }
      let data = {
        id: treeNode.id,
        moveType: moveType,
        parentId: parentId,
        targetId: targetNode?.id || 0
      };
     
      if (moveType != null) {
        this.$api.framework.region.moveRegion(data).then(res => {
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
          }
        }).finally(() => {
          this.getTreeList();
        });
      }
    },
    deleteRegion() {
      if (this.childrenCount > 0) {
        return false;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.regionName}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.region.deleteRegion({id: this.regionId})
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                vnode.isShow = false;
                this.getTreeList(true);
              }
            })
            .finally(() => {
              this.disabledConfig.deleting = false;
            });
        }
      });
    },
    //树节点删除
    nodeDelete(treeNode) {
      let {id = null, name = '', childrenCount = 0} = treeNode || {};
      if (childrenCount > 0) {
        return false;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.region.deleteRegion({id: id})
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                vnode.isShow = false;
                this.getTreeList(true);
              }
            });
        }
      });
    },
    //添加子地域
    addChildren(treeNode) {
      this.regionName = this.$t('dialog.title.addtarget', { target: this.$t('page.subdirectory') });
      this.$set(this.regionData, 'parentId', treeNode.id);
      this.$set(this.regionData, 'id', null);
      this.$set(this.regionData, 'name', null);
      this.$set(this.regionData, 'workTimeUuid', null);
      this.$set(this.regionData, 'isActive', 1);
    },
    saveEdit(data) {
      //底部保存按钮
      if (data) {
        Object.assign(this.regionData, data);
        this.handleSave();
      }
    },
    //自定义初始化tabs
    getLabel(label, name) {
      var _this = this;
      return h => {
        return h(
          'div',
          {
            style: {
              
            },
            on: {
              click: e => {
                var tip = _this.tabClick(name); // 判断条件是否满足
                if (tip) {
                  e.stopPropagation(); // 不满足条件则阻止事件冒泡 本质是不让触发tab的on-click事件
                }
              }
            }
          },
          label
        );
      };
    },
    tabClick(name) {
    }
  },
  computed: {
    handleClassName() {
      return (this.childrenCount == undefined || this.childrenCount == 0) ? '' : 'disable';
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.service-management {
  /deep/.tscontain-body{
    padding-left: 0px !important;
  }
  /deep/ .ivu-layout-content {
    overflow-y: hidden;
  }
  /deep/ .content {
    height: 100%;
    overflow: auto;
  }
}
</style>
