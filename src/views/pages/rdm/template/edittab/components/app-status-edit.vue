<template>
  <div>
    <div class="mb-md">
      <a class="tsfont-plus" href="javascript:void(0)" @click="addStatus">{{ $t('page.status') }}</a>
    </div>
    <div class="tstable-container tstable-normal border tstable-no-fixedHeader radius-lg">
      <div class="tstable-main bg-op table-radius-main">
        <TsTable :theadList="theadList" :tbodyList="finalStatusList" canExpand>
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
              :value="row.isStart"
              :trueValue="1"
              :falseValue="0"
              @on-change="
                val => {
                  $set(row, 'isStart', val);
                }
              "
            ></TsFormSwitch>
          </template>
          <template v-slot:isEnd="{ row }">
            <TsFormSwitch
              :value="row.isEnd"
              :trueValue="1"
              :falseValue="0"
              @on-change="
                val => {
                  $set(row, 'isEnd', val);
                }
              "
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
          <template v-slot:action="{ row, index }">
            <div v-if="row.uuid" class="tstable-action">
              <ul class="tstable-action-ul">
                <li v-if="index > 1" class="tsfont-arrow-up" @click="moveUp(row)">{{ $t('page.moveup') }}</li>
                <li v-if="index < finalStatusList.length - 1" class="tsfont-arrow-down" @click="moveDown(row)">{{ $t('page.movedown') }}</li>
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
                  <span v-if="getUserList(statusrel).length > 0">
                    <Divider type="vertical" />
                    <span class="text-grey mr-sm">{{ $t('term.process.dealwithuser') }}</span>
                    <Tag v-for="(auth, aindex) in getUserList(statusrel)" :key="aindex">
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
    <StatusEditDialog v-if="isStatusEditShow" :statusData="currentStatusData" @close="closeStatusEditDialog"></StatusEditDialog>
    <AppStatusRelConfigDialog v-if="isStatusRelConfigEditShow" :statusrel="currentStatusRel" @close="closeStatusRelConfigDialog"></AppStatusRelConfigDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    StatusEditDialog: resolve => require(['@/views/pages/rdm/template/edittab/components/app-status-edit-dialog.vue'], resolve),
    AppStatusRelConfigDialog: resolve => require(['@/views/pages/rdm/template/edittab/components/app-statusrel-config-dialog.vue'], resolve)
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
      currentStatusData: {},
      actionHide: {},
      currentStatusRel: null,
      statusMatrix: {} //状态矩阵数据，用于重置checkbox的选中状态
    };
  },
  beforeCreate() {},
  created() {},
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
      const index = this.statusList.findIndex(d => d.uuid === row.uuid);
      if (index > -1 && index < this.statusList.length - 1) {
        const tmp = this.statusList[index];
        this.$set(this.statusList, index, this.statusList[index + 1]);
        this.$set(this.statusList, index + 1, tmp);
      }
    },
    moveUp(row) {
      const index = this.statusList.findIndex(d => d.uuid === row.uuid);
      if (index > 0) {
        const tmp = this.statusList[index];
        this.$set(this.statusList, index, this.statusList[index - 1]);
        this.$set(this.statusList, index - 1, tmp);
      }
    },
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
    getUserList(statusrel) {
      if (statusrel && statusrel.config && statusrel.config.userList && statusrel.config.userList.length > 0) {
        return statusrel.config.userList;
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
      if (isCheck) {
        this.statusRelList.push({
          uuid: this.$utils.setUuid(),
          fromStatusName: fromStatus.name,
          fromStatusLabel: fromStatus.label,
          fromStatusColor: fromStatus.color,
          fromStatusUuid: fromStatus.uuid,
          toStatusName: toStatus.name,
          toStatusLabel: toStatus.label,
          toStatusColor: toStatus.color,
          toStatusUuid: toStatus.uuid
        });
        this.$set(fromStatus, '_expand', true);
      } else {
        const index = this.statusRelList.findIndex(d => d.fromStatusUuid === fromStatus.uuid && d.toStatusUuid === toStatus.uuid);
        if (index > -1) {
          this.statusRelList.splice(index, 1);
          if (this.hasRelation(fromStatus)) {
            this.$set(fromStatus, '_expand', true);
          } else {
            this.$set(fromStatus, '_expand', false);
          }
        }
      }
      this.$set(this.statusMatrix, fromStatus.uuid + '_' + toStatus.uuid, false);
      this.$nextTick(() => {
        this.$set(this.statusMatrix, fromStatus.uuid + '_' + toStatus.uuid, true);
      });
    },
    sortStatus() {
      console.log(this.statusList);
    },
    editStatus(status) {
      this.isStatusEditShow = true;
      this.currentStatusData = status;
    },
    closeStatusEditDialog(statusData) {
      this.isStatusEditShow = false;
      this.currentStatusData = {};
      if (statusData) {
        const index = this.statusList.findIndex(d => d.uuid === statusData.uuid);
        if (index > -1) {
          this.statusList.splice(index, 1, statusData);
        } else {
          this.statusList.push(statusData);
        }
      }
    },
    deleteStatus(status) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: this.$t('page.status') }),
        btnType: 'error',
        'on-ok': vnode => {
          const index = this.statusList.findIndex(d => d.uuid === status.uuid);
          if (index > -1) {
            this.statusList.splice(index, 1);
          }
          for (let i = this.statusRelList.length - 1; i >= 0; i--) {
            const rel = this.statusRelList[i];
            if (rel.fromStatusUuid === status.uuid || rel.toStatusUuid === status.uuid) {
              this.statusRelList.splice(i, 1);
            }
          }
          vnode.isShow = false;
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
    finalStatusList() {
      return [{ uuid: 0, label: this.$t('page.nostatus'), name: '-', _expand: this.hasRelation({ uuid: 0 }) }, ...this.statusList];
    },
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
  watch: {
    statusList: {
      handler: function(val) {
        this.statusMatrix = {};
        //组装status矩阵数据
        this.statusList.forEach(fromStatus => {
          this.$set(this.statusMatrix, '0_' + fromStatus.uuid, true);
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
      deep: true,
      immediate: true
    }
  }
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
