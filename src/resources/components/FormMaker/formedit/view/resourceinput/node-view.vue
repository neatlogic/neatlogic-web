
<template>
  <div class="node-view bg-op">
    <ul class="item-ul">
      <li
        v-for="(data,index) in showDataList(list)"
        :key="index"
        class="item-span bg-op border-color"
      >
        <span class="node-name overflow">
          {{ targetText(data) }}
        </span>
        <i v-if="!isReadonly" class="tsfont-close text-tip" @click="removeItem(index)"></i>
      </li>
      <li v-if="!isReadonly && list.length>showNumber" class="text-tip-active div-btn tips" @click="isMoreNode = true">查看所有{{ list.length }}个目标</li>
    </ul>
    <MoreTarget
      v-if="isMoreNode"
      v-model="isMoreNode"
      :isReadonly="isReadonly"
      :dataList="list"
      @on-ok="onOk"
    ></MoreTarget>  
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    MoreTarget: resolve => require(['./more-target.vue'], resolve)
  },
  filters: {
  },
  props: {
    list: Array,
    isReadonly: {
      type: Boolean,
      default: true
    }
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
    onOk(val) {
      this.isMoreNode = false;
      val && this.$emit('onOk', val);
    },
    removeItem(index) {
      this.$emit('removeItem', index);
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
        let list = this.isReadonly ? val : val.slice(0, this.showNumber);
        return list;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.node-view{
  .item-ul{
    line-height: 40px;
  }
  .item-span{
    width: auto;
    display: inline-block;
    position: relative;
    height: 32px;
    line-height: 30px;
    padding: 0 6px;
    border: 1px solid;
    text-align: center;
    border-radius: 4px;
    margin-right: 8px;
    .tsfont-close {
      position: absolute;
      right: 0px;
      top: 0px;
      width: 16px;
      height: 16px;
      line-height: 16px;
      display: none;
      cursor: pointer;
    }
    &:hover{
      .tsfont-close {
        display: block;
      }
    }
  }
  .div-btn{
    display: inline-block;
    text-align: right;
  }
} 
</style>
