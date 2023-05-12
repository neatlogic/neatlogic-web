<template>
  <div>
    <TsDialog
      v-if="isShowRecord"
      v-bind="dialogConfig"
      @on-close="close"
    >
      <template v-slot:header>
        <div>
          {{ $t('term.autoexec.executionrecord') }}
        </div>
      </template>
      <template v-slot>
        <JobList :params="{combopId: id, scheduleId: scheduleId}"></JobList>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import JobList from '../job/job-list.vue';
export default {
  name: '',
  components: {
    JobList
  },
  filters: {},
  props: {
    id: {type: [Number, String]},
    isShowRecord: {type: Boolean, default: false},
    scheduleId: {type: [Number, String]} // 定时作业查看执行记录
  },
  data() {
    let _this = this;
    return {
      dialogConfig: {
        type: 'slider',
        width: '1000px',
        maskClose: true,
        isShow: true,
        hasFooter: false
      }
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
    close() {
      this.$emit('close');
    }
  },
  computed: {},
  watch: {
  }
};
</script>
<style lang='less' scoped>
</style>
