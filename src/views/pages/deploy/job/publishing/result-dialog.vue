<template>
  <div>
    <TsDialog
      type="modal"
      :isShow="true"
      :hasFooter="false"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div v-for="(item,index) in resultList" :key="index" class="pb-sm">
          <div v-if="item.jobId">
            <span class="text-success">创建成功</span>
            <span>应用模块{{ item.appModuleName }}创建成功，</span>
            <span class="text-href" @click="gotoDetail(item)">请点击跳转</span>
          </div>
          <div v-else-if="item.errorMsg">
            <span class="text-error">创建失败：</span>
            <span>应用模块{{ item.appModuleName }}{{ item.errorMsg }}</span>
          </div>
          <div v-else>{{ item.appModuleName }}创建作业失败</div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    resultList: Array
  },
  data() {
    return {};
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
    closeDialog() {
      this.$emit('close');
    },
    gotoDetail(item) {
      this.$router.push({
        path: '/job-detail',
        query: {id: item.jobId}
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
