<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div>
          <TsForm :itemList="formConfig"></TsForm>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="exportCi()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import download from '@/resources/mixins/download.js';
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  mixins: [download],
  props: {},
  data() {
    const _this = this;
    return {
      dialogConfig: {
        title: this.$t('term.cmdb.exportci'),
        type: 'modal',
        isShow: true,
        maskClose: false,
        width: 'medium'
      },
      idList: [],
      formConfig: [
        {
          name: '',
          type: 'tree',
          label: this.$t('page.model'),
          width: '100%',
          url: 'api/rest/cmdb/ci/listtree',
          params: {},
          valueName: 'id',
          textName: 'label',
          transfer: true,
          showPath: true,
          multiple: true,
          onChange: (idList) => {
            _this.idList = idList;
          }
        }
      ]
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
    close() {
      this.$emit('close');
    },
    exportCi() {
      this.download({url: '/api/binary/cmdb/ci/export/forexcel', params: {idList: this.idList}});
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
