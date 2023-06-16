<template>
  <div>
    <Tabs v-model="currentTab">
      <TabPane :label="$t('term.rdm.attributesetting')" name="attr" class="pl-md">
        <AttrEdit v-if="currentTab === 'attr'" :appId="appData.id" :projectId="appData.projectId"></AttrEdit>
      </TabPane>
      <TabPane :label="$t('term.rdm.statussets')" name="objectstatus" class="pl-md">
        <AppStatus v-if="currentTab === 'objectstatus'" :appId="appData.id" :projectId="appData.projectId"></AppStatus>
      </TabPane>
      <!--<TabPane :label="$t('term.rdm.templatesetting')" name="attr" class="pl-md">
        <TsFormItem :label="$t('term.rdm.testcondition')">
          <TsCkeditor
            :readonly="false"
          ></TsCkeditor>
        </TsFormItem>
        <TsFormItem :label="$t('term.rdm.teststep')">
          <TsCkeditor
            :readonly="false"
          ></TsCkeditor>
        </TsFormItem>
        <TsFormItem :label="$t('term.rdm.testresult')">
          <TsCkeditor
            :readonly="false"
          ></TsCkeditor>
        </TsFormItem>
      </TabPane>-->
    </Tabs>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AttrEdit: resolve => require(['@/views/pages/rdm/project/edittab/components/attr-edit.vue'], resolve),
    AppStatus: resolve => require(['@/views/pages/rdm/project/edittab/components/app-status-edit.vue'], resolve)
    // TsCkeditor: resolve => require(['@/resources/plugins/TsCkeditor/TsCkeditor.vue'], resolve)
  },
  props: {
    appData: {type: Object}
  },
  data() {
    return {
      currentTab: 'attr'
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
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
