<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-ok="save()"
      @on-close="close()"
    >
      <template v-slot>
        <div>
          <ConditionGroup v-model="viewData.rule" :appId="appId"></ConditionGroup>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    ConditionGroup: resolve => require(['@/views/pages/rdm/project/viewtab/components/condition-group.vue'], resolve)
  },
  props: {
    appId: {type: Number}
  },
  data() {
    return {
      dialogConfig: {
        title: '编辑视图',
        width: 'medium',
        isShow: true,
        maskClose: false
      },
      viewData: {}
    };
  },
  beforeCreate() {},
  created() {
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
    save() {

    },
    close() {
      
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
