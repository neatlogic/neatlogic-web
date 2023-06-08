<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="editPriority()">{{ $t('dialog.title.addtarget', { target: $t('page.priority') }) }}</span>
      </template>
      <template v-slot:content>
        <TsTable
          :canDrag="true"
          :tbodyList="priorityList"
          :theadList="theadList"
          @updateRowSort="updateSort"
        >
          <template v-slot:name="{ row }">
            <a href="javascript:void(0)" @click="editPriority(row)">{{ row.name }}</a>
          </template>
          <template v-slot:color="{ row }">
            <div class="color-block radius-sm" :style="{ background: row.color }"></div>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-trash-o" @click="delPriority(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <PriorityEditDialog v-if="isPriorityEditShow" :id="currentPriorityId" @close="closePriorityEdit"></PriorityEditDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    PriorityEditDialog: resolve => require(['./priority-edit-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      theadList: [
        {
          key: 'name',
          title: this.$t('page.name')
        },
        { key: 'color', title: this.$t('page.color') },
        { key: 'action' }
      ],
      priorityList: [],
      currentPriorityId: null,
      isPriorityEditShow: false
    };
  },
  beforeCreate() {},
  created() {
    this.getPriorityList();
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
    updateSort(e, sortList) {
      this.$api.rdm.priority.updatePrioritySort(sortList).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.updatesuccess'));
        }
      });
    },
    closePriorityEdit(needRefresh) {
      this.isPriorityEditShow = false;
      if (needRefresh) {
        this.getPriorityList();
      }
    },
    getPriorityList() {
      this.$api.rdm.priority.getPriorityList().then(res => {
        this.priorityList = res.Return;
      });
    },
    editPriority(priority) {
      this.isPriorityEditShow = true;
      if (priority) {
        this.currentPriorityId = priority.id;
      } else {
        this.currentPriorityId = null;
      }
    },
    delPriority(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: this.$t('page.priority') }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.rdm.priority.deletePriority(row.id).then(res => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.getPriorityList();
              vnode.isShow = false;
            }
          });
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.color-block {
  height: 20px;
  width: 20px;
}
</style>
