<template>
  <div class="overHidden">
    <Tabs>
      <TabPane
        v-for="item in tabList"
        :key="item.value"
        :label="item.name"
        :name="item.value"
      >
        <ListComponents 
          :is="item.value" 
          :type="item.value" 
        >
        </ListComponents>
      </TabPane>
      <!-- 左边样式，右边代码(方便copy) -->
    </Tabs>
  </div>
</template>
<script>
import ListComponents from './components';
export default {
  name: '',
  components: {
    ...ListComponents
  },
  props: {},
  data() {
    return {
      tabList: [
        {name: '表格', value: 'tab'},
        {name: '标准页面', value: 'page'},
        {name: '卡片', value: 'card'},
        {name: '弹窗', value: 'dialogs'},
        {name: '表单', value: 'forms'},
        {name: '返回目录', value: 'back'},
        {name: '详情页', value: 'details'},
        {name: '弹框提示', value: 'messages'}
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {

  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less" scoped>
/deep/.ivu-tabs-bar{
  margin-bottom: 0px;
}
.overHidden{
  overflow: hidden;
}
</style>
