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
        :monospace="true"
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
    instanceId: {
      type: [String, Number]
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
        let maxLengthOfType = 0;
        let maxLengthOfKey = 0;
        tbodyList.forEach((item) => {
          let typeLen = item.type.length;
          maxLengthOfType = Math.max(maxLengthOfType, typeLen);
          let keyLen = item.key.length;
          maxLengthOfKey = Math.max(maxLengthOfKey, keyLen);
        });
        tbodyList.forEach((item) => {
          if (value) {
            value += '\n';
          }
          let itemValue = '';
          if (item.value.includes('\n')) {
            itemValue = item.value.replaceAll('\n', '\\n');
          } else {
            itemValue = item.value;
          }
          let rowValue = item.type + ':';
          rowValue = rowValue.padEnd(maxLengthOfType + 2);
          rowValue += item.key.padEnd(maxLengthOfKey) + ' = ' + itemValue;
          value = value + rowValue;
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
            let type = typeAndKeyValueList[0].trim();
            typeAndKeyValueList.shift();
            let keyValue = typeAndKeyValueList.join(':').trim();
            let keyAndValueList = keyValue.split('=');
            let key = keyAndValueList[0].trim();
            keyAndValueList.shift();
            let value = keyAndValueList.join('=').trim();
            if (value.includes('\\n')) {
              value = value.replaceAll('\\n', '\n');
            }
            // let isEmpty = 1;
            // if (value && value.trim() != '') {
            //   isEmpty = 0;
            // }
            keyValueList.push({
              key: key,
              type: type === '' ? null : type,
              value: value,
              isEmpty: 0
            });
          }
        });
      }
      let params = {
        ...this.params,
        instanceId: this.instanceId,
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
