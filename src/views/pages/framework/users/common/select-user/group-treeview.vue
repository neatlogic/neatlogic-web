<template>
  <div class="group-treeview">
    <div
      v-for="(cd, index) in children"
      :key="cd.uuid"
      :index="index"
      class="dataSource-ul"
    > 
      <span class="sub-line"></span>
      <p class="team-check bg-check">
        <Checkbox :value="cd.checked?true:false" @on-change="changeCheckbox(cd,...arguments)"></Checkbox>
      </p>
      <div class="card-item bg-op block-container">
        <span class="name">
          <span class="text-title overflow" :title="cd.name">{{ cd.name }}</span>
          <i
            v-if="cd.childCount && cd.childCount > 0"
            class="text-action"
            :class="cd._open ? 'ts-angle-up' : 'ts-angle-down'"
            @click="changeOpen(cd)"
          ></i>
        </span>
        <span class="num">
          <Tooltip :content="cd._parentFullPath" theme="light" max-width="500">
            <span>{{ getPath(cd._parentFullPath) }}</span>
          </Tooltip>
        </span>
        <!-- 复选框选中，子节点按钮才显示 -->
       
        <span v-if="cd.checked" class="selectNode">
          <TsFormSwitch v-model="cd.checkedChildren" @on-change="changeSwitch(cd,...arguments)" />
        </span>
      </div>
      <Loading v-if="cd._open && !cd._isChildren" loadingShow></Loading>
      <GroupTreeView
        v-else
        :children="cd.children"
        class="item-sub"
      ></GroupTreeView>
    </div>
  </div>
</template>

<script>
export default {
  inject: ['$parent'],
  name: 'GroupTreeView',
  components: {
    GroupTreeView: resolve => require(['./group-treeview'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)

  },
  props: {
    children: {
      required: true,
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
    };
  },

  beforeCreate() {},

  created() {
  },

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
    changeCheckbox(node, value) {
      node.checked = value ? 1 : 0;
      this.$parent.changeCheckbox(node, value, 'checkbox');
    },
    changeSwitch(node, value) {
      node.checkedChildren = value;
      this.$parent.changeCheckbox(node, value, 'switch');
    },
    changeOpen(node) {
      this.$parent.changeOpen(node);
    },
    getPath(path) {
      if (path) {
        let ary = path.split('/');
        return ary.length > 3 ? ('.../' + ary.splice(-3).join('/')) : path;//如果长度大于三需要显示后面三个路径
      } else {
        return '';
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.group-treeview {
  .item-sub {
    margin-left: 50px;
  }

  .text-title {
    display: inline-block;
    padding: 0 16px;
    max-width: 320px;
  }
  .dataSource-ul {
    min-height: 1px;
    position: relative;
    .card-item {
      position: relative;
      height: 56px;
      line-height: 56px;
      padding: 0 20px;
      margin-bottom: 8px;
      .name {
        padding-right: 300px;
      }
      .num {
        position: absolute;
        right: 100px;
        width: 300px;
        text-align: left;
      }
      .selectNode{
        position: absolute;
        right: 0;
        top: 0;
        width:100px;
      }
    }
    .block-container {
      position: relative;
    }
    .sub-line {
      display: none;
    }
    .item-sub {
      position: relative;

      &::before {
        content: '';
        display: block;
        width: 0;
        position: absolute;
        top: -7px;
        bottom: 0;
        left: -33px;
        margin-bottom: 26px;
        border-left: 1px dotted @default-border;
      }

      .sub-line {
        position: absolute;
        display: inline-block;

        &::before {
          content: '';
          display: block;
          width: 28px;
          height: 0;
          border-top: 1px dotted @default-border;
          position: absolute;
          top: 29px;
          left: -30px;
        }
      }
    }
  }
  .team-check {
    position: absolute;
    left: -22px;
    top: 18px;
  }
}
</style>
