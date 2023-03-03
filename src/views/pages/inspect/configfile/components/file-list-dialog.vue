<template>
  <div>
    <TsDialog
      title="文件列表"
      type="slider"
      width="medium"
      :isShow="true"
      :hasFooter="false"
      :maskClose="true"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsTable
            :theadList="theadList"
            :tbodyList="tbodyList"
          >
            <template v-slot:path="{row}">
              <div class="text-href" @click="gotoFileDetail(row)">{{ row.path }}</div>
            </template>
            <template v-slot:action="{ row }">
              <div v-auth="'INSPECT_CONFIG_FILE_MODIFY'" class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="tsfont-file-single" @click="clearFile(row)">清理文件</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>
    <ClearFileDialog
      v-if="isShowClear"
      :pathConfig="pathConfig"
      @close="closeClear"
    ></ClearFileDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    ClearFileDialog: resolve => require(['./clear-file-dialog.vue'], resolve)
  },
  props: {
    resourceId: Number
  },
  data() {
    return {
      tableConfig: {},
      theadList: [
        {
          title: '文件名',
          key: 'path'
          // maxLength: 50
        },
        {
          title: '文件修改时间',
          key: 'inspectTime',
          type: 'time'
        },
        {
          key: 'action'
        }
      ],
      tbodyList: [],
      pathConfig: {},
      isShowClear: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getFileList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getFileList() {
      this.$api.inspect.configfile.getFileList({resourceId: this.resourceId}).then((res) => {
        if (res && res.Return) {
          this.tbodyList = res.Return.tbodyList || [];
        }
      });
    },
    closeDialog() {
      this.$emit('close');
    },
    clearFile(row) {
      this.pathConfig = row;
      this.$set(this.pathConfig, 'resourceId', this.resourceId);
      this.isShowClear = true;
    },
    gotoFileDetail(row) {
      this.$router.push({
        path: '/configfile-detail',
        query: {
          id: row.id,
          resourceId: this.resourceId
        }
      });
    },
    closeClear(refresh) {
      this.isShowClear = false;
      if (refresh) {
        this.getFileList();
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
