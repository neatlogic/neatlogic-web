<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
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
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button type="primary" @click="save()">确定</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror.vue'], resolve)
  },
  props: {
    id: { type: Number }
  },
  data() {
    const _this = this;
    return { 
      dialogConfig: { 
        title: '测试数据源',
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
          label: '名称',
          maxlength: 50,
          validateList: [{name: 'required'}],
          onChange: (name) => {
            this.reportDataSourceData.name = name;
          }
        },
        {
          type: 'radio',
          name: 'isActive',
          label: '激活',
          dataList: [{value: 1, text: '是'}, {value: 0, text: '否'}],
          validateList: [{name: 'required'}],
          onChange: (isActive) => {
            this.reportDataSourceData.isActive = isActive;
          }
        },
        {
          type: 'slot',
          name: 'xml',
          label: '配置内容'
        },
        {
          type: 'textarea',
          name: 'description',
          label: '备注',
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
            this.$Message.success(this.$t('message.content.savesuccess'));
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
