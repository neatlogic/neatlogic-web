<template>
  <div>
    <!-- start_必填 -->
    <!-- {{ setting }} -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        必填
        <i-switch v-model="setting.isRequired" class="label-right" />
      </label>
    </div>
    <!-- end_必填 -->

    <div class="formsetting-block">
      <label class="formsetting-label text-grey">输入提示</label>
      <div class="formsetting-text bg-block">
        <div class="formsetting-block">
          <label class="formsetting-label text-grey inner-label">输入提示</label>
          <div class="formsetting-text">
            <TsFormInput v-model="setting.placeholder"></TsFormInput>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: 'Formaccounts',
  components: { TsFormInput },
  props: {
    uuid: String,
    setting: Object,
    controllerList: Array
  },
  data() {
    return {

    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {

  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    renderContent(h, { root, node, data }) {
      //渲染树的lable名称
      return h('span', {
        staticClass: '',
        ciList: {
          innerHTML: data.name
        }
      });
    },
    getLevelDataList(level) {
      let _this = this;
      if (!_this.setting.matrixUuid) {
        return;
      }
    },
    validComponent() {
      let validList = [];
      if (this.$refs.dataSource && this.$refs.dataSource.validComponent) {
        validList = this.$refs.dataSource.validComponent();
      }
      return validList;
    }
  },
  filter: {},
  computed: {
  },
  watch: {
  }
};
</script>

<style lang="less" scoped>
  .inner-label{
        opacity: 0.6;
  }
</style>
