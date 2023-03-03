<template>
  <div>
    <TsDialog :is-show="isShow" v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div slot="content" class="api">
          <Divider orientation="start">请求地址</Divider>
          <div>/api/rest/integration/run/{{ uuid }}</div>
          <Divider orientation="start">参数列表</Divider>
          <Table
            size="small"
            row-key="key"
            :columns="helpTheadList"
            :data="integrationHelpData"
          >
            <template slot="mode" slot-scope="{ row }">
              <div v-if="row.mode == 'input'">输入参数</div>
              <div v-if="row.mode == 'output'">输出参数</div>
            </template>
            <template slot="isRequired" slot-scope="{ row }">
              <div v-if="row.isRequired == 1">是</div>
              <div v-if="row.isRequired == 0">否</div>
            </template>
          </Table>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
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
        { title: '名称', key: 'name', tree: true },
        { title: '参数类型', slot: 'mode' },
        { title: '数据类型', key: 'typeName' },
        { title: '必填', slot: 'isRequired' }
      ],
      dialogConfig: {
        type: 'modal',
        title: '帮助',
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
