<template>
  <div>
    <div class="filter-top">
      <span class="pr-sm label">{{ $t('term.dashboard.datafilter') }}</span>
      <TsFormSwitch
        v-model="isActive"
        :disabled="disabled"
        @on-change="changeActive"
      ></TsFormSwitch>
    </div>
    <div v-if="isActive" class="pb-sm">
      <TsRow v-for="(f,findex) in filterList" :key="findex" :gutter="8">
        <Col span="10">
          <TsFormSelect
            ref="formValid"
            v-model="f.column"
            :dataList="dataList"
            :validateList="validateList"
            :firstSelect="false"
            transfer
            :disabled="disabled"
            @change="setConfig()"
          ></TsFormSelect>
        </Col>
        <Col span="7">
          <TsFormSelect
            ref="formValid"
            v-model="f.expression"
            :dataList="expressionList"
            :validateList="validateList"
            :firstSelect="false"
            transfer
            :disabled="disabled"
            @change="setConfig()"
          ></TsFormSelect>
        </Col>
        <Col span="7">
          <TsFormInput
            ref="formValid"
            v-model="f.value"
            :validateList="validateList"
            :disabled="disabled"
            @change="setConfig()"
          ></TsFormInput>
        </Col>
      </TsRow>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    dataList: { //属性列表
      type: Array,
      default: () => []
    },
    defaultFilterList: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isActive: 0,
      filterList: [],
      validateList: ['required'],
      expressionList: [
        {
          value: 'like',
          text: this.$t('term.expression.like')
        },
        {
          value: 'notlike',
          text: this.$t('term.expression.notlike')
        },
        {
          value: 'equal',
          text: this.$t('term.expression.eq')
        },
        {
          value: 'unequal',
          text: this.$t('term.expression.ne')
        }
      ]
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
    changeActive(val) {
      if (val) {
        this.filterList = [
          {
            'column': '',
            'expression': 'like',
            'value': ''
          }
        ];
      } else {
        this.filterList = [];
      }
      this.$emit('setConfig', this.filterList);
    },
    setConfig() {
      this.$emit('setConfig', this.filterList);
    },
    valid() {
      const attrHandlers = this.$refs['formValid'];
      let isValid = true;
      if (attrHandlers) {
        attrHandlers.forEach(element => {
          if (element.valid) {
            if (!element.valid()) {
              isValid = false;
            }
          }
        });
      }
      return isValid;
    }
  },
  filter: {},
  computed: {},
  watch: {
    defaultFilterList: {
      handler(val) {
        this.filterList = [];
        this.isActive = 0;
        if (!this.$utils.isEmpty(val) && !this.$utils.isSame(val, this.filterList)) {
          this.filterList = this.$utils.deepClone(val);
          if (this.filterList.length > 0) {
            this.isActive = 1;
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.filter-top {
  display: flex;
  .label {
    flex: none;
  }
}
</style>
