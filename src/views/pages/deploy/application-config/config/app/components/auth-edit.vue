<template>
  <div class="auth-edit-wrap">
    <template v-if="checkboxList && checkboxList.length > 0">
      <Checkbox
        :indeterminate="indeterminate"
        :value="checkAll"
        @click.prevent.native="handleCheckAll"
      >{{ $t('page.all') }}</Checkbox>
      <CheckboxGroup v-model="authList" @on-change="checkAllGroupChange">
        <Checkbox
          v-for="(item,index ) in checkboxList"
          :key="index"
          :label="item.value"
        >
          <Tooltip
            class="tooltips-box"
            theme="light"
            max-width="300"
            transfer
          >
            <div class="text-width overflow">{{ item.text }}</div>
            <div slot="content">
              {{ item.text }}
            </div>
          </Tooltip>
        </Checkbox>
      </CheckboxGroup>
    </template>
    <span v-else class="text-grey">{{ $t('page.nodata') }}</span>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    value: {
      type: Array,
      default: function() {
        return [];
      }
    },
    isEdit: {
      type: Number,
      default: 0
    },
    operationType: {
      type: String,
      default: 'opertaion' // operation/env/scenario 操作/环境/场景
    },
    authSetting: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      indeterminate: true,
      checkAll: false,
      authList: this.value,
      defaultAuthList: [],
      checkboxList: []
    };
  },
  beforeCreate() {},
  created() {
    this.handleAuthData();
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
    handleAuthData() {
      let operationTypeObj = {
        operation: 'operationAuthList',
        env: 'envAuthList',
        scenario: 'scenarioAuthList'
      };
      this.checkboxList = this.authSetting[operationTypeObj[this.operationType]] || [];
      this.defaultAuthList = this.$utils.deepClone(this.checkboxList);
      if (this.value.length == 0) {
        this.checkAll = false;
        this.indeterminate = false;
      } else {
        if (this.checkboxList.length == this.value.length) {
          this.checkAll = true;
          this.indeterminate = false;
        } else {
          this.checkAll = false;
          this.indeterminate = true;
        }
      }
      if (!this.isEdit) {
        // 默认选中所有
        let authList = [];
        if (this.checkboxList && this.checkboxList.length > 0) {
          this.checkboxList.forEach((item) => {
            authList.push(item.value);
          });
        }
        this.indeterminate = false;
        this.checkAll = !(authList && authList.length == 0);
        this.authList = authList;
        this.handleEmit();
      }
    },
    handleCheckAll() {
      if (this.indeterminate) {
        this.checkAll = true;
      } else {
        this.checkAll = !this.checkAll;
      }
      this.indeterminate = false;
      if (this.checkAll) {
        let authList = [];
        this.defaultAuthList && this.defaultAuthList.forEach((item) => {
          authList.push(item.value);
          this.authList = authList;
        });
      } else {
        this.authList = [];
      }
      this.handleEmit();
    },
    checkAllGroupChange(selectedList) {
      if (selectedList.length == this.defaultAuthList.length) {
        this.indeterminate = false;
        this.checkAll = true;
      } else if (selectedList.length > 0) {
        this.indeterminate = true;
        this.checkAll = false;
      } else {
        this.authList = [];
        this.indeterminate = false;
        this.checkAll = false;
      }
      this.handleEmit();
    },
    handleEmit() {
      if (this.checkAll == true) {
        this.$emit('input', ['all']);
      } else {
        this.$emit('input', this.authList);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.auth-edit-wrap {
  display: flex;
  /deep/ .ivu-checkbox-group {
    width: 100%;
  }
  /deep/ .ivu-checkbox-wrapper {
    width: 112px;
    white-space: nowrap;
  }
  .tooltips-box {
     width: 100%;
    .text-width {
      width: 100%;
    }
  }
}
</style>
