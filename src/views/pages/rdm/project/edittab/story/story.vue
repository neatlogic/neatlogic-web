<template>
  <div>
    <Tabs v-model="currentTab">
      <TabPane :label="$t('term.rdm.attributesetting')" name="attr" class="pl-md">
        <AttrEdit v-if="currentTab === 'attr'" :appId="appData.id" :projectId="appData.projectId"></AttrEdit>
      </TabPane>
      <TabPane :label="$t('term.rdm.statussets')" name="objectstatus" class="pl-md">
        <AppStatus v-if="currentTab === 'objectstatus'" :appId="appData.id" :projectId="appData.projectId"></AppStatus>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AttrEdit: () => import('@/views/pages/rdm/project/edittab/components/attr-edit.vue'),
    AppStatus: () => import('@/views/pages/rdm/project/edittab/components/app-status-edit.vue')
  },
  props: {
    appData: { type: Object }
  },
  data() {
    return {
      currentTab: 'attr'
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
