<template>
  <div>
    <UserSelect
      v-if="!readonly"
      ref="select"
      :value="valueListLocal"
      border="border"
      :multiple="isMultiple"
      :readonly="readonly"
      :validateList="validateList"
      transfer
      :groupList="['user']"
      @change="changeValue"
      @change-label="(text, selectedList) => $emit('changeLabel', text, selectedList)"
    ></UserSelect>
    <div v-else>
      <div v-if="valueListLocal.length > 0">
        <UserCard
          v-for="(user, index) in valueListLocal"
          :key="index"
          trigger="none"
          :uuid="user"
          class="pr-sm"
        ></UserCard>
      </div>
      <div v-else>-</div>
    </div>
  </div>
</template>
<script>
import { AttrBase } from './base-privateattr.js';

export default {
  name: '',
  components: {
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve)
  },
  extends: AttrBase,
  props: {},
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {
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
    valid() {
      return this.$refs['select'].valid();
    },
    changeValue(val, opt) {
      if (val instanceof Array) {
        const valueList = val.map(user => user.replace('user#', ''));
        const textList = opt.map(item => item.text);
        this.$emit('setValue', valueList, textList);
      } else {
        if (opt) {
          val = val.replace('user#', '');
          this.$emit('setValue', [val], [opt.text]);
        } else {
          this.$emit('setValue', null, null);
        }
      }
    }
  },
  filter: {},
  computed: {
    validateList() {
      if (this.mode === 'input' && this.attrConfig.isRequired) {
        return [{ name: 'required', message: ' ' }];
      }
      return [];
    },
    valueListLocal() {
      const list = [];
      if (this.valueList && this.valueList.length > 0) {
        this.valueList.forEach(v => {
          if (typeof v != 'object') {
            if (v) {
              if (!v.startsWith('user#')) {
                v = 'user#' + v;
              }
              list.push(v);
            }
          }
        });
      }
      return list;
    },
    isMultiple() {
      if (this.mode !== 'input' || (this.attrConfig && this.attrConfig?.config?.isMultiple)) {
        return true;
      }
      return false;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
