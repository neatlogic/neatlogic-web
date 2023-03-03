<template>
  <div>
    <div class="mb-md">
      <ButtonGroup>
        <Button
          v-for="(object, index) in objectList"
          :key="index"
          :type="buttonType(object.id)"
          @click="currentObjectId = object.id"
        >{{ object.name }}</Button>
      </ButtonGroup>
    </div>
    <div v-if="statusList && statusList.length > 0" class="tstable-container tstable-normal border tstable-no-fixedHeader radius-lg">
      <div class="tstable-main bg-op table-radius-main">
        <table class="table-main tstable-body">
          <thead>
            <tr>
              <th><span class="ml-md">初始状态</span></th>
              <th></th>
              <th v-for="(relstatus, sindex) in statusList" :key="sindex">
                <span>{{ relstatus.label }}</span>
                <span class="text-grey">({{ relstatus.name }})</span>
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
                <span>{{ fromstatus.label }}</span>
                <span class="text-grey">({{ fromstatus.name }})</span>
              </td>
              <td>
                <span class="text-grey">流转到</span>
                <span class="tsfont-arrow-right text-grey"></span>
              </td>
              <td v-for="(tostatus, sindex) in statusList" :key="sindex">
                <Checkbox
                  :disabled="fromstatus.id === tostatus.id"
                  :value="hasRelation(fromstatus, tostatus)"
                  @on-change="
                    val => {
                      updateStatusRel(val, fromstatus, tostatus);
                    }
                  "
                ></Checkbox>
              </td>
              <td class="action-tr">
                <div class="action-div" style="right: 24px;">
                  <div class="tstable-action">
                    <ul class="tstable-action-ul">
                      <li class="tsfont-edit" @click="editStatus(fromstatus)">编辑</li>
                      <li class="tsfont-trash-o" @click="deleteStatus(fromstatus)">删除</li>
                    </ul>
                  </div>
                </div>
              </td>
            </tr>
          </draggable>
        </table>
      </div>
    </div>
    <div class="mt-nm">
      <a class="tsfont-plus" href="javascript:void(0)" @click="addStatus">项目状态</a>
    </div>
    <StatusEditDialog v-if="isStatusEditShow" :id="currentStatusId" @close="closeStatusEditDialog"></StatusEditDialog>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
export default {
  name: '',
  components: {
    draggable,
    StatusEditDialog: resolve => require(['./object-status-edit-dialog.vue'], resolve)
  },
  props: {
    projectId: { type: Number }
  },
  data() {
    return {
      objectList: [],
      statusList: [],
      statusRelList: [],
      currentObjectId: null,
      isStatusEditShow: false,
      currentStatusId: null
    };
  },
  beforeCreate() {},
  created() {
    this.getObjectByProjectId();
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
    getObjectByProjectId() {
      if (this.projectId) {
        this.$api.rdm.project.getObjectByProjectId(this.projectId).then(res => {
          this.objectList = res.Return;
          //默认选中第一个
          if (this.objectList && this.objectList.length > 0) {
            this.currentObjectId = this.objectList[0].id;
          }
        });
      }
    },
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
      this.isStatusEditShow = true;
      this.currentStatusId = null;
      if (needRefresh) {
        this.getStatusByObjectId();
      }
    },
    deleteStatus(status) {
      this.$createDialog({});
    },
    getStatusByObjectId() {
      if (this.currentObjectId) {
        this.$api.rdm.project.getStatusByObjectId(this.currentObjectId).then(res => {
          this.statusList = res.Return;
        });
      }
    },
    getStatusRelByObjectId() {
      if (this.projectId) {
        return this.$api.rdm.project.getStatusRelByObjectId(this.currentObjectId).then(res => {
          this.statusRelList = res.Return;
        });
      }
    }
  },
  filter: {},
  computed: {
    buttonType() {
      return objectId => {
        if (objectId === this.currentObjectId) {
          return 'primary';
        } else {
          return null;
        }
      };
    },
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
  watch: {
    currentObjectId: {
      handler: function(val) {
        if (val) {
          this.getStatusByObjectId();
          this.getStatusRelByObjectId();
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
