
<template>
  <div class="node-view bg-op radius-sm">
    <Row :gutter="10">
      <Col v-for="(data,index) in showDataList(list)" :key="index" :span="6">
        <span
          class="item-span bg-op border-color overflow"
          :title="targetText(data)"
        >
          {{ targetText(data) }}
        </span>
      </Col>
    </Row>
    <div v-if="list.length>showNumber" class="text-grey div-btn tips">
      <span class="text-tip-active" @click="isMoreNode = true">{{ $t('term.autoexec.viewalltarget', {target: list.length}) }}</span>
    </div>
    <MoreTarget
      v-if="isMoreNode"
      v-model="isMoreNode"
      :isReadonly="true"
      :dataList="list"
      @on-ok="onOk"
    ></MoreTarget>  
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    MoreTarget: resolve => require(['@/resources/components/FormMaker/formedit/view/resourceinput/more-target.vue'], resolve)
  },
  filters: {
  },
  props: {
    list: Array
  },
  data() {
    return {
      showNumber: 12,
      isMoreNode: false
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
    onOk() {
      this.isMoreNode = false;
    }
  },
  computed: {
    targetText() {
      return data => {
        return data.port && data.name ? data.ip + ':' + data.port + '/' + data.name : data.port && !data.name ? data.ip + ':' + data.port : data.ip;
      };
    },
    showDataList() {
      return val => {
        let list = val.slice(0, this.showNumber);
        return list;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.node-view{
  padding: 16px;
  .item-span{
    width: 100%;
    display: inline-block;
    position: relative;
    height: 32px;
    line-height: 30px;
    padding: 0 4px;
    border: 1px solid;
    text-align: center;
    margin-bottom: 10px;
    border-radius: 4px;
  }
  .div-btn{
    text-align: right;
  }
} 
</style>
