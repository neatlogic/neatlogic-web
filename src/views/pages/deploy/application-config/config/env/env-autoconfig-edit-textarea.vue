<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <TsFormInput 
        v-model="allTypeKeyVlaue"
        type="textarea"
        height="400px"
      >

      </TsFormInput>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    params: {
      type: Object,
      default: function() {
        return {};
      }
    },
    tableData: {
      type: Object,
      default: function() {
        return {
          hideAction: false,
          tbodyList: []
        }; //配置文件适配的变量
      }
    }
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        isShow: true,
        okText: this.$t('page.save'),
        width: 'medium',
        hight: '600px',
        title: this.isEdit ? this.$t('dialog.title.edittarget', {'target': this.$t('page.param')}) : this.$t('dialog.title.addtarget', {'target': this.$t('page.param')})
      },
      allTypeKeyVlaue: ''
    };
  },
  beforeCreate() {},
  created() {
    this.getTextareaValue();
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
    getTextareaValue() {
      let value = '';
      if (this.tableData && this.tableData.tbodyList.length > 0) {
        let tbodyList = this.$utils.deepClone(this.tableData.tbodyList);
        tbodyList.forEach((item) => {
          value = value + item.type + ':' + item.key + '=' + item.value + '\n';
        });
        this.allTypeKeyVlaue = value;
      }
    },
    okDialog() {
      let keyValueList = [];
      if (this.allTypeKeyVlaue && this.allTypeKeyVlaue.trim() != '') {
        let typeKeyValueList = this.allTypeKeyVlaue.split('\n');
        typeKeyValueList.forEach((typeKeyValue) => {
          if (typeKeyValue && typeKeyValue.trim() != '') {
            let typeAndKeyValueList = typeKeyValue.split(':');
            let type = typeAndKeyValueList[0];
            let keyValue = typeAndKeyValueList[1];
            let keyAndValueList = keyValue.split('=');
            let key = keyAndValueList[0];
            let value = keyAndValueList[1];
            let isEmpty = 1;
            if (value && value.trim() != '') {
              isEmpty = 0;
            }
            keyValueList.push({
              key: key,
              type: type === '' ? null : type,
              value: value,
              isEmpty: isEmpty
            });
          }
        });
      }
      let params = {
        ...this.params,
        keyValueList: keyValueList
      };
      this.$emit('save', params);
    },
    closeDialog(needRefresh = false) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.del-button {
  display: inline-block;
  height: 32px;
  line-height: 32px;
}
.variable-text {
  display: inline-block;
}
</style>
