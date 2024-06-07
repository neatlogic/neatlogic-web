<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close" @on-ok="save">
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig">
          <template v-slot:xml>
            <TsCodemirror
              ref="title"
              v-model="reportDataSourceData.xml"
              codeMode="xml"
            ></TsCodemirror>
          </template>
        </TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror.vue')
  },
  props: {
    id: { type: Number }
  },
  data() {
    const _this = this;
    return {
      dialogConfig: {
        title: this.$t('page.test'),
        type: 'slide',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      reportDataSourceData: {},
      formConfig: [
        {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: [{name: 'required'}],
          onChange: (name) => {
            this.reportDataSourceData.name = name;
          }
        },
        {
          type: 'radio',
          name: 'isActive',
          label: this.$t('page.enable'),
          dataList: [{value: 1, text: this.$t('page.yes')}, {value: 0, text: this.$t('page.no')}],
          validateList: [{name: 'required'}],
          onChange: (isActive) => {
            this.reportDataSourceData.isActive = isActive;
          }
        },
        {
          type: 'slot',
          name: 'xml',
          label: this.$t('term.framework.xmlconfig')
        },
        {
          type: 'textarea',
          name: 'description',
          label: this.$t('page.memo'),
          maxlength: 500,
          onChange: (val) => {
            this.reportDataSourceData.description = val;
          }
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() { this.getDatasourceById(); },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setFile: function(fileList) {
      this.reportDataSourceData.fileId = null;
      fileList.forEach(file => {
        this.reportDataSourceData.fileId = file.id;
      });
    },
    getDatasourceById() {
      if (this.id) {
        this.$api.framework.datawarehouse.getDatasourceById(this.id).then(res => {
          this.reportDataSourceData = res.Return;
          this.formConfig.forEach(element => {
            this.$set(element, 'value', this.reportDataSourceData[element.name]);
          });
        });
      } else {
        this.reportDataSourceData = {};
        this.formConfig.forEach(element => {
          this.$set(element, 'value', this.reportDataSourceData[element.name]);
        });
      }
    },
    save() {
      const form = this.$refs['form'];
      if (form.valid()) {
        this.$api.framework.datawarehouse.saveDataSource(this.reportDataSourceData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less">
</style>
