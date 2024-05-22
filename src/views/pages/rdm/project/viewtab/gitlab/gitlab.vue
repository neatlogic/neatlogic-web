<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <AppTab v-if="appId && projectId" :appId="appId" :projectId="projectId"></AppTab>
      </template>
      <template v-slot:content>
        <GitlabList :appId="appId" :canSearch="true"></GitlabList>
      </template>
    </TsContain>
  </div>
</template>
<script>
import mixins from '@/views/pages/rdm/project/viewtab/issue-mixin.js';
export default {
  name: '',
  components: {
    AppTab: () => import('@/views/pages/rdm/project/viewtab/components/app-tab.vue'),
    GitlabList: () => import('@/views/pages/rdm/project/viewtab/components/gitlab-list.vue')
  },
  mixins: [mixins],
  props: {},
  data() {
    return { pageName: this.$t('term.rdm.gitlabcommit') };
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
