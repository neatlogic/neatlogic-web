<template>
  <div>
    <TsContain><template v-slot:navigation><span>导航</span></template>
      <template v-slot:topLeft>上左</template>
      <template v-slot:topCenter>上中</template>
      <template v-slot:topRight>上右</template>
      <template v-slot:sider>侧边栏</template>
      <template v-slot:content>内容</template></TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {},
  data() {
    return {
      initData: null
    };
  },
  beforeCreate() {},
  async created() {
    await this.getInitData();
    this.$addWatchData(this.initData);
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
    beforeLeaveCompare(oldData) {
      // 离开当前页面，数据对比, getSaveData() 方法为获取提交后端数据的方法
      return this.$utils.isSame(oldData, this.getSaveData());
    },
    async beforeLeave() {
      //离开页面，二次弹窗，点击'确认按钮'，存储数据,
      return await this.saveData();
    },
    getInitData() {
      this.$api.deploy.applicationConfig.getDetailById().then((res) => {
        if (res && res.Status == 'OK') {
          this.initData = res.Return;
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
