<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-close="close"
    >
      <template v-slot>
        <div>
          <JobManage
            :filter-params="{scheduleId: id, sourceList: ['scheduleinspect']}"
            :can-add-job="false"
            :can-delete-job="false"
          ></JobManage>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    JobManage: () => import('@/views/pages/autoexec/manage/job-manage.vue')
  },
  props: {
    id: {type: Number}
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        title: this.$t('term.inspect.jobexerecord'),
        hasFooter: false,
        maskClose: true,
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
