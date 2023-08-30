<template>
  <div>
    <div class="bg-op radius-md padding list mb-sm">
      <div class="pr-nm pt-icon">
        {{ $t('term.dr.basicservices') }}
      </div>
      <template v-if="!$utils.isEmpty(ciList)">
        <div class="text-tip pr-sm pt-icon">{{ $t('term.dr.associationmodel') }}</div>
        <div class="ci-tag">
          <Tag v-for="(item, index) in ciList" :key="index">
            <span>{{ item }}</span>
          </Tag>
        </div>
      </template>
      <div class="edit tsfont-edit text-action" @click="edit()">{{ $t('page.edit') }}</div>
    </div>
    <div class="bg-op radius-md padding list">
      <div class="pr-nm pt-icon">
        {{ $t('term.dr.network') }}
      </div>
      <template v-if="!$utils.isEmpty(ciList)">
        <div class="text-tip pr-sm pt-icon">{{ $t('term.dr.associationmodel') }}</div>
        <div class="ci-tag">
          <Tag v-for="(item, index) in ciList" :key="index">
            <span>{{ item }}</span>
          </Tag>
        </div>
      </template>
      <div class="edit tsfont-edit text-action" @click="edit()">{{ $t('page.edit') }}</div>
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
              v-model="ciList"
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
  props: {},
  data() {
    return {
      assetList: [],
      showDialog: false,
      treeConfig: {
        url: 'api/rest/cmdb/ci/listtree',
        valueName: 'id',
        textName: 'label',
        border: 'border',
        multiple: true,
        transfer: true
      },
      ciList: []
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
    edit() {
      this.showDialog = true;
    },
    okDialog() {
      this.showDialog = false;
    },
    closeDialog() {
      this.showDialog = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.list {
  position: relative;
  display: flex;
  align-items: start;
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
