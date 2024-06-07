<template>
  <div class="dashboardTreeList">
    <Tree :data="dataList" class="demo-tree-render"></Tree>
    <Loading
      v-if="isLoading"
      :loading-show="isLoading"
      class="loadingclass"
      type="fix"
    ></Loading>
  </div>
</template>

<script>
import Vue from 'vue';

Vue.component('DashboardTreeItem', {
  components: {},
  props: ['itemdata'],
  methods: {
    itemClick(e) {
    },
    dragstart(event, data) {
      event.dataTransfer.setData('item', JSON.stringify(data));
    },
    drap() {
    },
    drapend() {
    }
  },
  template: `
        <div @click.stop="itemClick"
             @mouseover.stop
             @dragstart="dragstart($event, itemdata)"
             @drap="drap"
             @drapend="drapend"
             draggable="true"
        >
            <div>
                <i class="icon" :class="itemdata.icon"></i>
                <span>{{itemdata.title}}</span>
            </div>
        </div>
      `
});
export default {
  name: 'ChartHeaderlist',
  comments: {},
  props: ['datasource'],
  data() {
    return {
      isLoading: false,
      dataList: []
    };
  },
  created() {
    this.getHandler();
  },
  methods: {
    renderParent(h, { root, node, data }) {
      return h(
        'div',
        {
          class: {
            dashboardTreeItem: true
          },
          style: {
            display: 'inline-block',
            width: '100%'
          }
        },
        data.title
      );
    },
    renderChildren(h, { root, node, data }) {
      return h(
        'dashboardTreeItem',
        {
          class: {
            item: true
          },
          props: {
            itemdata: data
          },
          style: {
            display: 'inline-block',
            width: '100%'
          }
        },
        data.title
      );
    },
    getHandler: function() {
      this.isLoading = true;
      this.$api.dashboard.dashboard
        .getHandler({})
        .then(res => {
          if (res && res.Status == 'OK') {
            const data = res.Return;
            Object.keys(data).forEach(k => {
              const o = {
                title: k,
                expand: true,
                render: this.renderParent,
                children: []
              };
              data[k].forEach(d => {
                o.children.push({
                  title: d.displayName,
                  icon: d.icon || 'tsfont-task',
                  expand: true,
                  render: this.renderChildren,
                  data: d
                });
              });
              this.dataList.push(o);
            });
            this.isLoading = false;
          }
        })
        .catch(err => {
          _this.$Message.error(this.$t('term.dashboard.getwidgetfailed'));
        });
    },
    append(data) {
      const children = data.children || [];
      children.push({
        title: 'appended node',
        expand: true
      });
      this.$set(data, 'children', children);
    },
    remove(root, node, data) {
      const parentKey = root.find(el => el === node).parent;
      const parent = root.find(el => el.nodeKey === parentKey).node;
      const index = parent.children.indexOf(data);
      parent.children.splice(index, 1);
    }
  },
  watch: {}
};
</script>

<style lang="less" scoped>
/deep/.ivu-tree ul li{
  border-radius: 8px;
}
</style>
