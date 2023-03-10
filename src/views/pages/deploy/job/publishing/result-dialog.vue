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
            <span class="text-success">{{ $t('term.deploy.createsuccess') }}</span>
            <span>{{ $t('term.deploy.appmodulecreatesuccess', {target: item.appModuleName}) }}</span>
            <span class="text-href" @click="gotoDetail(item)">{{ $t('term.deploy.clickredirect') }}</span>
          </div>
          <div v-else-if="item.errorMsg">
            <span class="text-error">{{ $t('term.deploy.createfail') }}</span>
            <span>{{ $t('term.deploy.applymodule') }}{{ item.appModuleName }}{{ item.errorMsg }}</span>
          </div>
          <div v-else>{{ $t('term.deploy.moduleaddjobfail', {target: item.appModuleName}) }}</div>
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
