<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div>选择驱动模型</div>
      </template>
      <template v-slot>
        <TsTree
          ref="tree"
          :draggable="false"
          :nodeList="ciList"
          :keyConfig="keyConfig"
        >
          <template v-slot:default="{node}">
            <div>
              <Radio v-model="selectedNode[node.id]" :true-value="node.id" @on-change="chooseCi">{{ node.label }}<span class="text-grey">{{ node.name }}</span></Radio>
            </div>
          </template>
        </TsTree>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button type="primary" @click="save()">确定</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: { TsTree: resolve => require(['components/TsTree/TsTree.vue'], resolve)},
  props: {},
  data() {
    return {
      keyConfig: {name: 'name', id: 'id'},
      ciList: [],
      selectedNode: {},
      currentNode: null,
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
    this.getCiListForTree();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    chooseCi(nodeId) {
      this.currentNode = nodeId;
    },
    getCiListForTree() {
      this.$api.cmdb.ci.getCiListForTree().then(res => {
        this.ciList = res.Return;
      });
    },
    close() {
      this.$emit('close');
    },
    save() {
      if (this.currentNode) {
        this.$emit('close', this.currentNode);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    selectedNode: {
      handler: function(val) {
        for (let k in this.selectedNode) {
          if (k != this.currentNode) {
            this.selectedNode[k] = false;
          }
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
</style>
