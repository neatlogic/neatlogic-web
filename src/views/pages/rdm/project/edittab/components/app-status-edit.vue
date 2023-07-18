<template>
  <div>
    <div class="mb-md">
      <a class="tsfont-plus" href="javascript:void(0)" @click="addStatus">{{ $t('page.status') }}</a>
    </div>
    <div class="tstable-container tstable-normal border tstable-no-fixedHeader radius-lg">
      <div class="tstable-main bg-op table-radius-main">
        <TsTable
          :theadList="theadList"
          :tbodyList="finalStatusList"
          canExpand
        >
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
              v-if="row.id"
              v-model="row.isStart"
              :trueValue="1"
              :falseValue="0"
              @on-change="changeIsStart(row)"
            ></TsFormSwitch>
          </template>
          <template v-slot:isEnd="{ row }">
            <TsFormSwitch
              v-if="row.id"
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
              <span v-for="(tostatus, sindex) in statusList.filter(d => row.id != d.id)" :key="sindex" :style="{ color: tostatus.color }">
                <Checkbox
                  v-if="statusMatrix[row.id+'_'+tostatus.id]"
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
          <template slot="action" slot-scope="{ row, index }">
            <div v-if="row.id" class="tstable-action">
              <ul class="tstable-action-ul">
                <li v-if="index>0" class="tsfont-arrow-up" @click="moveUp(row)">{{ $t('page.moveup') }}</li>
                <li v-if="index<statusList.length - 1" class="tsfont-arrow-down" @click="moveDown(row)">{{ $t('page.movedown') }}</li>
                <li class="tsfont-edit" @click="editStatus(row)">{{ $t('page.edit') }}</li>
                <li class="tsfont-trash-o" @click="deleteStatus(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
          <template v-slot:expand="{ row }">
            <div>
              <div v-for="(statusrel, toindex) in getStatusRelList(row)" :key="toindex" class="grid">
                <div style="position: relative;text-align:right;line-height:10px">
                  <div class="border-color-base border-v" :class="toindex == getStatusRelList(row).length - 1 ? 'half' : ''"></div>
                  <div class="border-color-base border-h"></div>
                  <div class="tsfont-drop-right text-grey border-arrow"></div>
                </div>
                <div class="padding-sm overflow" style="display: flex;align-items: center;">
                  <span :style="{ color: statusrel.toStatusColor }">
                    <strong>{{ statusrel.toStatusLabel }}</strong>
                  </span>
                </div>
                <div class="padding-sm" style="word-break:break-all;white-space:normal">
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
      :id="currentStatusId"
      :appId="appId"
      @close="closeStatusEditDialog"
    ></StatusEditDialog>
    <AppStatusRelConfigDialog
      v-if="isStatusRelConfigEditShow"
      :projectId="projectId"
      :statusrel="currentStatusRel"
      @close="closeStatusRelConfigDialog"
    ></AppStatusRelConfigDialog>
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
    projectId: { type: Number },
    appId: { type: Number }
  },
  data() {
    return {
      theadList: [{ key: 'fromstatus', title: this.$t('term.rdm.initstatus') }, { key: 'isStart', title: this.$t('term.rdm.isstart') }, { key: 'isEnd', title: this.$t('term.rdm.isend') }, { key: 'transfer', title: '' }, { key: 'canTransfer', title: this.$t('term.rdm.targetstatus') }, { key: 'action' }],
      isStatusRelConfigEditShow: false,
      objectList: [],
      statusList: [],
      statusRelList: [],
      isStatusEditShow: false,
      currentStatusId: null,
      actionHide: {},
      currentStatusRel: null,
      statusMatrix: {}//状态矩阵数据，用于重置checkbox的选中状态
    };
  },
  beforeCreate() {},
  created() {
    this.init();
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
    moveDown(row) {
      const index = this.statusList.findIndex(d => d.id === row.id);
      if (index > -1 && index < this.statusList.length - 1) {
        const tmp = this.statusList[index];
        this.$set(this.statusList, index, this.statusList[index + 1]);
        this.$set(this.statusList, index + 1, tmp);
        const statusIdList = this.statusList.map(d => d.id);
        this.$api.rdm.status.updateStatusSort(statusIdList).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.init();
          }
        });
      }
    },
    moveUp(row) {
      const index = this.statusList.findIndex(d => d.id === row.id);
      if (index > 0) {
        const tmp = this.statusList[index];
        this.$set(this.statusList, index, this.statusList[index - 1]);
        this.$set(this.statusList, index - 1, tmp);
        const statusIdList = this.statusList.map(d => d.id);
        this.$api.rdm.status.updateStatusSort(statusIdList).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.init();
          }
        });
      }
    },
    changeIsStart(status) {
      const data = {id: status.id, flag: !!status.isStart, type: 'start'};
      this.$api.rdm.status.changeStatusType(data).then(res => {
        if (res.Status == 'OK') {
          this.init();
        }
      });
    },
    changeIsEnd(status) {
      const data = {id: status.id, flag: !!status.isEnd, type: 'end'};
      this.$api.rdm.status.changeStatusType(data).then(res => {
        if (res.Status == 'OK') {
          this.init();
        }
      });
    },
    async init() {
      await this.getStatusRelByAppId();
      this.getStatusByAppId();
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
      const fn = (vsnode) => {
        this.$api.rdm.status.toggleStatusRel({
          action: isCheck ? 'add' : 'delete',
          fromStatusId: fromStatus.id,
          toStatusId: toStatus.id,
          appId: this.appId
        }).then(res => {
          if (res.Return) {
            if (vsnode) {
              vsnode.isShow = false;
            }
            if (isCheck) {
              this.statusRelList.push({
                id: res.Return,
                appId: this.appId,
                fromStatusName: fromStatus.name,
                fromStatusLabel: fromStatus.label,
                fromStatusColor: fromStatus.color,
                fromStatusId: fromStatus.id,
                toStatusName: toStatus.name,
                toStatusLabel: toStatus.label,
                toStatusColor: toStatus.color,
                toStatusId: toStatus.id
              });
              this.$Message.success(this.$t('message.updatesuccess'));
              this.$set(fromStatus, '_expand', true);
            } else {
              const index = this.statusRelList.findIndex(d => d.id === res.Return);
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
            this.$set(this.statusMatrix, fromStatus.id + '_' + toStatus.id, false);
            this.$nextTick(() => {
              this.$set(this.statusMatrix, fromStatus.id + '_' + toStatus.id, true);
            });
          }
        });
      } else {
        fn();
      }
    },
    editStatus(status) {
      this.isStatusEditShow = true;
      this.currentStatusId = status.id;
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
          this.$api.rdm.status.deleteStatus(status.id).then(res => {
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
          if (d.fromStatusId === fromstatus.id) {
            returnList.push(d);
          }
        });
        return returnList;
      }
      return [];
    },
    getStatusByAppId() {
      this.$api.rdm.status.getStatusByAppId(this.appId).then(res => {
        this.statusList = res.Return;
        this.statusList.forEach(fromStatus => {
          this.$set(this.statusMatrix, '0_' + fromStatus.id, true);
          if (this.hasRelation(fromStatus)) {
            this.$set(fromStatus, '_expand', true);
          } else {
            this.$set(fromStatus, '_expand', false);
          }
          //组装status矩阵数据
          this.statusList.forEach(toStatus => {
            if (fromStatus.id !== toStatus.id) {
              this.$set(this.statusMatrix, fromStatus.id + '_' + toStatus.id, true); 
            }
          });
        });
      });
    },
    async getStatusRelByAppId() {
      await this.$api.rdm.status.getStatusRelByAppId(this.appId).then(res => {
        this.statusRelList = res.Return;
      });
    },
    editStatusRelConfig(statusrel) {
      this.isStatusRelConfigEditShow = true;
      this.currentStatusRel = statusrel;
    }
  },
  filter: {},
  computed: {
    finalStatusList() {
      return [{id: 0, label: this.$t('page.nostatus'), name: '-', _expand: this.hasRelation({id: 0})}, ...this.statusList];
    },
    hasRelation() {
      return (fromStatus, toStatus) => {
        if (this.statusRelList && this.statusRelList.length > 0) {
          for (let i = 0; i < this.statusRelList.length; i++) {
            const rel = this.statusRelList[i];
            if (rel.fromStatusId === fromStatus.id && (!toStatus || rel.toStatusId === toStatus.id)) {
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
