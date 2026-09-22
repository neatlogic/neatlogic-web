<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot:header>
      <span>{{ dialogConfig.title }}</span>
    </template>
    <template v-slot>
      <Loading :loadingShow="isLoading" type="fix"></Loading>
      <div v-if="loadFailed" class="text-error">{{ $t('term.cmdb.relfilterloadfailed') }}</div>
      <RelFilterCondition
        v-if="!isLoading && !loadFailed"
        :key="formKey"
        ref="condition"
        v-model="draft"
        :attrList="attrList"
        :globalAttrList="globalAttrList"
        :relList="relList"
        :downwardCiList="downwardCiList"
        :groupList="groupList"
      ></RelFilterCondition>
    </template>
    <template v-slot:footer>
      <Button :disabled="isLoading || loadFailed" @click="clear">{{ $t('page.clear') }}</Button>
      <Button @click="close">{{ $t('page.cancel') }}</Button>
      <Button type="primary" :disabled="isLoading || loadFailed" @click="confirm">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: 'RelFilterEdit',
  components: {
    RelFilterCondition: () => import('./rel-filter-condition.vue')
  },
  props: {
    ciId: { type: Number, required: true },
    ciLabel: { type: String, default: '' },
    value: { type: Object, default: null }
  },
  data() {
    return {
      // 独立草稿保证关闭或取消弹窗时不会修改关系表单。
      draft: this.$utils.deepClone(this.value || {}),
      formKey: 0,
      isLoading: true,
      loadFailed: false,
      attrList: [],
      globalAttrList: [],
      relList: [],
      downwardCiList: [],
      groupList: [],
      dialogConfig: {
        title: this.$t('page.filtercondition') + ' · ' + this.ciLabel,
        type: 'modal',
        isShow: true,
        maskClose: false,
        width: 'large',
        zindex: 1001
      }
    };
  },
  created() {
    this.loadMetadata();
  },
  methods: {
    // 使用高级搜索相同的模型元数据，任一请求失败时阻止提交不完整配置。
    async loadMetadata() {
      try {
        const [attrs, globals, rels, children, groups] = await Promise.all([
          this.$api.cmdb.ci.getAttrByCiId(this.ciId, { needAlias: 1 }),
          this.$api.cmdb.ci.getGlobalAttrByCiId(this.ciId, { isActive: 1, needAlias: 1 }),
          this.$api.cmdb.ci.getRelByCiId(this.ciId, { needAlias: 1 }),
          this.$api.cmdb.ci.getDownwardCiList(this.ciId),
          this.$api.cmdb.group.getCurrentUserActiveGroupByCiId(this.ciId)
        ]);
        this.attrList = (attrs.Return || []).filter(attr => attr.canSearch && attr.isSearchAble);
        this.globalAttrList = globals.Return || [];
        this.relList = rels.Return || [];
        this.downwardCiList = (children.Return || []).filter(ci => ci.id !== this.ciId);
        this.groupList = groups.Return || [];
      } catch (e) {
        this.loadFailed = true;
      } finally {
        this.isLoading = false;
      }
    },
    // 清空仅作用于本次草稿，仍需点击确认才回传。
    clear() {
      this.draft = {};
      this.formKey += 1;
    },
    // 校验和序列化由条件组件负责，父页面统一保存关系。
    confirm() {
      if (this.isLoading || this.loadFailed || !this.$refs.condition || !this.$refs.condition.valid()) {
        return;
      }
      this.$emit('confirm', this.$utils.deepClone(this.$refs.condition.getFilter()));
      this.close();
    },
    // 关闭不回传任何草稿。
    close() {
      this.$emit('close');
    }
  }
};
</script>
