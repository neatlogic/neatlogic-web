<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-ok="confirm"
    @on-close="close"
  >
    <template v-slot>
      <div>
        <TsForm
          :labelWidth="50"
          :item-list="formConfig"
        >
          <template v-slot:status>
            <StatusRequiredAttrList
              :appId="appId"
              :projectId="projectId"
              :issueData="issueData"
            ></StatusRequiredAttrList>
          </template>
        </TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    StatusRequiredAttrList: resolve => require(['@/views/pages/rdm/project/viewtab/components/status-requiredattr-list.vue'], resolve)
  },
  props: {
    projectId: {type: Number},
    appId: {type: Number}
  },
  data() {
    return {
      formConfig: {
        status: {
          label: this.$t('page.status'),
          type: 'slot'
        },
        comment: {
          label: this.$t('page.reply'),
          type: 'ckeditor'
        }
      },
      dialogConfig: {
        title: this.$t('dialog.title.batchconfirm'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      issueData: {}
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
    close() {
      this.$emit('close');
    },
    confirm() {
      
    }
  },
  filter: {},
  computed: {},
  watch: {
    issueData: {
      handler: function(val) {
      },
      deep: true
    }
  }
};
</script>
<style lang="less">
</style>
