<template>
  <div>
    <div class="pt-md pr-md pl-md">
      <TsFormInput
        v-model="keyword"
        border="bottom"
        :search="true"
        :placeholder="$t('form.placeholder.pleaseinput', { target: $t('page.keyword') })"
      ></TsFormInput>
    </div>
    <div id="treeheight">
      <Tabs v-model="mode" :animated="false">
        <TabPane :label="$t('page.hierarchy')" name="level">
          <div style="overflow-y: auto" :style="{ height: catalogHeight }">
            <div v-for="item in filterCiTypeList" :key="item.id" class="titlelistBox">
              <div v-if="item.ciList.length > 0" class="treeTitle ci-label text-title">{{ item.name }}</div>
              <div v-if="item.ciList.length > 0">
                <ul>
                  <li
                    v-for="ci in item.ciList"
                    :id="'ci-' + ci.id"
                    :key="ci.id"
                    class="text-default overflow treeList radius-sm pl-sm pr-xs"
                    :class="ci.icon + (ciId == ci.id ? ' bg-selected' : '')"
                    :title="ci.label + '(' + ci.name + ')'"
                    @click="
                      if (ciId === ci.id) {
                        if (toggleable) {
                          click(null);
                        }
                      } else {
                        click(ci);
                      }
                    "
                  >
                    <span>{{ ci.label }}</span>
                    <span style="padding-left: 2px" class="text-grey">({{ ci.name }})</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </TabPane>
        <TabPane
          :label="
            h => {
              const divList = [
                h('span', $t('page.custom')),
                h('span', {
                  class: {
                    'tsfont-plus-square': !isExpandAll,
                    'tsfont-minus-square': isExpandAll,
                    fz10: true
                  },
                  on: {
                    click: () => {
                      toggleExpand();
                    }
                  }
                })
              ];
              if ($AuthUtils.hasRole('CI_MODIFY')) {
                divList.push(
                  h('span', [
                    h(
                      'Tooltip',
                      {
                        props: {
                          'max-width': 250,
                          placement: 'right',
                          transfer: true,
                          content: $t('term.cmdb.treedraginfo')
                        }
                      },
                      [
                        h('span', {
                          class: {
                            'tsfont-question-o': true,
                            'text-grey': true
                          }
                        })
                      ]
                    )
                  ])
                );
              }
              return h('div', divList);
            }
          "
          name="custom"
        >
          <div style="overflow-y: auto" :style="{ height: catalogHeight }">
            <TsZtree
              ref="tree"
              :nodes="filterCiTreeList"
              idKey="id"
              pIdKey="parentCiId"
              :expandAll="isExpandAll"
              :value="ciId"
              :nodeClasses_bak="nodeClasses"
              :enableToggleClick="toggleable"
              :beforeDrag="
                () => {
                  return !keyword && $AuthUtils.hasRole('CI_MODIFY');
                }
              "
              :renderName="renderName"
              :onDrop="onDrop"
              :onClick="
                (tree, ci) => {
                  click(ci);
                }
              "
            ></TsZtree>
          </div>
        </TabPane>
      </Tabs>
    </div>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';// 修复使用：()=>import('')懒加载组件，导致输入框显示不出来报错问题 
import TsZtree from '@/resources/plugins/TsZtree/TsZtree.vue';
export default {
  name: '',
  components: {
    TsFormInput,
    TsZtree
  },
  filters: {},
  props: {
    ciId: { type: Number },
    toggleable: { type: Boolean, default: true }, //允许反选
    ciFilter: { type: Array }, //过滤模型列表
    tree: {
      //如果有值就用传过来的,没有就用默认的
      type: Array,
      default: () => []
    },
    needDefaultCiId: { type: Boolean, default: true } //是否需要选中默认模型
  },
  data() {
    return {
      ciTypeList: [],
      ciTreeList: [],
      keyword: '',
      treeList: [],
      ciName: 'ciCatalog',
      mode: 'level',
      treeId: '',
      isExpandAll: false,
      catalogHeight: `calc(100vh - 80px - 64px - 50px - 20px )` // 默认值高度：160菜单栏+导航栏+底部间隙，64搜索框高度，40tab高度，16底部间距
    };
  },
  beforeCreate() {},
  created() {
    this.mode = this.$localStore.get('mode') || 'level';
  },
  beforeMount() {},
  async mounted() {
    this.searchCiTypeCi();
    this.getCiTree();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    renderName(name, treeNode) {
      return '<span class="' + treeNode.icon + '">' + treeNode.label + '</span><span class="text-grey">(' + treeNode.name + ')</span>';
    },
    toggleExpand() {
      this.isExpandAll = !this.isExpandAll;
      this.$refs['tree'].toggleExpand(this.isExpandAll);
    },
    getCiTree() {
      this.$api.cmdb.ci.getCiTree().then(res => {
        this.ciTreeList = res.Return;
      });
    },
    flattenTreeNodes(nodeList, treeNodes) {
      treeNodes.forEach(d => {
        let { id, parentCiId, icon, name, label, sort, children } = d;
        const obj = { id, parentCiId, sort, name, icon, label, children };
        if (obj.parentCiId === null) {
          this.$delete(obj, 'parentCiId');
        }
        if (!d.children) {
          obj.sort = nodeList.length + 1;
          nodeList.push(obj);
        } else {
          const children = obj.children;
          this.$delete(obj, 'children');
          obj.sort = nodeList.length + 1;
          nodeList.push(obj);
          this.flattenTreeNodes(nodeList, children);
        }
      });
    },
    onDrop(tree, treeNodes, targetNode, moveType, isCopy) {
      const nodes = tree.getNodes();
      const nodeList = [];
      this.flattenTreeNodes(nodeList, nodes);
      const diffList = [];
      for (let i = 0; i < nodeList.length; i++) {
        if (!this.$utils.isSame(nodeList[i], this.ciTreeList[i])) {
          diffList.push(nodeList[i]);
        }
      }

      this.ciTreeList = nodeList;
      this.$api.cmdb.ci.saveCiTreeItem({ nodeList: diffList }).then(res => {});
    },
    nodeClasses(treeId, treeNode) {
      return { add: [treeNode.icon] };
    },
    restoreHistory(historyData) {
      if (historyData) {
        this.keyword = historyData['keyword'] || '';
      }
    },
    click(nodeData) {
      this.$emit('click', nodeData);
    },
    async searchCiTypeCi() {
      await this.$api.cmdb.ci.searchCiTypeCi().then(res => {
        if (this.ciFilter && this.ciFilter.length > 0) {
          const ciTypeList = res.Return;
          ciTypeList.forEach(citype => {
            const ciList = citype.ciList.filter(d => this.ciFilter.includes(d.id));
            if (ciList.length > 0) {
              citype.ciList = ciList;
              this.ciTypeList.push(citype);
            }
          });
        } else {
          this.ciTypeList = res.Return;
        }
        if (!this.ciId && this.needDefaultCiId) {
          if (this.ciTypeList.length > 0) {
            if (this.ciTypeList[0].ciList.length > 0) {
              //如果没有传入ciId,默认选中第一个模型
              this.$emit('click', this.ciTypeList[0].ciList[0]);
            }
          }
        }
      });
    }
  },
  computed: {
    filterCiTreeList() {
      if (!this.keyword) {
        return this.ciTreeList;
      } else {
        const k = this.keyword.trim().toLowerCase();
        const filterCiTreeList = this.ciTreeList.filter(ci => ci.label.toLowerCase().indexOf(k) > -1 || ci.name.toLowerCase().indexOf(k) > -1);
        return filterCiTreeList;
      }
    },
    filterCiTypeList() {
      if (!this.keyword) {
        return this.ciTypeList;
      } else {
        const filterCiTypeList = JSON.parse(JSON.stringify(this.ciTypeList));
        filterCiTypeList.forEach(type => {
          if (type.ciList && type.ciList.length > 0) {
            const k = this.keyword.trim().toLowerCase();
            type.ciList = type.ciList.filter(ci => ci.label.toLowerCase().indexOf(k) > -1 || ci.name.toLowerCase().indexOf(k) > -1);
          }
        });
        return filterCiTypeList;
      }
    }
  },
  watch: {
    keyword: {
      handler: function(val) {
        if (val) {
          val = val.trim();
        }
        this.$addHistoryData('keyword', val);
      }
    },
    mode: {
      handler: function(val) {
        this.$localStore.set('mode', val);
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
@import (reference) '~@/resources/assets/css/theme.less';
.titlelistBox {
  margin-bottom: 14px;
}
.treeTitle {
  padding-left: 16px;
  font-size: 12px;
  margin-bottom: 4px;
}
.treeList {
  font-size: 13px;
  font-weight: 400;
  min-width: 130px;
  height: 32px;
  line-height: 32px;
  cursor: pointer;
}
// .bg-block {
//   border-radius: 6px;
// }
.tsbg-block {
  border-radius: 6px;
}
/deep/.icon-pr-6 {
  &::before {
    padding-right: 6px;
  }
}
</style>
