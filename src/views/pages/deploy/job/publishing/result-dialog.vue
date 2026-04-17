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
            <span class="mr-xs text-success">{{ $t('term.deploy.createsuccess') }}</span>
            <span class="mr-xs text-grey">{{ item.appSystemName }}</span>
            <span class="mr-xs text-grey">{{ item.appModuleName }}</span>
            <span class="mr-xs text-grey">{{ item.envName }}</span>
            <span class="mr-xs text-grey">{{ item.version }}</span>
            <span class="text-href" @click="gotoDetail(item)">{{ $t('term.deploy.clickredirect') }}</span>
          </div>
          <div v-else-if="item.errorMsg">
            <span class="mr-xs text-error">{{ $t('term.deploy.createfail') }}</span>
            <span class="mr-xs text-grey">{{ item.appSystemName }}</span>
            <span class="mr-xs text-grey">{{ item.appModuleName }}</span>
            <span class="mr-xs text-grey">{{ item.envName }}</span>
            <span class="mr-xs text-grey">{{ item.version }}</span>
            <span>{{ item.errorMsg }}</span>
          </div>
          <div v-else>
            <span class="mr-xs text-error">{{ $t('term.deploy.createfail') }}</span>
            <span class="mr-xs text-grey">{{ item.appSystemName }}</span>
            <span class="mr-xs text-grey">{{ item.appModuleName }}</span>
            <span class="mr-xs text-grey">{{ item.envName }}</span>
            <span class="mr-xs text-grey">{{ item.version }}</span>
          </div>
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
