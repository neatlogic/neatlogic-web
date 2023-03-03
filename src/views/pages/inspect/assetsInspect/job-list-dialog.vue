<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-close="close"
    >
      <template v-slot>
        <div>
          <JobList
            :params="{scheduleId: id, sourceList: ['scheduleinspect']}"
          ></JobList>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    JobList: resolve => require(['pages/autoexec/manage/job/job-list.vue'], resolve)
  },
  props: {
    id: {type: Number}
  },
  data() {
    return {
      dialogConfig: { 
        type: 'modal',
        title: '作业执行记录',
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
