<template>
  <div v-if="config && config.isChecked">
    <div class="fz-h1">{{ config.title }}</div>
    <div v-if="config.list.length > 0">
      <div v-for="(item, index) in config.list" :key="index" class="step-comment">
        <div class="fz-h2">{{ item.name }}</div>
        <div v-for="(c, cindex) in item.list" :key="cindex" class="content-list">
          <Checkbox
            v-model="c.isChecked"
            :true-value="1"
            :false-value="0"
            class="label-style"
          ></Checkbox>
          <div v-html="c.content"></div>
        </div>
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
      list: []
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
    getData() {
      let list = [];
      if (this.config.isChecked == 1) {
        let titleConfig = { handler: 'h1', uuid: this.$utils.setUuid(), content: this.config.title };
        list.push(titleConfig);
        this.config.list.forEach(item => {
          if (item.isChecked == 1) {
            let obj1 = { handler: 'h2', uuid: this.$utils.setUuid(), content: item.name };
            list.push(obj1);
          }
          item.list.forEach(d => {
            if (d.isChecked == 1) {
              let obj2 = { handler: 'editor', uuid: this.$utils.setUuid(), content: d.content };
              list.push(obj2);
            }
          });
        });
      }
      return list;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.content-list {
  padding: 0 0 12px 30px;
  position: relative;
  .label-style {
    position: absolute;
    left: 0;
    top: 0;
  }
}
.step-comment {
  padding: 0 12px;
}
.fz-h2 {
  font-weight: bold;
  padding-bottom: 12px;
}
</style>
