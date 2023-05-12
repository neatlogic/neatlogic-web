<template>
  <div>
    <Tabs v-model="currentTab">
      <TabPane :label="$t('term.rdm.attributesetting')" name="attr" class="pl-md">
        <AttrEdit v-if="currentTab === 'attr'" :appId="appId" :projectId="projectId"></AttrEdit>
      </TabPane>
      <TabPane :label="$t('term.rdm.statussets')" name="objectstatus" class="pl-md">
        <AppStatus v-if="currentTab === 'objectstatus'" :appId="appId" :projectId="projectId"></AppStatus>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AttrEdit: resolve => require(['./attr-edit.vue'], resolve),
    AppStatus: resolve => require(['./app-status-edit.vue'], resolve)
  },
  props: {
    projectId: {type: Number},
    appId: {type: Number}
  },
  data() {
    return {
      currentTab: 'attr'
    };
  },
  beforeCreate() {},
  async created() {
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
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
