<template>
  <TsDialog v-bind="dialogConfig" :loading="isSaveLoading" @on-close="close">
    <template v-slot>
      <div v-if="isReady">
        <div v-if="$utils.isEmpty(tbodyList)">
          <span>{{ $t('term.cmdb.resourcetypetreenosettingdesc') }}</span>
          <br>
          <a class="text-href" href="javascript:void(0);" @click.stop="gotoResourceentityManagePage()">{{ $t('term.cmdb.gotoresourceentitymanagepage') }}</a>
        </div>
        <TsFormItem :label="$t('term.cmdb.ci')" required>
          <TsFormTree
            ref="formTree"
            v-model="formData.rootCiName"
            v-bind="treeConfig"
          ></TsFormTree>
        </TsFormItem>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormTree: () => import('@/resources/plugins/TsForm/TsFormTree'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem')
  },
  props: {
    ciId: {
      type: Number
    }
  },
  data() {
    return {
      isReady: false,
      isSaveLoading: false,
      id: null,
      config: {},
      formData: {},
      dialogConfig: {
        title: this.$t('page.setting'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      treeConfig: {
        name: 'rootCiName',
        type: 'tree',
        placeholder: this.$t('term.cmdb.selectrootmodel'),
        width: '100%',
        validateList: ['required'],
        value: '',
        dataList: [],
        valueName: 'name',
        textName: 'label',
        transfer: true,
        showPath: true,
        search: true,
        border: 'border'
      }
    };
  },
  beforCreate() {
  },
  created() {},
  beforeMount() {},
  async mounted() {
    await this.getResourcetypeTree();
    if (!this.$utils.isEmpty(this.tbodyList)) {
      this.getResourceEntity();
    } else {
      this.isReady = true;
    }
  },
  beforedUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getResourcetypeTree() {
      return this.$api.cmdb.resourceentity.getResourcetypeTree().then(res => {
        if (res.Status == 'OK') {
          this.tbodyList = res.Return.tbodyList || [];
          this.treeConfig.dataList = this.tbodyList;
        }
      });
    },
    getResourceEntity() {
      this.$api.cmdb.resourceentity.getAssetlist().then(res => {
        if (res.Status == 'OK' && res.Return) {
          this.id = res.Return.id;
          // 根模型和表头显示配置共用同一条记录，编辑根模型时需要保留已有表头配置
          this.config = res.Return.config || {};
          this.$set(this.formData, 'rootCiName', res.Return.rootCiName || '');
        }
      }).finally(() => {
        this.$nextTick(() => {
          this.isReady = true;
        });
      });
    },
    close(action) {
      this.$emit('close', action);
    },
    save() {
      const formItems = this.$refs;
      let isValid = true;
      Object.keys(formItems).forEach(key => {
        if (formItems[key].valid && !formItems[key].valid()) {
          isValid = false;
        }
      });
      if (!isValid) {
        return false;
      }
      this.isSaveLoading = true;
      let data = {
        id: this.id,
        rootCiName: this.formData.rootCiName,
        // 只更新根模型，不清空资产清单表头显隐/排序配置
        config: this.config || {}
      };
      this.$api.cmdb.resourceentity.saveAssetlistData(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close('refresh');
        }
      }).finally(() => {
        this.isSaveLoading = false;
      });
    },
    gotoResourceentityManagePage() {
      window.open(HOME + '/cmdb.html#/resourceentity-manage');
    }
  },
  computed: {},
  watch: {}
};
</script>
