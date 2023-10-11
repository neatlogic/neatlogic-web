<template>
  <div>
    <div v-for="(item, index) in assetList" :key="index" class="bg-op radius-md padding list mb-sm">
      <div class="pr-nm pt-icon">
        {{ item.label }}
      </div>
      <template v-if="!$utils.isEmpty(item.ciList)">
        <div class="text-tip pr-sm pt-icon">{{ $t('term.dr.associationmodel') }}</div>
        <div class="ci-tag">
          <Tag v-for="(c, cindex) in item.ciList" :key="cindex">
            <span>{{ c.label }}</span>
          </Tag>
        </div>
      </template>
      <div class="edit tsfont-edit text-action" @click="edit(item)">{{ $t('page.edit') }}</div>
    </div>
    <TsDialog
      :title="$t('dialog.title.edittarget',{'target':$t('term.dr.assetconfig')})"
      type="slider"
      :isShow.sync="showDialog"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsFormItem :label="$t('term.cmdb.citype')" labelPosition="top">
            <TsFormTree
              v-model="formData.ciIdList"
              v-bind="treeConfig"
            ></TsFormTree>
          </TsFormItem>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormTree: resolve => require(['@/resources/plugins/TsForm/TsFormTree'], resolve)
  },
  props: {
    drCiList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      assetList: [],
      showDialog: false,
      treeConfig: {
        url: '/api/rest/resourcecenter/resourcetype/tree',
        valueName: 'id',
        textName: 'label',
        border: 'border',
        multiple: true,
        transfer: true
      },
      formData: {}
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
    getCiList() {
      this.$api.dr.ci.getCiList().then(res => {
        if (res && res.Status == 'OK') {
          this.assetList = res.Return || [];
        }
      });
    },
    saveCi(item) {
      let data = {
        name: item.name,
        ciIdList: item.ciIdList
      };
      this.$api.dr.ci.saveCi(data).then(res => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.getCiList();
        }
      });
    },
    edit(item) {
      this.$set(this.formData, 'name', item.name);
      this.$set(this.formData, 'ciIdList', []);
      if (!this.$utils.isEmpty(item.ciList)) {
        let ciIdList = [];
        item.ciList.forEach(c => {
          ciIdList.push(c.id);
        });
        this.$set(this.formData, 'ciIdList', ciIdList);
      }
      this.showDialog = true;
    },
    okDialog() {
      this.saveCi(this.formData);
      this.closeDialog();
    },
    closeDialog() {
      this.formData = {};
      this.showDialog = false;
    }
  },
  filter: {},
  computed: {},
  watch: {
    drCiList: {
      handler(val) {
        this.assetList = val;
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.list {
  position: relative;
  display: flex;
  align-items: flex-start;
  .ci-tag {
    flex: 1;
  }
  &:hover {
    .edit {
      display: block;
    }
  }
  .edit {
    display: none;
    position: absolute;
    right: 16px;
    top: 16px;
  }
}
</style>
