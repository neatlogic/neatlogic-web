<template>
  <div>
    <TsDialog :is-show="isShow" v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div slot="content" class="api">
          <Divider orientation="start">{{ $t('term.framework.requestadress') }}</Divider>
          <div>/api/rest/integration/run/{{ uuid }}</div>
          <Divider orientation="start">{{ $t('page.paramslist') }}</Divider>
          <Table
            size="small"
            row-key="key"
            :columns="helpTheadList"
            :data="integrationHelpData"
          >
            <template slot="mode" slot-scope="{ row }">
              <div v-if="row.mode == 'input'">{{ $t('page.inputparam') }}</div>
              <div v-if="row.mode == 'output'">{{ $t('page.outputparam') }}</div>
            </template>
            <template slot="isRequired" slot-scope="{ row }">
              <div v-if="row.isRequired == 1">{{ $t('page.yes') }}</div>
              <div v-if="row.isRequired == 0">{{ $t('page.no') }}</div>
            </template>
          </Table>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: { uuid: { type: String } },
  data() {
    return {
      isShow: false,
      integrationHelpData: [],
      helpTheadList: [
        { title: this.$t('page.name'), key: 'name', tree: true },
        { title: this.$t('term.framework.paramtype'), slot: 'mode' },
        { title: this.$t('term.report.datatype.name'), key: 'typeName' },
        { title: this.$t('page.require'), slot: 'isRequired' }
      ],
      dialogConfig: {
        type: 'modal',
        title: this.$t('page.help'),
        maskClose: true,
        isShow: false,
        width: 'medium'
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
    close: function() {
      this.isShow = false;
      this.$emit('close');
    },
    getHelp: function() {
      this.integrationHelpData = [];
      this.$api.framework.integration.getIntegrationParamListByUuid({ uuid: this.uuid }).then(res => {
        if (res.Status == 'OK') {
          this.integrationHelpData = res.Return;
          this.isShow = true;
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
    uuid: {
      handler: function(val) {
        if (val) {
          this.getHelp();
        }
      }
    }
  }
};
</script>
<style lang="less"></style>
