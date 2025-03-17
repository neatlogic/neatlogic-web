<template>
  <div style="line-height: 1.3 !important">
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
    ciRelList: { type: Array }
  },
  data() {
    return {
      relListLocal: []
    };
  },
  beforeCreate() {},
  async created() {
    if (this.ciId && !this.ciRelList) {
      this.getRelByCiId(this.ciId);
    } else {
      const root = {};
      await this.generateData(root, 0, this.ciRelList, this.ciId);
      this.relListLocal = root['children'];
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
    async generateData(parentObj, level, ciRelList, ciId) {
      try {
        const relList = await this.getRelList(ciId);
        const relObjList = [];
        for (const relVo of relList) {
          const relObj = JSON.parse(JSON.stringify(relVo)); // 深拷贝 relVo
          relObj.children = [];
          relObj.loading = false;
          relObj.selected = false;
          relObj.excludeCiIdList = parentObj.excludeCiIdList ? JSON.parse(JSON.stringify(parentObj.excludeCiIdList)) : [];
          relObj.path = parentObj.path ? JSON.parse(JSON.stringify(parentObj.path)) : [];

          if (parentObj.ciId) {
            relObj.excludeCiIdList.push(parentObj.ciId);
          }

          if (parentObj.id && relVo.id === parentObj.id) {
            continue;
          }

          let isExists = false;
          for (let i = 0; i < relObj.excludeCiIdList.length; i++) {
            const cid = relObj.excludeCiIdList[i];
            if ((relVo.direction === 'from' && relVo.toCiId === cid) || (relVo.direction === 'to' && relVo.fromCiId === cid)) {
              isExists = true;
              break;
            }
          }

          if (isExists) {
            continue;
          }

          const relPathObj = {
            relId: relVo.id,
            direction: relVo.direction
          };

          if (relVo.direction === 'from') {
            Object.assign(relPathObj, {
              relName: relVo.toName,
              relLabel: relVo.toLabel,
              ciName: relVo.fromCiName,
              ciLabel: relVo.fromCiLabel,
              ciId: relVo.fromCiId,
              targetCiId: relVo.toCiId,
              targetCiName: relVo.toCiName,
              targetCiLabel: relVo.toCiLabel
            });
          } else {
            Object.assign(relPathObj, {
              relName: relVo.fromName,
              relLabel: relVo.fromLabel,
              ciName: relVo.toCiName,
              ciLabel: relVo.toCiLabel,
              ciId: relVo.toCiId,
              targetCiId: relVo.fromCiId,
              targetCiName: relVo.fromCiName,
              targetCiLabel: relVo.fromCiLabel
            });
          }

          relObj.path.push(relPathObj);

          if (ciRelList && ciRelList.length > level) {
            const ciRelObj = ciRelList[level];
            if (relVo.id === ciRelObj.relId && relVo.direction === ciRelObj.direction) {
              level++;
              if (level < ciRelList.length) {
                await this.generateData(relObj, level, ciRelList, ciRelObj.targetCiId);
              } else {
                relObj.selected = true;
              }
            }
          }

          relObjList.push(relObj);
        }

        parentObj.children = relObjList;
        parentObj.expand = true;
      } catch (error) {
        console.error('Error generating data:', error);
      }
    },

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
                  'text-grey': true
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
                  'text-grey': true
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
    async getRelList(ciId) {
      let relList = [];
      await this.$api.cmdb.ci.getRelByCiId(ciId).then(res => {
        relList = res.Return;
      });
      return relList;
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
          console.log('relList', JSON.stringify(val, null, 2));
          this.relListLocal = val;
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .ivu-tree-title-selected {
  font-weight: bold;
}
</style>
