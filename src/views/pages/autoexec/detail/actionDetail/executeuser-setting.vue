<template>
  <div>
    <TsRow v-if="!readonly" :gutter="8">
      <Col span="8">
        <TsFormSelect
          v-model="executeUser.mappingMode"
          :dataList="mappingModeList"
          :disabled="disabled"
          :clearable="false"
          transfer
          @change="changeMappingMode"
        ></TsFormSelect>
      </Col>
      <Col span="16">
        <TsFormSelect
          v-if="executeUser.mappingMode==='runtimeparam'"
          ref="userValue"
          v-model="executeUser.value"
          :dataList="paramsList"
          :disabled="disabled"
          :validateList="isRequired? validateList : []"
          transfer
          :firstText="$t('term.autoexec.jobparam')"
          :firstSelect="false"
          :firstLi="isEditRuntimeParam"
          @first="gotoAddParameter"
        ></TsFormSelect>
        <TsFormInput
          v-else
          ref="userValue"
          v-model="executeUser.value"
          :disabled="disabled"
          :validateList="isRequired? validateList : []"
        ></TsFormInput>
      </Col>
    </TsRow>
    <div v-else>
      <template v-if="executeUser.value">
        <span class="text-tip pr-nm">{{ mappingModeLabel[executeUser.mappingMode] }}</span>
        <span v-if="executeUser.mappingMode === 'runtimeparam'">{{ getParamLabel(executeUser.value) }}</span>
        <span v-else>{{ executeUser.value }}</span>
      </template>
      <template v-else>-</template>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  inject: {
    openParamsSetting: {
      default: () => {}
    }
  },
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    readonly: Boolean,
    disabled: Boolean,
    config: {
      type: Object,
      default: () => {}
    },
    runtimeParamList: Array,
    isRequired: {
      type: Boolean,
      default: false
    },
    isEditRuntimeParam: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      executeUser: {
        mappingMode: 'constant',
        value: ''
      },
      mappingModeList: [
        {
          text: this.$t('page.constant'),
          value: 'constant'
        },
        {
          text: this.$t('term.autoexec.jobparam'),
          value: 'runtimeparam'
        }
      ],
      mappingModeLabel: {
        constant: this.$t('page.constant'),
        runtimeparam: this.$t('term.autoexec.jobparam')
      },
      typeList: ['text'],
      validateList: ['required']
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
    init() {
      if (!this.$utils.isEmpty(this.config)) {
        Object.keys(this.executeUser).forEach(key => {
          if (this.config.hasOwnProperty(key)) {
            this.executeUser[key] = this.config[key];
          }
        });
      }
    },
    gotoAddParameter() { //添加作业参数
      this.openParamsSetting();
    },
    save() {
      if (this.executeUser.value) {
        return this.executeUser;
      } else {
        return {};
      }
    },
    valid() {
      let isValid = true;
      if (this.$refs.userValue) {
        isValid = this.$refs.userValue.valid();
      }
      return isValid;
    },
    getParamLabel(value) {
      let label = '';
      if (this.runtimeParamList && this.runtimeParamList.length > 0) {
        let findItem = this.runtimeParamList.find(i => i.key === value);
        if (findItem) {
          label = findItem.name;
        }
      }
      return label;
    },
    changeMappingMode() {
      this.$set(this.executeUser, 'value', '');
    }
  },
  filter: {},
  computed: {
    paramsList() {
      if (this.runtimeParamList && this.runtimeParamList.length > 0) {
        return this.runtimeParamList.filter(item => {
          return this.typeList.includes(item.type);
        }).map(v => {
          return {
            text: v.name,
            value: v.key
          };
        });
      }
      return [];
    }
  },
  watch: {
    executeUser: {
      handler(val) {
        this.$emit('change', val);
      },
      deep: true,
      immediate: true
    },
    config: {
      handler(val) {
        this.init();
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
