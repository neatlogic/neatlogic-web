<template>
  <div>
    <TsDialog
      :title="$t('page.classifytarget',{'target':$t('page.add')})"
      type="modal"
      :isShow.sync="showDialog"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm
            ref="formConfig"
            v-model="fileData"
            :item-list="formConfig"
          ></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    classifiedList: Array, //目录分类列表
    fileConfig: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      showDialog: false,
      formConfig: {
        configList: {
          type: 'tree',
          name: 'configList',
          label: this.$t('page.classifytarget', {'target': this.$t('page.target')}),
          dataList: this.classifiedList,
          textName: 'name',
          valueName: 'configFath',
          multiple: true,
          search: true,
          transfer: true
        }
      },
      fileData: {
        configList: []
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
    closeDialog() {
      this.$emit('close');
    },
    okDialog() {
      let data = {
        filePath: this.fileConfig.filePath
      };
      let configList = [];
      if (this.fileData.configList.length) {
        this.fileData.configList.forEach(item => {
          let arr = item.split('/');
          configList.push({
            moduleGroup: arr[0],
            menu: arr[1] || ''
          });
        });
      }
      this.$set(data, 'configList', configList);
      this.$api.documentonline.saveDocumentonlineConfig(data).then(res => {
        if (res.Status === 'OK') {
          this.$t('message.savesuccess');
          this.$router.push({
            path: '/directory-manage',
            query: {
              type: new Date()
            }
          });
        }
      });
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {
    fileConfig: {
      handler(val) {
        let configList = [];
        if (val) {
          let config = this.$utils.deepClone(val);
          if (config.configList && config.configList.length) {
            config.configList.forEach(item => {
              let value = item.moduleGroup;
              if (item.menu) {
                value += '/' + item.menu;
              }
              configList.push(value);
            });
            this.$set(this.fileData, 'configList', configList);
          }
        }
      },
      deep: true,
      immediate: true
    },
    isShow: {
      handler(val) {
        if (val) {
          this.showDialog = val;
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
