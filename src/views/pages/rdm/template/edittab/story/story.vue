<template>
  <div>
    <Tabs v-model="currentTab">
      <TabPane :label="$t('term.rdm.attributesetting')" name="attr" class="pl-md">
        <AttrEdit v-if="currentTab === 'attr'" :appType="appType"></AttrEdit>
      </TabPane>
      <TabPane :label="$t('term.rdm.statussets')" name="objectstatus" class="pl-md">
        <AppStatus v-if="currentTab === 'objectstatus'" :statusList="appType.config && appType.config.statusList" :statusRelList="appType.config && appType.config.statusRelList"></AppStatus>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AttrEdit: () => import('@/views/pages/rdm/template/edittab/components/attr-edit.vue'),
    AppStatus: () => import('@/views/pages/rdm/template/edittab/components/app-status-edit.vue')
  },
  props: {
    appType: { type: Object }
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
  watch: {

  }
};
</script>
<style lang="less"></style>
