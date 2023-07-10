<template>
  <div>
    <Tabs v-model="currentTab">
      <TabPane :label="$t('term.rdm.attributesetting')" name="attr" class="pl-md">
        <AttrEdit v-if="currentTab === 'attr'" :attrList="appType.config && appType.config.attrList"></AttrEdit>
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
    AttrEdit: resolve => require(['@/views/pages/rdm/template/edit-tab/components/attr-edit.vue'], resolve),
    AppStatus: resolve => require(['@/views/pages/rdm/template/edit-tab/components/app-status-edit.vue'], resolve)
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
