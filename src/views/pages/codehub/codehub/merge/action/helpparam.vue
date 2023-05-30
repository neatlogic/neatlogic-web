<template>
  <div>
    <Alert show-icon>
      <template slot="desc">
        <div>帮助说明：点击变量名即可复制变量，变量在动作被触发时替换为实际值，支持Freemarker模板引擎的语法。</div>
      </template>
    </Alert>
    <TsTable v-if="innerVariableList && innerVariableList.length > 0" :theadList="inputtheadList" :tbodyList="innerVariableList">
      <template slot="name" slot-scope="{row}">
        <div v-clipboard="getClipboard(row.name)" v-clipboard:success="copyok">{{ '${' }}{{ row.name }}{{ '}' }}</div>
      </template>
    </TsTable>
    <div v-else>暂无输入参数</div>
  </div>
</template>
<script>
import clipboard from '@/resources/directives/clipboard.js';
export default {
  directives: { clipboard },
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve)
  },
  props: {},
  data() {
    return {
      innerVariableList: [],
      inputtheadList: [{
        title: '变量名',
        key: 'name'
      }, {
        title: '变量说明',
        key: 'description'
      }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getInnerVariableList();
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
    getInnerVariableList: function() {
      this.$api.codehub.merge.getInnerVariableList().then(res => {
        if (res.Status == 'OK') {
          this.innerVariableList = res.Return.innerVariableList;
        }
      });
    },
    getClipboard(val) {
      return '${' + val + '}';
    },
    copyok(val) {
      this.$Message.success('复制成功');
    }
  },

  filter: {},

  computed: {},

  watch: {}
};
</script>
<style lang="less"></style>
