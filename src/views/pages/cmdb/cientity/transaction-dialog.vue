<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div>未提交事务</div>
      </template>
      <template v-slot>
        <div><TransactionList
          :needCheck="true"
          :needAction="true"
          :needSearch="false"
          :ciEntityId="ciEntityId"
          :ciId="ciId"
        ></TransactionList></div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TransactionList: resolve => require(['./transaction-list.vue'], resolve)
  },
  props: {
    ciEntityId: {type: Number},
    ciId: {type: Number}
  },
  data() {
    return { 
      dialogConfig: { 
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large'
      }
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
    close() {
      this.$emit('close', true);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
