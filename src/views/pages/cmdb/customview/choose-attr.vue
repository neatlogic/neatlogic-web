<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div>选择驱动模型</div>
      </template>
      <template v-slot>
        <TsTable v-bind="attrData" multiple @getSelected="getSelected">
        </TsTable>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button :disabled="selectedAttr?false:true" type="primary" @click="save()">确定</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: { TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve) },
  props: {ciId: {type: Number}},
  data() {
    return {
      selectedAttr: [],
      attrData: { theadList: [
        {key: 'selection'},
        {
          title: '唯一标识',
          key: 'name'
        },
        {
          title: '名称',
          key: 'label'
        },
        { title: '类型', key: 'typeText' },
        { title: '说明', key: 'description' }], tbodyList: []},
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: '800px'
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getAttrByCiId();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getSelected(val, items) {
      if (items.length) {
        this.selectedAttr = items;
      } else {
        this.selectedAttr = null;
      }
    },
    chooseAttr(nodeId) {
      this.currentNode = nodeId;
    },
    getAttrByCiId() {
      if (this.ciId) {
        this.$api.cmdb.ci.getAttrByCiId(this.ciId).then(res => {
          this.attrData.tbodyList = res.Return;
        });
      }
    },
    close() {
      this.$emit('close');
    },
    save() {
      if (this.selectedAttr) {
        this.$emit('close', this.ciId, this.selectedAttr);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less" scoped></style>
