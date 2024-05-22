<template>
  <div>
    <div class="pb-sm">
      <span :class="{'require-label':config.isRequired}">{{ config.name }}</span>
      <template v-if="config.description">
        <span>
          <Tooltip
            placement="top"
            theme="light"
            transfer
            max-width="500"
            :content="config.description"
          >
            <i class="tsfont-info-o text-tip fz10"></i>
          </Tooltip>
        </span>
      </template>
    </div>
    <div
      v-for="(item, index) in argumentMappingList"
      :key="index"
      class="item-box"
      :class="!config.argumentCount && (!config.isRequired || (config.isRequired && argumentMappingList.length > 1))?'pr-lg':''"
    >
      <div>
        <TsFormItem
          :label="$t('page.constant')"
          class="param-item"
          :labelWidth="100"
          labelPosition="left"
        >
          <TsFormInput
            ref="item"
            v-model="item.value"
            :validateList="validateList"
            border="border"
            @on-change="val=>{changeValue(val,index)}"
          ></TsFormInput>
        </TsFormItem>
      </div>
      <template v-if="!config.argumentCount">
        <div v-if="!config.isRequired || (config.isRequired && argumentMappingList.length > 1)" class="delete-btn tsfont-trash-o text-tip-active" @click="delParam(index)"></div>
      </template>
    </div>
    <div v-if="!config.argumentCount" class="pt-sm">
      <span class="tsfont-plus text-href" @click="addParam">{{ $t('page.newtarget', {target: $t('page.param')}) }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    config: Object
  },
  data() {
    return {
      argumentMappingList: [],
      validateList: ['required']
    };
  },
  beforeCreate() {},
  created() {
    this.initArgument();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initArgument() {
      let obj = {
        mappingMode: 'constant',
        value: this.$utils.deepClone(this.config ? this.config.defaultValue : ''),
        name: this.$utils.deepClone(this.config ? this.config.defaultValue : '')
      };
      if (this.config.argumentCount && this.config.argumentCount > 0) { //限制自由参数个数
        for (let i = 0; i < this.config.argumentCount; i++) {
          this.argumentMappingList.push(this.$utils.deepClone(obj));
        }
      } else {
        this.argumentMappingList = this.config.isRequired ? [obj] : [];
      }
    },
    addParam() {
      let obj = {
        mappingMode: 'constant',
        value: this.$utils.deepClone(this.config ? this.config.defaultValue : ''),
        name: ''
      };
      this.argumentMappingList.push(obj);
    },
    delParam(index) {
      this.argumentMappingList.splice(index, 1);
    },
    changeValue(val, index) {
      this.$set(this.argumentMappingList[index], 'name', val);
    },
    valid() {
      let isValid = true;
      if (this.config.isRequired && !this.argumentMappingList.length) {
        isValid = false;
      } else if (this.$refs.item) {
        this.$refs.item.forEach(item => {
          if (item.valid && !item.valid()) {
            isValid = false;
          }
        });
      }
      return isValid;
    },
    getValue() {
      return this.argumentMappingList;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.item-box {
  position: relative;
  &:not(:last-child) {
    padding-bottom: 10px;
  }
  &:hover {
    .delete-btn {
      display: block;
    }
  }
  .delete-btn {
    position: absolute;
    right: 0;
    top: 8px;
    display: none;
  }
}
</style>
