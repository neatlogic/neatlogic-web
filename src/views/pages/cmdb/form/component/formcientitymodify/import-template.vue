<template>
  <TsDialog v-bind="dialogConfig" @on-close="close()">
    <template v-slot>
      <div>
        <TsTable
          class="table"
          :fixedHeader="false"
          :theadList="theadList"
          :tbodyList="tbodyList"
          multiple
          @getSelected="getSelected"
        >
          <template v-slot:isRequired="{ row }">
            <span v-if="row.isRequired" class="text-success">{{ $t('page.yes') }}</span>
            <span v-else class="text-grey">{{ $t('page.no') }}</span>
          </template>
        </TsTable>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button
        v-download="downloadUrl"
        v-download:prevent="preventDownload"
        :disabled="preventDownload"
        type="primary"
      >{{ $t('term.process.downloadtemp') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
import download from '@/resources/directives/download.js';

export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  directives: { download },
  props: {
    ciId: { type: Number },
    formConfigList: { type: Array }
  },
  data() {
    return {
      dialogConfig: {
        title: '导出下载模板',
        width: 'medium',
        type: 'modal',
        isShow: true
      },
      theadList: [
        { title: '', key: 'selection' },
        { title: this.$t('page.uniquekey'), key: 'name' },
        { title: this.$t('term.cmdb.fieldname'), key: 'label' },
        { title: this.$t('page.type'), key: 'typeText' },
        { title: this.$t('page.require'), key: 'isRequired' }
      ],
      tbodyList: [],
      downloadParams: {
        ciId: null,
        attrIdList: null,
        relIdList: null
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getTemplate();
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
    async getTemplate() {
      this.isLoading = true;
      const res = await this.$api.cmdb.batchImport.getImportFieldList(this.ciId);
      this.isLoading = false;
      const { attrList, relList, globalAttrList } = res.Return;
      const glbalTbodyList = globalAttrList.map(attr => {
        const { id, name, label } = attr;
        return { id, name, label, typeText: this.$t('term.cmdb.globalattr'), isRequired: 0, rowType: 'global' };
      });
      const attrTbodyList = attrList.map(attr => {
        const { id, name, label, type, typeText, isRequired } = attr;
        return { id, name, label, type, typeText, isRequired, rowType: 'attr' };
      });
      const relTbodyList = relList.map(rel => {
        if (rel.direction === 'from') {
          const { id, toName: name, toLabel: label, toRule: rule, toIsRequired: isRequired } = rel;
          return { id, name, label, typeText: this.$t('page.relation'), isRequired, rowType: 'rel' };
        } else if (rel.direction === 'to') {
          const { id, fromName: name, fromLabel: label, fromRule: rule, fromIsRequired: isRequired } = rel;
          return { id, name, label, typeText: this.$t('page.relation'), isRequired, rowType: 'rel' };
        }
      });
      this.tbodyList = [...glbalTbodyList, ...attrTbodyList, ...relTbodyList];
      let selectedList = [];
      if (this.formConfigList && this.formConfigList.length > 0 && this.tbodyList && this.tbodyList.length > 0) {
        this.formConfigList.forEach(formitem => {
          const item = this.tbodyList.find(tbodyitem => formitem.key === tbodyitem.rowType + '_' + tbodyitem.id);
          if (item) {
            selectedList.push(item);
            this.$set(item, '_selected', true);
          }
        });
        if (!this.$utils.isEmpty(selectedList)) {
          this.getSelected([], selectedList);
        }
      }
    },
    close() {
      this.$emit('close');
    },
    getSelected(indexList, selectedList) {
      this.downloadParams.ciId = this.ciId;
      this.downloadParams.attrIdList = selectedList.filter(item => item.rowType === 'attr').map(item => item.id);
      this.downloadParams.relIdList = selectedList.filter(item => item.rowType === 'rel').map(item => item.id);
      this.downloadParams.globalAttrIdList = selectedList.filter(item => item.rowType === 'global').map(item => item.id);
    }
  },
  filter: {},
  computed: {
   
    downloadUrl() {
      return {
        url: 'api/binary/cmdb/import/template/get',
        params: this.downloadParams
      };
    },
    preventDownload() {
      const { ciId, attrIdList, relIdList } = this.downloadParams;
      if (!ciId) return true;
      const hasAttr = attrIdList && attrIdList.length > 0;
      const hasRel = relIdList && relIdList.length > 0;
      if (!hasAttr && !hasRel) return true;
      return false;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
