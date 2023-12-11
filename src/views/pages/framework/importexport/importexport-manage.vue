<template>
  <div>
    <Loading v-if="isLoading" :loading-show="isLoading" type="fix"></Loading>
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">
          <div class="action-item tsfont-upload" @click="importCi()">{{ $t('term.cmdb.importci') }}</div>
          <div class="action-item tsfont-export" @click="exportPipeline()">{{ $t('term.cmdb.exportci') }}</div>
        </div>
      </template>
      <template v-slot:content>
        <div class="content">
          <TsForm ref="form" :itemList="formConfig" labelPosition="right"></TsForm>
        </div>
      </template>
    </TsContain>
    <ComplexUploadDialog  
      v-if="isImportCiShow"  
      :targetType="targetType"  
      url="/api/binary/common/import"  
      @close="() => isImportCiShow = false"  
    ></ComplexUploadDialog> 
  </div>
</template>
<script>
import download from '@/resources/mixins/download.js';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    ComplexUploadDialog: resolve => require(['@/resources/components/ComplexUploadDialog/complexUploadDialog.vue'], resolve)
  },
  mixins: [download],
  props: {},
  data() {
    return {
      isLoading: false,
      isImportCiShow: false,
      primaryKey: null,
      targetType: 'aa',
      formConfig: {
        targetType: {
          type: 'text',
          name: 'targetType',
          value: '',
          width: 400,
          label: '类型',
          validateList: [],
          disabled: false
        },
        primaryKey: {
          type: 'text',
          name: 'primaryKey',
          value: '',
          width: 400,
          label: '主键值',
          validateList: [],
          disabled: false
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    importCi() {
      console.log('importCi');
      if (this.$refs.form) {
        console.log('aaaa');
        let formData = this.$refs.form.getFormValue();
        if (formData) {
          console.log('bbb');
          if (formData.primaryKey) {
            console.log('ccc');
            this.primaryKey = formData.primaryKey;
          }
          if (formData.targetType) {
            console.log('ddd');
            this.targetType = formData.targetType;
          }
        }
      }
      console.log(this.targetType, 'this.targetType');
      this.isImportCiShow = true;
    },
    exportPipeline() {
      let primaryKey = '';
      let targetType = '';
      if (this.$refs.form) {
        let formData = this.$refs.form.getFormValue();
        if (formData) {
          if (formData.primaryKey) {
            this.primaryKey = formData.primaryKey;
          }
          if (formData.targetType) {
            this.targetType = formData.targetType;
          }
        }
      }
      // 导出流水线配置
      this.download({url: '/api/binary/common/export', params: { primaryKey: primaryKey, type: targetType}});
    }
  },
  filter: {},
  computed: {
    
  },
  watch: {

  }
};
</script>
