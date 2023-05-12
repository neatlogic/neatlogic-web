<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addAlertLevel()">{{ $t('term.cmdb.alertlevel') }}</span>
      </template>
      <template v-slot:content>
        <TsTable v-bind="alertLevelData">
          <template v-slot:color="{ row }">
            <div class="color-block radius-sm" :style="{ background: row.color }"></div>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-edit" @click="editAlertLevel(row)">{{ $t('page.edit') }}</li>
                <li
                  class="tsfont-trash-o"
                  :class="row.invokeCount > 0 ? 'disable' : ''"
                  :title="row.invokeCount > 0 ? $t('message.common.targetinuse', { target: $t('term.cmdb.alertlevel') }) : ''"
                  @click="deleteAlertLevel(row)"
                >{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <AlertLevelEdit v-if="isAlertLevelShow" :level="currentLevel" @close="closeAlertLevel"></AlertLevelEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    AlertLevelEdit: resolve => require(['./alertlevel-edit-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      isAlertLevelShow: false,
      currentLevel: null,
      alertLevelData: {
        theadList: [
          { key: 'level', title: this.$t('page.level') },
          { key: 'name', title: this.$t('page.name') },
          { key: 'color', title: this.$t('page.color') },
          { key: 'action', title: '' }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchAlertLevel();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addAlertLevel() {
      this.isAlertLevelShow = true;
      this.currentLevel = null;
    },
    deleteAlertLevel(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.cmdb.alertlevel')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.cientity.deleteAlertLevel(row.level).then(res => {
            vnode.isShow = false;
            this.$Message.success(this.$t('message.deletesuccess'));
            this.searchAlertLevel();
          });
        }
      });
    },
    editAlertLevel(row) {
      this.isAlertLevelShow = true;
      this.currentLevel = row.level;
    },
    closeAlertLevel(needRefresh) {
      this.isAlertLevelShow = false;
      if (needRefresh) {
        this.searchAlertLevel();
      }
    },
    searchAlertLevel() {
      this.$api.cmdb.cientity.searchAlertLevel().then(res => {
        this.$set(this.alertLevelData, 'tbodyList', res.Return);
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
  width: 20px;
  height: 20px;
  display: inline-block;
}
</style>
