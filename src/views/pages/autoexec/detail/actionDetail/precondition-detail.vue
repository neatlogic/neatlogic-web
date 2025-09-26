<template>
  <div>
    <div class="flex-start">
      <Filters
        v-if="!$utils.isEmpty(preCondition)"
        ref="filterMain"
        :defaultValue="preCondition"
        :readonly="true"
        :bgOp="false"
        class="nopadding overflow"
      ></Filters>
      <Button
        v-if="canEdit && $utils.isEmpty(preCondition)"
        type="primary"
        ghost
        @click="addData()"
      ><span class="tsfont-plus text-href">{{ $t('page.condition') }}</span>
      </Button>
      <div class="pl-xs" style="flex: none;">
        <span v-if="!canEdit && !$utils.isEmpty(preCondition)" class="text-tip-active pl-xs" @click="editData()">{{ $t('page.viewdetails') }}</span>
        <span
          v-if="canEdit && !$utils.isEmpty(preCondition)"
          class="tsfont-edit-s text-tip-active pl-xs"
          :title="$t('page.edit')"
          @click="editData()"
        ></span>
        <span v-if="canEdit && !$utils.isEmpty(preCondition)" class="text-href pl-xs" @click="clearData()">{{ $t('page.clear') }}</span>
      </div>
    </div>
    <TsDialog
      v-if="isShow"
      type="slider"
      :isShow="true"
      width="medium"
      :title="$t('page.detail')"
      :hasFooter="canEdit"
      :maskClose="!canEdit"
      @on-close="isShow = false"
      @on-ok="onOk()"
    >
      <Filters
        ref="filterMain"
        :defaultValue="preCondition"
        :bgOp="false"
        class="nopadding overflow"
        @change="changeValue"
      ></Filters>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    Filters: () => import('@/views/pages/autoexec/components/common/executionMode/filters.vue')
  },
  props: {
    canEdit: {
      type: Boolean,
      default: false
    },
    defaultValue: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loadingShow: false,
      isShow: false,
      preCondition: null,
      currentPreCondition: null
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
    changeValue(val) {
      this.currentPreCondition = val;
    },
    addData() {
      this.isShow = true;
      this.currentPreCondition = null;
    },
    editData() {
      this.isShow = true;
      this.currentPreCondition = this.$utils.deepClone(this.preCondition);
    },
    onOk() {
      this.$emit('changeValue', this.currentPreCondition);
      this.isShow = false;
    },
    clearData() {
      this.preCondition = null;
      this.$emit('changeValue', null);
    }
  },
  filter: {},
  computed: {},
  watch: {
    defaultValue: {
      handler(val) {
        if (!this.$utils.isSame(val, this.preCondition)) {
          this.preCondition = this.$utils.deepClone(val);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.nopadding {
  padding: 0 !important;
}
</style>
