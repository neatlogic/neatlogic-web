<template>
  <div>
    <div class="mb-md">
      <a class="tsfont-plus" href="javascript:void(0)" @click="addStatus">{{ $t('page.status') }}</a>
    </div>
    <div class="tstable-container tstable-normal border tstable-no-fixedHeader radius-lg">
      <div class="tstable-main bg-op table-radius-main">
        <table class="table-main tstable-body">
          <thead>
            <tr>
              <th><span class="ml-md">{{ $t('term.rdm.initstatus') }}</span></th>
              <th>{{ $t('term.rdm.isstart') }}</th>
              <th>{{ $t('term.rdm.isend') }}</th>
              <th></th>
              <th v-for="(relstatus, sindex) in statusList" :key="sindex" :style="{ color: relstatus.color }">
                <span>
                  <strong>{{ relstatus.label }}</strong>
                </span>
                <span class="text-grey">[{{ relstatus.name }}]</span>
              </th>
              <th class="th-action"></th>
            </tr>
          </thead>
          <draggable
            tag="tbody"
            :list="statusList"
            handle=".tsfont-drag"
            class="tbody-main"
            @end="sortStatus"
          >
            <tr v-for="(fromstatus, index) in statusList" :key="index" class="tstable-tr">
              <td>
                <span class="tsfont-drag" style="cursor:move"></span>
                <span :style="{ color: fromstatus.color }"><strong>{{ fromstatus.label }}</strong></span>
                <span class="text-grey">[{{ fromstatus.name }}]</span>
              </td>
              <td><TsFormSwitch :value="fromstatus.isStart"></TsFormSwitch></td>
              <td><TsFormSwitch :value="fromstatus.isEnd"></TsFormSwitch></td>
              <td>
                <span class="text-grey">{{ $t('term.rdm.goto') }}</span>
                <span class="tsfont-arrow-right text-grey"></span>
              </td>
              <td v-for="(tostatus, sindex) in statusList" :key="sindex">
                <Checkbox
                  v-if="fromstatus.id !== tostatus.id"
                  :value="hasRelation(fromstatus, tostatus)"
                  @on-change="
                    val => {
                      updateStatusRel(val, fromstatus, tostatus);
                    }
                  "
                ></Checkbox>
                <span v-else class="text-grey">-</span>
              </td>
              <td class="action-tr">
                <div class="action-div" style="right: 24px;">
                  <div class="tstable-action">
                    <ul class="tstable-action-ul">
                      <li class="tsfont-edit" @click="editStatus(fromstatus)">{{ $t('page.edit') }}</li>
                      <li class="tsfont-trash-o" @click="deleteStatus(fromstatus)">{{ $t('page.delete') }}</li>
                    </ul>
                  </div>
                </div>
              </td>
            </tr>
          </draggable>
        </table>
      </div>
    </div>
    <StatusEditDialog
      v-if="isStatusEditShow"
      :id="currentStatusId"
      :projectId="projectId"
      @close="closeStatusEditDialog"
    ></StatusEditDialog>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
export default {
  name: '',
  components: {
    draggable,
    StatusEditDialog: resolve => require(['./components/project-status-edit-dialog.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  props: {
    projectId: { type: Number }
  },
  data() {
    return {
      statusList: [],
      statusRelList: [],
      isStatusEditShow: false,
      currentStatusId: null
    };
  },
  beforeCreate() {},
  created() {
    this.getStatusByProjectId();
    this.getStatusRelByProjectId();
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
    addStatus() {
      this.isStatusEditShow = true;
    },
    updateStatusRel(isCheck, fromStatus, toStatus) {
      this.$api.rdm.project
        .updateStatusRel({
          action: isCheck ? 'add' : 'delete',
          fromStatusId: fromStatus.id,
          toStatusId: toStatus.id,
          projectId: this.projectId
        })
        .then(res => {});
    },
    sortStatus() {
      console.log(this.statusList);
    },
    editStatus(status) {
      this.isStatusEditShow = true;
      this.currentStatusId = status.id;
    },
    closeStatusEditDialog(needRefresh) {
      this.isStatusEditShow = false;
      this.currentStatusId = null;
      if (needRefresh) {
        this.getStatusByProjectId();
      }
    },
    deleteStatus(status) {
      this.$createDialog({});
    },
    getStatusByProjectId() {
      if (this.projectId) {
        this.$api.rdm.project.getStatusByProjectId(this.projectId).then(res => {
          this.statusList = res.Return;
        });
      }
    },
    getStatusRelByProjectId() {
      if (this.projectId) {
        return this.$api.rdm.project.getStatusRelByProjectId(this.projectId).then(res => {
          this.statusRelList = res.Return;
        });
      }
    }
  },
  filter: {},
  computed: {
    hasRelation() {
      return (fromStatus, toStatus) => {
        if (this.statusRelList && this.statusRelList.length > 0) {
          for (let i = 0; i < this.statusRelList.length; i++) {
            const rel = this.statusRelList[i];
            if (rel.fromStatusId === fromStatus.id && rel.toStatusId === toStatus.id) {
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
<style lang="less"></style>
