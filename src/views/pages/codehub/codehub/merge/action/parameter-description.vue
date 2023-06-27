<template>
  <div>
    <Alert show-icon>
      <template slot="desc">
        <div>{{ $t('term.codehub.helpdesc') }}</div>
      </template>
    </Alert>
    <TsTable :theadList="theadList" :tbodyList="tbodyList">
      <template slot="name" slot-scope="{row}">
        <div v-clipboard="getClipboard(row.name)" v-clipboard:success="copyok">{{ '${' }}{{ row.name }}{{ '}' }}</div>
      </template>
    </TsTable>
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
      tbodyList: [],
      theadList: [{
        title: this.$t('page.variablename'),
        key: 'name'
      }, {
        title: this.$t('page.description'),
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
          this.tbodyList = res.Return.innerVariableList || [];
        }
      });
    },
    getClipboard(val) {
      return '${' + val + '}';
    },
    copyok(val) {
      this.$Message.success(this.$t('message.copysuccess'));
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
