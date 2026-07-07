
<template>
  <div class="data-init-wrap">
    <TsContain>
      <template v-slot:topRight>
        <div class="action-group">
          <span v-if="isShow == 'one'" class="tsfont-file-single action-item" @click="openDialog">{{ $t('term.cmdb.datainitdetail') }}</span>
          <span v-if="isShow == 'one'" class="tsfont-edit action-item" @click="handleShow('two')">{{ $t('page.edit') }}</span>
          <span v-if="isShow =='two'" class="tsfont-close-o action-item" @click="handleShow('one')">{{ $t('page.cancel') }}</span>
          <span v-if="isShow =='two'" class="tsfont-restart action-item" @click="saveConfig">{{ $t('term.cmdb.saveandreload') }}</span>
          <span v-if="isShow != 'one' && isShow !='two'" class="action-item">
            <Icon type="ios-loading" size="16" class="loading"></Icon>
            {{ $t('term.cmdb.reloading') }}
          </span>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <Loading :loadingShow="showLoading" type="fix"></Loading>
          <div v-if="!showLoading" class="radius-lg bg-op padding">
            <TsCodemirror
              ref="code"
              v-model="formSetting.config.value"
              codeMode="xml"
              :disabled="isShow == 'two' ? false : true"
            ></TsCodemirror>
            <TsForm ref="formSetting" :itemList="formSetting"></TsForm>
          </div>
        </div>
      </template>
    </TsContain>
    <TsDialog
      type="modal"
      v-bind="dialogConfig"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsTable v-bind="tableConfig"></TsTable>
        </div>
      </template>
    </TsDialog>
  </div>

</template>
<script>
export default {
  name: 'DataInit', // 数据初始化
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm.vue'),
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror.vue')
  },
  filters: {
  },
  props: {
  },
  data() {
    return {
      isShow: 'one',
      loadingShow: false, // 加载中的动画
      cancelBeforeConfig: '', // 取消之前config数据
      showLoading: false, // 初始化加载中的动画
      dialogConfig: {
        isShow: false,
        title: this.$t('term.cmdb.datainitdetail'),
        width: '60%',
        hasFooter: false
      },
      formSetting: {
        id: {
          label: this.$t('term.cmdb.primarykey'),
          type: 'text',
          isHidden: true
        },
        config: {
          label: this.$t('term.cmdb.xmlconfig'),
          type: 'textarea',
          isHidden: true,
          value: ''
        }
      },
      tableConfig: {
        height: '500px',
        theadList: [
          {
            title: this.$t('term.cmdb.viewname'),
            key: 'name'
          },
          {
            title: this.$t('term.cmdb.displayname'),
            key: 'label'
          },
          {
            title: this.$t('page.status'),
            key: 'statusText'
          },
          {
            title: this.$t('term.cmdb.inittime'),
            key: 'initTime',
            type: 'time'
          },
          {
            title: this.$t('term.cmdb.errorinfo'),
            key: 'error',
            width: '200px',
            maxLength: 200 // 超出隐藏出现省略号
          }
        ],
        tbodyList: []
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getTableList();
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
    closeDialog() {
      this.dialogConfig.isShow = false;
    },
    openDialog() {
      this.dialogConfig.isShow = true;
    },
    getTableList() {
      // 获取初始化详情列表
      this.showLoading = true;
      this.$api.cmdb.dataInit.getConfigList().then((res) => {
        if (res.Status == 'OK') {
          this.showLoading = false;
          this.setValue(res.Return);
        }
      });
    },
    saveConfig() {
      // 保存
      this.isShow = 'three';
      this.loadingShow = true;
      let form = this.$refs.formSetting.getFormValue();
      this.$api.cmdb.dataInit.saveConfig({...form}).then((res) => {
        if (res.Status == 'OK') {
          this.loadingShow = false;
          this.isShow = 'one'; // 显示编辑
          this.setValue(res.Return, false);
        }
      });
    },
    handleShow(isBool) {
      this.isShow = isBool;
      if (isBool == 'one') {
        // 取消之后，重新设置值
        this.$set(this.formSetting.config, 'value', this.cancelBeforeConfig);
      }
    },
    setValue(data, isBool = true) {
      // 设置值,isBool false表示编辑之后，后端没有返回config字段，那就使用首次的config字段
      this.tableConfig.tbodyList = data.resourceEntityList;
      this.$set(this.formSetting.id, 'value', data.id);
      if (isBool) {
        this.$set(this.formSetting.config, 'value', data.config);
        this.cancelBeforeConfig = this.$utils.deepClone(data.config); // 拷贝数据
      }
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less" scoped>
.loading {
  animation: ani-demo-spin 1s linear infinite;
}
</style>
