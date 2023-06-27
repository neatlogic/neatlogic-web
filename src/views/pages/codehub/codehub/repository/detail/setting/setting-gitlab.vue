<template>
  <Layout>
    <Sider hide-trigger class="bg-op" :style="siderStyle">
      <ul class="type-ul">
        <li
          v-for="t in typeList"
          :key="t.value"
          class="type-li"
          :class="selectedType==t.value?'active text-href':'text-action'"
          @click="selectedType=t.value"
        >{{ t.name }}</li>
      </ul>
    </Sider>
    <Content :style="siderStyle" class="pr-md pb-nm pl-md">
      <auth v-if="selectedType == 'auth'" :id="id"></auth>
      <branchprotect v-if="selectedType == 'branchprotect'" :id="id"></branchprotect>
    </Content>
  </Layout>
</template>
<script>
import settingmixin from './settingmixin.js';
import tablist from './gitlab/index.js';
export default {
  name: '',
  components: {
    ...tablist
  },
  filters: {},
  mixins: [settingmixin],
  props: [''],
  data() {
    return {
      selectedType: 'auth',
      typeList: [{
        name: '权限设置',
        value: 'auth'
      }, {
        name: '分支保护',
        value: 'branchprotect'        
      }]
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
  methods: {},
  computed: {
    siderStyle() {
      return {
        height: 'calc(100vh - 130px)',
        overflow: 'auto'
      };
    }
  },
  watch: {}

};

</script>
<style lang='less' scoped>
.type-ul{
  padding-left: 10px;
  .type-li{
    line-height: 40px;
    position: relative;
    padding-left: 10px;
    transition: all .3s;
    margin-bottom: 5px;
    &.active{
      padding-left: 14px;
      font-size:110%;
      font-weight: bold;
      &:before{
        content:'';
        position: absolute;
        left: 0;
        top: 50%;
        width: 1px;
        height: 20px;
        margin-top: -10px;
        border: 1px solid;
      }
    }
  }
}
</style>
