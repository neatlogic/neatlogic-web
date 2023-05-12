<template>
  <div>
    <div v-for="(sub, subIndex) in setData(config.newContent)" :key="subIndex" class="active-form-list">
      <div :class="subIndex == 0 ? 'show-form' : subIndex >= 1 && isShow ? 'show-form' : 'hide-form'" class="active-form-text">
        <span v-if="subIndex == 0" class="tip-title">{{ config.typeName }}</span>
        <div>
          <span class="text-href tip-title" style="text-transform: uppercase;" @click="toTask(sub.processTaskId)">{{ sub.serialNumber }}</span>
          <span>{{ sub.title }}</span>
          <i
            v-if="subIndex == 0 && setData(config.newContent).length > 1"
            class="text-action open-formlist"
            :class="isShow ? 'tsfont-up' : 'tsfont-down'"
            @click="isOpen"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
   
  },
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
    toTask(id) {
      window.open(HOME + '/process.html#/task-detail?processTaskId=' + id, '_blank');
    },
    isOpen() {
      //活动列表展示表单数据
      this.isShow = !this.isShow;
    }
  },
  computed: {},
  watch: {}
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
}
</style>
