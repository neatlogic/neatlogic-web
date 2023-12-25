<template>
  <div class="basic-info">
    <TsForm
      ref="settingForm"
      v-model="dataConfig"
      labelPosition="top"
      :item-list="settingForm"
    >
      <template v-slot:owner>
        <UserCard :uuid="dataConfig.owner"></UserCard>
      </template>
      <template v-slot:viewAuthorityList>
        <GroupList :dataList="dataConfig.viewAuthorityList" type="usercard"></GroupList>
      </template>
      <template v-slot:editAuthorityList>
        <GroupList :dataList="dataConfig.editAuthorityList" type="usercard"></GroupList>
      </template>
      <template v-slot:executeAuthorityList>
        <GroupList :dataList="dataConfig.executeAuthorityList" type="usercard"></GroupList>
      </template>
    </TsForm>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    GroupList: resolve => require(['@/resources/components/GroupList/GroupList.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  filters: {},
  props: {
    dataConfig: {type: Object, default: () => {}},
    isResourcecenterAuth: Boolean
  },
  data() {
    let _this = this;
    return {
      settingForm: {
        name: {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          label: _this.$t('page.name'),
          width: '100%',
          readonly: true
        },
        opTypeName: {
          type: 'text',
          name: 'opTypeName',
          value: '',
          maxlength: 50,
          label: this.$t('page.combop.optype'),
          width: '100%',
          readonly: true,
          isHidden: this.isResourcecenterAuth
        },
        typeName: {
          type: 'text',
          name: 'typeName',
          value: '',
          maxlength: 50,
          label: this.$t('term.autoexec.toolclassification'),
          width: '100%',
          readonly: true
        },
        owner: {
          type: 'slot',
          name: 'owner',
          label: this.$t('term.autoexec.maintainer')
        },
        viewAuthorityList: {
          type: 'slot',
          name: 'viewAuthorityList',
          label: this.$t('page.viewauthority')
        },
        editAuthorityList: {
          type: 'slot',
          name: 'editAuthorityList',
          label: this.$t('page.editauthority')
        },
        executeAuthorityList: {
          type: 'slot',
          name: 'executeAuthorityList',
          label: this.$t('page.executeauthority')
        },
        policyName: {
          type: 'text',
          name: 'policyName',
          value: '',
          maxlength: 50,
          label: this.$t('page.notificationstrategy'),
          width: '100%',
          readonly: true
        },
        description: {
          type: 'textarea',
          name: 'description',
          value: '',
          label: _this.$t('page.description'),
          width: '100%',
          maxlength: 500,
          readonly: true
        }
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

  },
  computed: {},
  watch: {

  }
};
</script>
<style lang='less' scoped>
.basic-info{
  padding: 12px 16px;
  .title{
    padding-bottom: 10px;
  }
  .action-icon{
    position: absolute;
    top: -32px;
    right: 0;
  }
}
</style>
