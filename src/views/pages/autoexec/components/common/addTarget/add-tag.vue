
<template>
  <div class="tag-main">
    <div class="bg-op top dividing-color radius-sm">
      <div>
        <Checkbox v-model="isChecked" :disabled="!canEdit"></Checkbox>
      </div>
      <div class="type-name">{{ $t('page.tag') }}</div>
      <div class="text-tip tips">{{ $t('term.autoexec.choosetagasnodetip') }}</div>
    </div>
    <div v-show="isChecked" class="bg-op content radius-sm">
      <TsForm
        ref="tagList"
        v-model="executeConfig"
        :labelWidth="52"
        :item-list="formConfig"
      ></TsForm>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  filters: {
  },
  props: {
    defaultValue: {
      type: Array,
      default: () => []
    },
    canEdit: {
      type: Boolean,
      default: true
    }
  },
  data() {
    let _this = this;
    return {
      formConfig: {
        tagList: {
          type: 'select',
          value: [],
          label: this.$t('page.tag'),
          url: '/api/rest/resourcecenter/tag/list/forselect',
          search: true,
          transfer: true,
          multiple: true,
          rootName: 'tbodyList',
          valueName: 'id',
          textName: 'name',
          width: '400px',
          placeholder: this.$t('form.placeholder.pleaseselect', {'target': this.$t('page.tag')}),
          disabled: !_this.canEdit
        }
      },
      executeConfig: {
        tagList: []
      },
      isChecked: false
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
    valid() {

    },
    save() {
      if (!this.isChecked) {
        this.executeConfig.tagList = [];
      }
      return this.executeConfig;
    }
  },
  computed: {},
  watch: {
    defaultValue: {
      handler(val) {
        if (val && val.length > 0) {
          this.isChecked = true;
          this.executeConfig.tagList = val;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.tag-main{
  margin-bottom: 16px;
  .top{
    display: flex;
    padding: 16px;
    line-height: 1;
    border: 1px solid;
    >div {
      align-self: center;
    }
    .type-name{
      min-width: 70px;
    }
  }
  .content{
    margin-top: 4px;
    padding: 16px 0;
  }
}
</style>
