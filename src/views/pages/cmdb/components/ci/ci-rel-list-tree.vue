<template>
  <div>
    <Tree
      v-if="relListLocal && relListLocal.length > 0"
      :data="relListLocal"
      :render="renderName"
      :load-data="loadData"
      :multiple="false"
      class="ts-tree"
      @on-select-change="selectNode"
    ></Tree>
    <div v-else class="text-grey">{{ $t('page.nodata') }}</div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    ciId: { type: Number },
    relList: { type: Array } //回显的时候才需要传入
  },
  data() {
    return {
      relListLocal: []
    };
  },
  beforeCreate() {},
  created() {
    if (!this.relList && this.ciId) {
      this.getRelByCiId(this.ciId);
    } else {
      this.relListLocal = this.relList;
    }
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
    renderName(h, { data }) {
      if (data.direction === 'from') {
        return h(
          'div',
          {
            on: {
              click: () => {}
            }
          },
          [
            h('span', {
              class: {
                'text-grey': true,
                fz10: true,
                'tsfont-minus': true
              }
            }),
            h(
              'span',
              {
                class: {
                  'text-grey': true,
                  fz10: true
                }
              },
              data.toLabel
            ),
            h('span', {
              class: {
                'text-grey': true,
                fz10: true,
                'tsfont-arrow-right': true
              }
            }),
            h('span', data.toCiLabel + '(' + data.toCiName + ')')
          ]
        );
      } else {
        return h(
          'div',
          {
            on: {
              click: () => {}
            }
          },
          [
            h('span', {
              class: {
                'text-grey': true,
                fz10: true,
                'tsfont-arrow-left': true
              }
            }),
            h(
              'span',
              {
                class: {
                  'text-grey': true,
                  fz10: true
                }
              },
              data.fromLabel
            ),
            h('span', {
              class: {
                'text-grey': true,
                fz10: true,
                'tsfont-minus': true
              }
            }),
            h('span', data.fromCiLabel + '(' + data.fromCiName + ')')
          ]
        );
      }
    },
    selectNode(node) {
      this.$emit('select', node);
    },
    getRelByCiId(ciId) {
      this.$api.cmdb.ci.getRelByCiId(ciId).then(res => {
        const relList = res.Return;
        relList.forEach(rel => {
          rel.children = [];
          rel.loading = false;
          rel.selected = false;
          rel.nodeKey = rel.id;
          let relData = {
            nodeKey: rel.id,
            relId: rel.id,
            direction: rel.direction
          };
          if (rel.direction === 'from') {
            relData.relName = rel.toName;
            relData.relLabel = rel.toLabel;
            relData.ciName = rel.fromCiName;
            relData.ciLabel = rel.fromCiLabel;
            relData.ciId = rel.fromCiId;
            relData.targetCiId = rel.toCiId;
            relData.targetCiName = rel.toCiName;
            relData.targetCiLabel = rel.toCiLabel;
          } else {
            relData.relName = rel.fromName;
            relData.relLabel = rel.fromLabel;
            relData.ciName = rel.toCiName;
            relData.ciLabel = rel.toCiLabel;
            relData.ciId = rel.toCiId;
            relData.targetCiId = rel.fromCiId;
            relData.targetCiName = rel.fromCiName;
            relData.targetCiLabel = rel.fromCiLabel;
          }
          rel.path = [relData];
        });
        this.relListLocal = relList;
      });
    },
    loadData(item, callback) {
      if (item) {
        let ciId, excludeCiId;
        if (item.direction === 'from') {
          ciId = item.toCiId;
          excludeCiId = item.fromCiId;
        } else {
          ciId = item.fromCiId;
          excludeCiId = item.toCiId;
        }
        const excludeCiIdList = item.excludeCiIdList || [];
        excludeCiIdList.push(excludeCiId);
        this.$api.cmdb.ci.getRelByCiId(ciId).then(res => {
          //排除掉来源关系，避免产生回环
          const relList = res.Return.filter(d => d.id !== item.id && ((d.direction === 'from' && !excludeCiIdList.includes(d.toCiId)) || (d.direction === 'to' && !excludeCiIdList.includes(d.fromCiId))));
          if (relList.length === 0) {
            this.$delete(item, 'children');
            this.$delete(item, 'loading');
          } else {
            relList.forEach(rel => {
              const path = this.$utils.deepClone(item.path || []);
              rel.children = [];
              rel.loading = false;
              rel.selected = false;
              rel.excludeCiIdList = excludeCiIdList;
              rel.nodeKey = rel.id;
              let relData = {
                nodeKey: rel.id,
                relId: rel.id,
                direction: rel.direction
              };
              if (rel.direction === 'from') {
                ciId = rel.toCiId;
                excludeCiId = rel.fromCiId;

                relData.relName = rel.toName;
                relData.relLabel = rel.toLabel;
                relData.ciName = rel.fromCiName;
                relData.ciLabel = rel.fromCiLabel;
                relData.ciId = rel.fromCiId;
                relData.targetCiId = rel.toCiId;
                relData.targetCiName = rel.toCiName;
                relData.targetCiLabel = rel.toCiLabel;
              } else {
                ciId = rel.fromCiId;
                excludeCiId = rel.toCiId;

                relData.relName = rel.fromName;
                relData.relLabel = rel.fromLabel;
                relData.ciName = rel.toCiName;
                relData.ciLabel = rel.toCiLabel;
                relData.ciId = rel.toCiId;
                relData.targetCiId = rel.fromCiId;
                relData.targetCiName = rel.fromCiName;
                relData.targetCiLabel = rel.fromCiLabel;
              }
              //console.log('path', path);
              path.push(relData);
              rel.path = path;
            });
            callback(relList);
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    ciId: {
      handler: function(val) {
        if (val) {
          this.getRelByCiId(val);
        } else {
          this.relListLocal = [];
        }
      },
      deep: true
    },
    relList: {
      handler: function(val) {
        if (val) {
          this.relListLocal = val;
        } 
      },
      deep: true
    }
  }
};
</script>
<style lang="less"></style>
