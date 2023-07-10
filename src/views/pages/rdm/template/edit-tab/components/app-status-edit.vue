<template>
  <div>
    <div class="mb-md">
      <a class="tsfont-plus" href="javascript:void(0)" @click="addStatus">{{ $t('page.status') }}</a>
    </div>
    <div class="tstable-container tstable-normal border tstable-no-fixedHeader radius-lg">
      <div class="tstable-main bg-op table-radius-main">
        <TsTable :theadList="theadList" :tbodyList="statusList" canExpand>
          <template v-slot:fromstatus="{ row }">
            <div>
              <span :style="{ color: row.color }">
                <strong>{{ row.label }}</strong>
              </span>
              <span class="text-grey">[{{ row.name }}]</span>
            </div>
          </template>
          <template v-slot:isStart="{ row }">
            <TsFormSwitch
              v-model="row.isStart"
              :trueValue="1"
              :falseValue="0"
              @on-change="changeIsStart(row)"
            ></TsFormSwitch>
          </template>
          <template v-slot:isEnd="{ row }">
            <TsFormSwitch
              v-model="row.isEnd"
              :trueValue="1"
              :falseValue="0"
              @on-change="changeIsEnd(row)"
            ></TsFormSwitch>
          </template>
          <template v-slot:transfer>
            <div>
              <span class="text-grey">{{ $t('term.rdm.goto') }}</span>
              <span class="tsfont-arrow-right text-grey"></span>
            </div>
          </template>
          <template v-slot:canTransfer="{ row }">
            <div>
              <span v-for="(tostatus, sindex) in statusList.filter(d => row.uuid != d.uuid)" :key="sindex" :style="{ color: tostatus.color }">
                <Checkbox
                  v-if="statusMatrix[row.uuid + '_' + tostatus.uuid]"
                  :value="hasRelation(row, tostatus)"
                  @on-change="
                    val => {
                      toggleStatusRel(val, row, tostatus);
                    }
                  "
                >
                  {{ tostatus.label }}
                </Checkbox>
              </span>
            </div>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-edit" @click="editStatus(row)">{{ $t('page.edit') }}</li>
                <li class="tsfont-trash-o" @click="deleteStatus(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
          <template v-slot:expand="{ row }">
            <div>
              <div v-for="(statusrel, toindex) in getStatusRelList(row)" :key="toindex" class="grid">
                <div style="position: relative; text-align: right; line-height: 10px">
                  <div class="border-color-base border-v" :class="toindex == getStatusRelList(row).length - 1 ? 'half' : ''"></div>
                  <div class="border-color-base border-h"></div>
                  <div class="tsfont-drop-right text-grey border-arrow"></div>
                </div>
                <div class="padding-sm overflow" style="display: flex; align-items: center">
                  <span :style="{ color: statusrel.toStatusColor }">
                    <strong>{{ statusrel.toStatusLabel }}</strong>
                  </span>
                </div>
                <div class="padding-sm" style="word-break: break-all; white-space: normal">
                  <span class="tsfont-setting cursor text-href" @click="editStatusRelConfig(statusrel)">{{ $t('page.setting') }}</span>
                  <span v-if="getRequiredAttrList(statusrel).length > 0">
                    <Divider type="vertical" />
                    <span class="text-grey mr-sm">{{ $t('term.rdm.requiredattribute') }}</span>
                    <Tag v-for="(requiredAttr, rindex) in getRequiredAttrList(statusrel)" :key="rindex">
                      {{ requiredAttr.attrLabel }}
                    </Tag>
                  </span>
                  <span v-if="getAuthList(statusrel).length > 0">
                    <Divider type="vertical" />
                    <span class="text-grey mr-sm">{{ $t('page.auth') }}</span>
                    <Tag v-for="(auth, aindex) in getAuthList(statusrel)" :key="aindex">
                      {{ auth.text }}
                    </Tag>
                  </span>
                </div>
              </div>
            </div>
          </template>
        </TsTable>
      </div>
    </div>
    <StatusEditDialog
      v-if="isStatusEditShow"
      :uuid="currentStatusId"
      :appId="appId"
      @close="closeStatusEditDialog"
    ></StatusEditDialog>
    <AppStatusRelConfigDialog v-if="isStatusRelConfigEditShow" :statusrel="currentStatusRel" @close="closeStatusRelConfigDialog"></AppStatusRelConfigDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    StatusEditDialog: resolve => require(['@/views/pages/rdm/project/edittab/components/app-status-edit-dialog.vue'], resolve),
    AppStatusRelConfigDialog: resolve => require(['@/views/pages/rdm/project/edittab/components/app-statusrel-config-dialog.vue'], resolve)
  },
  props: {
    statusList: { type: Array },
    statusRelList: { type: Array }
  },
  data() {
    return {
      theadList: [{ key: 'fromstatus', title: this.$t('term.rdm.initstatus') }, { key: 'isStart', title: this.$t('term.rdm.isstart') }, { key: 'isEnd', title: this.$t('term.rdm.isend') }, { key: 'transfer', title: '' }, { key: 'canTransfer', title: this.$t('term.rdm.targetstatus') }, { key: 'action' }],
      isStatusRelConfigEditShow: false,
      objectList: [],
      isStatusEditShow: false,
      currentStatusId: null,
      actionHide: {},
      currentStatusRel: null,
      statusMatrix: {} //状态矩阵数据，用于重置checkbox的选中状态
    };
  },
  beforeCreate() {},
  created() {
    //组装status矩阵数据
    this.statusList.forEach(fromStatus => {
      if (this.hasRelation(fromStatus)) {
        this.$set(fromStatus, '_expand', true);
      } else {
        this.$set(fromStatus, '_expand', false);
      }
      //组装status矩阵数据
      this.statusList.forEach(toStatus => {
        if (fromStatus.uuid !== toStatus.uuid) {
          this.$set(this.statusMatrix, fromStatus.uuid + '_' + toStatus.uuid, true); 
        }
      });
    });
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeIsStart(status) {
      const data = { uuid: status.uuid, flag: !!status.isStart, type: 'start' };
    },
    changeIsEnd(status) {
      const data = { uuid: status.uuid, flag: !!status.isEnd, type: 'end' };
    },
    getAuthList(statusrel) {
      if (statusrel && statusrel.config && statusrel.config.authList && statusrel.config.authList.length > 0) {
        return statusrel.config.authList;
      }
      return [];
    },
    getRequiredAttrList(statusrel) {
      if (statusrel && statusrel.config && statusrel.config.requiredAttrList && statusrel.config.requiredAttrList.length > 0) {
        return statusrel.config.requiredAttrList;
      }
      return [];
    },
    toggleAction(statusname) {
      this.$set(this.actionHide, statusname, !this.actionHide[statusname]);
    },
    addStatus() {
      this.isStatusEditShow = true;
    },
    closeStatusRelConfigDialog(needRefresh) {
      this.isStatusRelConfigEditShow = false;
      if (needRefresh) {
        //todo
      }
    },
    toggleStatusRel(isCheck, fromStatus, toStatus) {
      const fn = vsnode => {
        this.$api.rdm.status
          .toggleStatusRel({
            action: isCheck ? 'add' : 'delete',
            fromStatusUuid: fromStatus.uuid,
            toStatusUuid: toStatus.uuid,
            appId: this.appId
          })
          .then(res => {
            if (res.Return) {
              if (vsnode) {
                vsnode.isShow = false;
              }
              if (isCheck) {
                this.statusRelList.push({
                  uuid: res.Return,
                  appId: this.appId,
                  fromStatusName: fromStatus.name,
                  fromStatusLabel: fromStatus.label,
                  fromStatusColor: fromStatus.color,
                  fromStatusUuid: fromStatus.uuid,
                  toStatusName: toStatus.name,
                  toStatusLabel: toStatus.label,
                  toStatusColor: toStatus.color,
                  toStatusUuid: toStatus.uuid
                });
                this.$Message.success(this.$t('message.updatesuccess'));
                this.$set(fromStatus, '_expand', true);
              } else {
                const index = this.statusRelList.findIndex(d => d.uuid === res.Return);
                if (index > -1) {
                  this.statusRelList.splice(index, 1);
                  this.$Message.success(this.$t('message.updatesuccess'));
                  if (this.hasRelation(fromStatus)) {
                    this.$set(fromStatus, '_expand', true);
                  } else {
                    this.$set(fromStatus, '_expand', false);
                  }
                }
              }
            }
          });
      };
      if (!isCheck) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', { target: this.$t('term.rdm.statusrel') }),
          btnType: 'error',
          'on-ok': vsnode => {
            fn(vsnode);
          },
          'on-cancel': vsnode => {
            this.$set(this.statusMatrix, fromStatus.uuid + '_' + toStatus.uuid, false);
            this.$nextTick(() => {
              this.$set(this.statusMatrix, fromStatus.uuid + '_' + toStatus.uuid, true);
            });
          }
        });
      } else {
        fn();
      }
    },
    sortStatus() {
      console.log(this.statusList);
    },
    editStatus(status) {
      this.isStatusEditShow = true;
      this.currentStatusId = status.uuid;
    },
    closeStatusEditDialog(needRefresh) {
      this.isStatusEditShow = false;
      this.currentStatusId = null;
      if (needRefresh) {
        this.getStatusByAppId();
      }
    },
    deleteStatus(status) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: this.$t('page.status') }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.rdm.status.deleteStatus(status.uuid).then(res => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.init();
            }
          });
        }
      });
    },
    getStatusRelList(fromstatus) {
      if (this.statusRelList && this.statusRelList.length > 0) {
        //不能用filter，需要用statusRelList中的对象，后面可能需要更新config属性
        const returnList = [];
        this.statusRelList.forEach(d => {
          if (d.fromStatusUuid === fromstatus.uuid) {
            returnList.push(d);
          }
        });
        return returnList;
      }
      return [];
    },
    editStatusRelConfig(statusrel) {
      this.isStatusRelConfigEditShow = true;
      this.currentStatusRel = statusrel;
    }
  },
  filter: {},
  computed: {
    hasRelation() {
      return (fromStatus, toStatus) => {
        if (this.statusRelList && this.statusRelList.length > 0) {
          for (let i = 0; i < this.statusRelList.length; i++) {
            const rel = this.statusRelList[i];
            if (rel.fromStatusUuid === fromStatus.uuid && (!toStatus || rel.toStatusUuid === toStatus.uuid)) {
              return true;
            }
          }
        }
        return false;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 50px 100px auto;
}
.border-v {
  border-left-style: dashed;
  border-left-width: 1.5px;
  position: absolute;
  top: 0px;
  left: 50%;
  height: 100%;
}
.border-v.half {
  height: 50% !important;
}
.border-arrow {
  position: absolute;
  top: calc(50% - 4px);
  right: -8px;
}
.border-h {
  border-top-style: dashed;
  border-top-width: 1.5px;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50%;
}
/deep/.folder-tr > td {
  padding: 0px;
}
</style>
