<template>
  <TsDialog
    v-bind="dialogConfig"
    :hasFooter="canEdit"
    @on-ok="save()"
    @on-close="close()"
  >
    <template v-slot>
      <div>
        <TargetDetail
          ref="targetDetail"
          :config="config"
        ></TargetDetail>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TargetDetail: () => import('@/views/pages/autoexec/components/common/addTarget/target-detail')
  },
  props: {
    config: Object, //执行目标的值
    canEdit: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('dialog.title.addtarget', {target: this.$t('page.target')}),
        isShow: true,
        type: 'slider',
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
    save() {
      let data = this.$refs.targetDetail.save();
      this.$emit('close', data);
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
