<template>
  <div class="OverviewMenu menu_link">
    <ul v-if="$AuthUtils.hasRole('PROCESS_BASE')">
      <li class="link">
        <a href="javascript:void(0)" class="tsfont-plus text-primary" @click="openWorkOrderDialog">
          <span class="text-primary">{{ $t('page.build') }}</span>
        </a>
      </li>
    </ul>
    <Loading v-if="loadingShow" :loadingShow="loadingShow"></Loading>
    <template v-if="!$utils.isEmpty(workcenterList)">
      <div class="title text-grey">{{ $t('router.process.workordercenter') }}</div>
      <ul class="navlist-ul">
        <li v-for="ditem in workcenterList" :key="ditem.uuid">
          <div v-if="ditem.catalogName" :title="ditem.catalogName" class="overflow title text-grey subtitle-padding">{{ ditem.catalogName }}</div>
          <draggable
            v-model="ditem.children"
            :animation="200"
            handle=".handle"
            tag="div"
            @change="sortMenuList"
          >
            <ul
              v-for="(childrenItem, index) in ditem.children"
              :key="index"
              class="navlist-li link"
              :class="{ active: $isMenuActive('/task-overview-' + childrenItem.uuid), editable: ditem.isCanEdit || 2 }"
            >
              <li class="overflow navlist-text">
                <!--<router-link :to="{ path: `/task-overview-${childrenItem.uuid}` }" class="router-link tsfont-tickets">{{ childrenItem.name }}</router-link>-->
                <a class="router-link tsfont-tickets" @click="clickWorkcenter(childrenItem.uuid)">{{ childrenItem.name }}</a>
                <i class="item-icon handle tsfont-drag hide text-actiongit"></i>
                <span class="navlist-action">
                  <Dropdown trigger="click" :transfer="true">
                    <span v-if="childrenItem.isCanEdit === 1 || childrenItem.isCanRole === 1" ref="horizontal" class="tsfont-option-horizontal text-action"></span>
                    <DropdownMenu slot="list" class="overdown">
                      <DropdownItem v-if="childrenItem.isCanEdit === 1" @click.native="editRename(childrenItem)">
                        <div>{{ $t('page.edit') }}</div>
                      </DropdownItem>
                      <DropdownItem v-if="childrenItem.isCanRole === 1" @click.native="editAuthorization(childrenItem)">
                        <div>{{ $t('page.auth') }}</div>
                      </DropdownItem>
                      <DropdownItem v-if="childrenItem.isCanEdit === 1" @click.native="delName(childrenItem.name, childrenItem.uuid, index)">
                        <div>{{ $t('page.delete') }}</div>
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </span>
                <div v-if="getAmount(childrenItem.processingOfMineCount) && getAmount(childrenItem.processingOfMineCount) != '0'" class="navlist-amount">
                  <Button
                    v-if="getAmount(childrenItem.processingOfMineCount) && getAmount(childrenItem.processingOfMineCount) != '0'"
                    size="small"
                    type="error"
                    shape="circle"
                    class="btn-isdone"
                  >
                    {{ getAmount(childrenItem.processingOfMineCount) }}
                  </Button>
                </div>
              </li>
            </ul>
          </draggable>
        </li>
      </ul>
    </template>
    <AuthDialog v-if="editAuthorizationDialog" :uuid="currentWorkcenterUuid" @close="closeAuthorizationDialog"></AuthDialog>
    <EditWorkcenterDialog
      v-if="editRenameDialog"
      :workcenter="currentWorkcenter"
      @close="closeRenameDialog"
      @refresh="refreshCurrentWorkcenterData"
    ></EditWorkcenterDialog>
    <WorkOrderDialog v-if="isShowWorkOrderDialog" @close="closeWorkOrderDialog"></WorkOrderDialog>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import draggable from 'vuedraggable';
import LeftMenu from '@/views/components/leftmenu/leftmenu';

export default {
  name: 'OverviewMenu',
  components: {
    draggable,
    EditWorkcenterDialog: () => import('./edit-workcenter-dialog.vue'),
    AuthDialog: () => import('./auth-dialog.vue'),
    WorkOrderDialog: () => import('./work-order-dialog')
  }, // 工单中心左侧菜单
  extends: LeftMenu,
  props: {},
  data() {
    return {
      loadingShow: true,
      isShowWorkOrderDialog: false,
      showMode: 'table',
      workcenterList: null, //左侧列表
      editRenameDialog: false, //重命名弹框
      editAuthorizationDialog: false, //授权弹框
      defaultName: '', //默认名称
      defaultAuthList: [], //默认授权
      defaultType: 'custom',
      defaultSupport: null, // 默认使用范围
      menuUuid: '', //弹框uuid
      currentWorkcenterUuid: '', //当前编辑的工单中心Uuid
      uuid: '',
      selectedUuid: null, //标志实际选中哪一个，用于做选中效果
      menuCatalogList: [], // 编辑菜单类型列表
      catalogId: null, // 编辑菜单类型id
      catalogName: '' // 编辑菜单类型名称
    };
  },
  async created() {
    await this.initData('init');
  },
  mounted() {},
  activated() {},
  beforeDestroy() {},
  methods: {
    openWorkOrderDialog() {
      //从左侧菜单点链接，激活清理历史标记
      this.$route.meta.clearHistory = true;
      // 上报工单
      this.isShowWorkOrderDialog = true;
    },
    closeWorkOrderDialog() {
      this.isShowWorkOrderDialog = false;
    },
    sortMenuList() {
      let data = {};
      let workcenterList = [];
      this.workcenterList &&
        this.workcenterList.forEach(item => {
          if (item && !this.$utils.isEmpty(item.children)) {
            item.children.forEach((innerItem, innerIndex) => {
              let obj = {};
              this.$set(obj, 'uuid', innerItem.uuid);
              this.$set(obj, 'sort', innerIndex + 1);
              workcenterList.push(obj);
            });
          }
        });
      this.$set(data, 'workcenterList', workcenterList);
      this.$api.process.processtask
        .workcenterMenuSort(data)
        .then(res => {
          if (res.Status == 'OK') {
            //
          }
        })
        .catch(error => {
          this.$Notice.error({
            title: error.data.Message,
            duration: 1.5
          });
        });
    },
    handleGroupData(list) {
      // 处理分组数据
      let tempObj = {};
      let groupSortList = []; // 排序后的数组
      list &&
        list.forEach(item => {
          let { catalogId, catalogName, uuid } = item;
          if (!tempObj[catalogId]) {
            tempObj[catalogId] = {
              uuid,
              catalogId,
              catalogName,
              children: []
            };
          }
          tempObj[catalogId].children.push(item);
        });

      if (!this.$utils.isEmptyObj(tempObj) && !this.$utils.isEmpty(Object.values(tempObj))) {
        Object.values(tempObj).forEach(item => {
          // 数组重新排序，把没有分组的放在最前面
          if (item && item.catalogId) {
            groupSortList.push(item);
          } else {
            groupSortList.unshift(item);
          }
        });
      }
      return groupSortList;
    },
    editRename(obj) {
      this.currentWorkcenterUuid = obj.uuid;
      this.currentWorkcenter = obj;
      this.editRenameDialog = true;
    },
    closeRenameDialog(needRefresh) {
      this.editRenameDialog = false;
      this.currentWorkcenterUuid = '';
      if (needRefresh) {
        this.initData(true);
      }
    },
    editAuthorization(obj) {
      this.currentWorkcenterUuid = obj.uuid;
      this.editAuthorizationDialog = true;
    },
    closeAuthorizationDialog(needRefresh) {
      this.editAuthorizationDialog = false;
      this.currentWorkcenterUuid = '';
      if (needRefresh) {
        this.initData(true);
      }
    },
    save(uuid, name, authList, type, support, catalogId, catalogName) {
      /* 保存方法
          support 使用范围
          catalogId 菜单类型
      */
      let data = {
        uuid: uuid,
        name: name,
        type: type,
        conditionConfig: {},
        authList: authList || [],
        support: support,
        catalogId: catalogId,
        catalogName: catalogName
      };

      this.$api.process.processtask
        .saveMenu(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            if (support) {
              // 置空使用范围
              this.userList.forEach(item => {
                if (item.name == 'support') {
                  item.value = '';
                }
              });
            }
            this.editAuthorizationDialog = false;
            this.initData(true);
          }
        })
        .catch(e => {
          this.$Notice.error({
            title: e.data.Message
          });
        });
    },
    saveAuthorization() {
      // 授权，保存方法
      let userForm = this.$refs.userForm;
      if (userForm.valid()) {
        let data = userForm.getFormValue();
        let type = data.type;
        let support = data.support || null; // 使用范围
        this.save(this.menuUuid, this.defaultName, data.authList, type, support, this.catalogId, this.catalogName);
      }
    },
    delName(name, uuid, index) {
      let _this = this;
      this.$createDialog({
        type: 'modal',
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
        maskClose: true,
        btnType: 'error',
        'on-ok': function(vnode) {
          let data = {
            uuid: uuid
          };
          this.$api.process.processtask.delMenu(data).then(res => {
            if (res.Status == 'OK') {
              this.$delete(_this.workcenterList, index);
              if (uuid === _this.$route.params.taskTypeid) {
                _this.initData('first');
              } else {
                _this.initData(true);
              }
            }
          });
          vnode.isShow = false;
        }
      });
    },
    getWorkCenterTypeMenu() {
      //工单中心分类
      return this.$store.dispatch('leftMenu/getWorkCenterMenuData');
    },
    async initData(action) {
      if (action) {
        await this.getWorkCenterTypeMenu();
      }
      // let workCenterMenuData = this.workCenterMenuData || {};
      let workcenterList = this.$store.state.leftMenu.workcenterList || [];
      this.workcenterList = this.handleGroupData(workcenterList);
      this.workcenterList.forEach(function(d, i) {
        d.index = i;
      });
      this.loadingShow = false;
      if (action === 'first') {
        this.$router.push({ name: 'task-overview', params: { taskTypeid: workcenterList[0].uuid } });
      }
    },
    refreshCurrentWorkcenterData(uuid) {
      if (this.selectedUuid === uuid) { //如果修改的分类时当前选中的分类则需要刷新table
        location.reload();
      }
    },
    clickWorkcenter(uuid) {
      this.selectedUuid = uuid;
      this.goTo('/task-overview-' + uuid);
    }
  },
  computed: {
    getAmount() {
      return function(amount) {
        let showamount = amount || '';
        return showamount;
      };
    },
    getMeCount() {
      return function(amount) {
        let showamount = amount || '';
        return showamount;
      };
    },
    ...mapGetters('leftMenu', {
      taskTypeid: 'getTaskTypeId'
    })
  },
  watch: {
    '$store.state.leftMenu.workCenterMenuData': {
      handler(val) {
        if (val) {
          this.initData();
          this.selectedUuid = this.$route.params['taskTypeid'];
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.OverviewMenu.menu_link {
  padding-top: 8px;

  .showMode {
    position: absolute;
    bottom: 30px;
    left: 0px;
    right: 0px;
    text-align: center;
    span {
      display: inline-block;
      width: 60%;
      padding: 6px;
      border-radius: 4px;
      cursor: pointer;
      color: @white;
    }
  }
  .headline {
    color: @default-icon;
    height: 30px;
    line-height: 30px;
    font-size: 12px;
  }
  .subtitle-padding {
    // 二级标题
    padding-left: 18px !important;
    padding-right: 30px;
    cursor: pointer;
  }
  .navlist-ul {
    .navlist-li {
      position: relative;
      &:hover .item-icon.tsfont-type {
        display: none;
      }
      .item-icon.tsfont-drag {
        display: none;
        cursor: ns-resize;
      }
      &:hover {
        .item-icon.tsfont-drag {
          display: block;
          position: absolute;
          left: @space-md - 6px;
          top: 0;
        }
        .navlist-text {
          a:before {
            opacity: 0;
          }
        }
        // .btn-isdone{
        //   right: 26px;
        // }
      }
      &.editable:hover {
        .navlist-action {
          display: block;
        }
        .navlist-amount {
          display: none;
        }
      }

      .navlist-text {
        cursor: pointer;
        position: relative;
        display: inline-block;
        max-width: 100%;
        line-height: 36px;
        height: 36px;
        text-align: left;
        width: 100%;
        &:before {
          margin-right: 10px;
          margin-left: 2px;
        }
        a {
          position: relative;
        }
      }

      .navlist-amount {
        position: absolute;
        top: 0;
        right: 8px;
        line-height: 36px;
        height: 36px;
        font-style: normal;
        font-size: 12px;
        color: @icon-color;
        text-align: right;
        &.already {
          right: 20px;
        }
      }

      .navlist-action {
        position: absolute;
        top: 0;
        right: 6px;
        line-height: 36px;
        height: 36px;
        width: 18px;
        cursor: pointer;
        display: none;
        text-align: center;
        font-size: 10px;
      }
      .btn-isdone {
        // position: absolute;
        // right: 16px;
        font-size: 10px;
        padding: 0 4px;
        line-height: 16px;
        height: 16px;
        min-width: 18px;
        border-radius: 8px;
        /deep/span {
          display: block;
        }
      }
    }
  }
}

.ivu-select-dropdown:has(.overdown) {
  z-index: 0;
}
</style>
