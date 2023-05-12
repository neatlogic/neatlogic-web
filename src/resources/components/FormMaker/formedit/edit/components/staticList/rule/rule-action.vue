
<template>
  <div v-if="dataList && dataList.length">
    <Row
      v-for="(data,index) in dataList"
      :key="index"
      :gutter="6"
      class="row-div"
    >
      <!-- 动作 -->
      <Col span="8">
        <TsFormSelect
          v-model="data.action"
          :dataList="actionList"
          placeholder="动作"
          @on-change="changeAction"
        ></TsFormSelect>
      </Col>
      <!-- 属性 -->
      <Col span="11">
        <TsFormSelect
          v-model="data.attr"
          multiline
          :dataList="attrList" 
          valueName="attribute"
          textName="attribute"
          placeholder="属性"
        ></TsFormSelect>
      </Col>
      <Col span="5">
        <span
          v-if="showAdd"
          class="ts-plus-o span-btn"
          title="添加动作"
          @click="addAction(index)"
        ></span>
        <span class="tsfont-close-o span-btn" title="删除动作" @click="removeAction(index)"></span>
      </Col>
    </Row>
  </div>
  <div v-else @click="addAction">添加动作</div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import {actionList} from './rule.js';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  filters: {
  },
  props: {
    attrList: Array,
    dataList: Array//[{action:'',attr:'empty'}]
  },
  data() {
    return {
      actionList: this.$utils.deepClone(actionList),
      showAdd: true
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.changeAction();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addAction(index) {
      let json = {action: '', attr: ''};
      if (index) {
        this.dataList.splice(index, 0, json);
      } else {
        this.dataList.push(json);
      }
    },
    removeAction(index) {
      this.dataList.splice(index, 1);
      this.changeAction();
    },
    changeAction() {
      let list = this.$utils.deepClone(actionList);
      let len = 0;
      this.dataList.forEach(item => {
        let node = list.find(cc => item.action == cc.value);
        if (node) {
          len++;
          node['_disabled'] = true;
        }
      });
      this.actionList = list;
      if (len == list.length) {
        this.showAdd = false;
      } else {
        this.showAdd = true;
      }
    }
  },
  computed: {
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.row-div{
  margin-bottom: 6px;
}
.span-btn{
  padding: 2px 4px;
  cursor: pointer;
  font-size: 12px;
  line-height: 28px;
  height: 28px;
  display: inline-block;
}
</style>
