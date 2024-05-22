<template>
  <div>
    <!-- start_必填 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        必填
        <i-switch v-model="setting.isRequired" class="label-right" />
      </label>
    </div>
    <!-- end_必填 -->
    <dataSource
      ref="dataSource"
      :setting="setting"
      :level="setting.levelType"
      :uuid="uuid"
      @changeDefaultValue="setDefaultJson"
    ></dataSource>

    <!-- 默认值 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">默认值</label>
      <div class="formsetting-text">
        <TsFormTree
          ref="select"
          v-model="setting.value"
          v-bind="defaultSelfJson"
        ></TsFormTree>
      </div>
    </div>
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">输入提示</label>
      <div class="formsetting-text">
        <TsFormInput v-model="setting.placeholder"></TsFormInput>
      </div>
    </div>
  </div>

</template>

<script>
import dataSource from './dataSource/dataTree.vue';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: 'FormtreeSelect',
  components: { dataSource, TsFormInput,
    TsFormTree: () => import('@/resources/plugins/TsForm/TsFormTree') },
  props: {
    uuid: String,
    setting: Object,
    controllerList: Array
  },
  data() {
    return {
      defaultSelfJson: {
        params: {isActive: 1},
        url: '',
        valueName: 'uuid',
        textName: 'name',
        childrenKey: 'children',
        clearable: true,
        showPath: true,
        sperateText: '>'
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
    },
    setDefaultJson() {
      if (this.setting.config) {
        Object.assign(this.defaultSelfJson, this.setting.config);
      } else {
        this.defaultSelfJson.url = '';
      }
    }
  },
  filter: {},
  computed: {
  },
  watch: {
  }
};
</script>

