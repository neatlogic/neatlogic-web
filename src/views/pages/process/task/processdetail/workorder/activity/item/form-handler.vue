<template>
  <div>
    <span class="tip-title">{{ config.typeName }}</span>
    <div v-for="(sub, subIndex) in setData(config.newContent)" :key="subIndex" class="active-form-list">
      <div :class="subIndex == 0 ? 'show-form' : subIndex >= 1 && isShow ? 'show-form' : 'hide-form'" class="active-form-text">
        <span v-if="sub.oldContent && hasAttr(sub) && sub.newContent ===''" class="text-grey tip-title">{{ $t('page.clear') }}</span>
        <span class="tip-title">{{ sub.label }}</span>
        <span v-if="sub.oldContent" class="inline-block" v-html="sub.oldContent"></span>
        <span v-if="sub.oldContent && hasAttr(sub) && sub.newContent !=''" class="change-text text-grey">改为</span>
        <span v-if="hasAttr(sub) && sub.newContent !=''" class="inline-block text-grey" v-html="sub.newContent"></span>
        <i
          v-if="subIndex == 0 && setData(config.newContent).length > 1"
          class="text-action open-formlist"
          :class="isShow ? 'tsfont-up' : 'tsfont-down'"
          @click="isOpen"
        ></i>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  filters: {},
  props: {
    config: Object
  },
  data() {
    return {
      isShow: false
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
    setData(str) {
      let data = JSON.parse(str);
      return data;
    },
    isOpen() {
      //活动列表展示表单数据
      this.isShow = !this.isShow;
    }
  },
  computed: {
    hasAttr() {
      return function(obj) {
        let isExistence = true;
        if (!obj.hasOwnProperty('newContent')) {
          isExistence = false;
        }
        return isExistence;
      };
    }
  },
  watch: {

  }
};
</script>
<style lang='less' scoped>
.active-form-list {
  line-height: 24px;
  .open-formlist {
    padding-left:  24px;
  }

  .show-form {
    display: block;
    word-break: break-word;
  }

  .hide-form {
    display: none;
  }
  .inline-block{
    display: inline-block;
  }
}
</style>
