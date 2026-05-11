<template>
  <div class="menu_link">
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
                      <DropdownItem v-if="childrenItem.type != 'factory' && childrenItem.isCanEdit === 1" @click.native="delName(childrenItem.name, childrenItem.uuid, index)">
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
import LeftMenuMixin from '@/views/components/leftmenu/leftmenu-mixin';

export default {
  name: 'ProcessMenu',
  components: {
    draggable,
    EditWorkcenterDialog: () => import('./edit-workcenter-dialog.vue'),
    AuthDialog: () => import('./auth-dialog.vue'),
    WorkOrderDialog: () => import('./work-order-dialog')
  },
  mixins: [LeftMenuMixin],
  props: {},
  data() {
    return {
      loadingShow: true,
      isShowWorkOrderDialog: false,
      workcenterList: null, //左侧列表
      editRenameDialog: false, //重命名弹框
      editAuthorizationDialog: false, //授权弹框
      currentWorkcenterUuid: '', //当前编辑的工单中心Uuid
      selectedUuid: null //标志实际选中哪一个，用于做选中效果
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
            this.$Message.success(this.$t('message.executesuccess'));
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
    delName(name, uuid, index) {
      this.$createDialog({
        type: 'modal',
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', {target: name}),
        maskClose: true,
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.process.processtask.delMenu({ uuid: uuid }).then(res => {
            if (res.Status == 'OK') {
              this.$delete(this.workcenterList, index);
              if (uuid === this.$route.params.taskTypeid) {
                this.initData('first');
              } else {
                this.initData(true);
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
      let workcenterList = this.$store.state.leftMenu.workcenterList || [];
      if (workcenterList && workcenterList.length) {
        for (let i = 0; i < workcenterList.length; i++) {
          let workcenter = workcenterList[i];
          if (workcenter.isShowTotal == 1) {
            this.$api.process.processtask.getWorkcenterCount({ uuid: workcenter.uuid }).then(reCount => {
              if (reCount && reCount.Status == 'OK') {
                workcenter.processingOfMineCount = reCount.Return.processingOfMineCount;
                this.workcenterList = this.handleGroupData(workcenterList);
              }
            });            
          }
        }
      }
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
.menu_link {
  .subtitle-padding {
    padding-left: 18px !important;
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
        font-size: 10px;
        padding: 0 4px;
        line-height: 16px;
        height: 16px;
        min-width: 18px;
        border-radius: 8px;
        ::v-deep span {
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
