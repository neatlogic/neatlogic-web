
<template>
  <div>
    <!-- 多行显示表格 -->
    <div v-if="attrList.length > 1" class="tstable-container innerTable bg-grey radius-lg">
      <table class="tstable-body">
        <thead>
          <th v-for="attr in attrList" :key="attr.attr">{{ attr.attribute }}</th>
          <th v-if="!isReadonly"></th>
        </thead>
        <draggable tag="tbody" :list="dataList" handle=".tsfont-bar">
          <tr v-for="(data, oindex) in dataList" :key="oindex">
            <td v-for="attr in filterData(data)" :key="attr.attr">
              <CellComponent ref="item" :setting="attr" :isReadonly="isReadonly"></CellComponent>
            </td>
            <td v-if="!isReadonly">
              <div class="div-check div-btn">
                <i class="tsfont-plus-o text-action text-grey" title="新增" @click="addData(oindex)"></i>
                <i class="tsfont-close-o text-action text-grey" title="删除" @click="removeData(oindex)"></i>
                <i class="tsfont-bar text-action text-grey" title="拖动"></i>
              </div>
            </td>
          </tr>
        </draggable>
      </table>
    </div>
    <!-- 一个属性的处理 -->
    <draggable
      v-else
      tag="div"
      :list="dataList"
      handle=".tsfont-bar"
    >
      <div
        v-for="(data, oindex) in dataList"
        :key="oindex"
        class="item-li"
        :class="{ edit: !isReadonly }"
      >
        <div v-for="attr in filterData(data)" :key="attr.attr">
          <CellComponent ref="item" :setting="attr" :isReadonly="isReadonly"></CellComponent>
        </div>
        <div v-if="!isReadonly" class="item-action">
          <div class="div-check div-btn">
            <i class="tsfont-plus-o text-action" title="新增" @click="addData(oindex)"></i>
            <i class="tsfont-close-o text-action" title="删除" @click="removeData(oindex)"></i>
            <i class="tsfont-bar text-action" title="拖动"></i>
          </div>
        </div>
      </div>
    </draggable>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
export default {
  name: 'StaticTable',
  components: {
    draggable,
    CellComponent: () => import('./staticList-components.vue')
  },
  filters: {},
  props: {
    value: [Object, Array, String],
    attrList: [Array],
    isReadonly: Boolean
  },
  data() {
    return {
      dataList: []
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
    updateValue: function(val) {
      //从外部更新值
      let _this = this;
      _this.dataList = [];
      if (val) {
        if (Array.isArray(val)) {
          val.forEach(item => {
            let json = _this.setTrUuid(_this.attrList);
            json.forEach((cc, i) => {
              if (cc.type != 'uuid') {
                cc.attrConfig.value = item[i];
              }
            });
            _this.dataList.push(json);
          });
        } else {
          Object.keys(val).forEach(key => {
            let attrList = this.$utils.deepClone(_this.attrList);
            attrList.forEach((n, i) => {
              if (n.type != 'uuid') {
                n.attrConfig.value = val[key][n.attributeUuid];
              }
            });
            let uuidConfig = {
              type: 'uuid',
              value: key,
              text: key
            };
            attrList.push(uuidConfig);
            _this.dataList.push(attrList);
          });
        }
      } else if (!this.isReadonly) {
        let json = this.setTrUuid(this.attrList);
        _this.dataList.push(json);
      }
    },
    addData(index) {
      let attrList = this.setTrUuid(this.attrList);
      this.dataList.push(attrList);
    },
    removeData(index) {
      this.dataList.splice(index, 1);
    },
    getValue() {
      let arr = [];
      let tableConfig = {};
      this.dataList.forEach((item, oindex) => {
        let innerArr = [];
        let trConfig = {};
        let uuid = '';
        item.forEach((inner, index) => {
          let refItem = this.$refs['formComponent' + oindex + index];
          if (item.type == 'table' && refItem) {
            //嵌套表格的value需要单独获取
            innerArr.push(refItem.getValue());
          } else {
            if (inner.type != 'uuid') {
              innerArr.push(inner.attrConfig.value);
              trConfig[inner.attributeUuid] = inner.attrConfig.value;
            } else {
              uuid = inner.value;
            }
          }
        });
        tableConfig[uuid] = trConfig;
        arr.push(innerArr);
      });
      return tableConfig;
    },
    valid() {
      let isValid = true;
      this.$refs.item && this.$refs.item.forEach(item => {
        isValid = isValid ? item.validateValue() : isValid;
      });
      return isValid;
    },
    setTrUuid(list) { //tr的唯一标识的：生成uuid
      let attrList = this.$utils.deepClone(list);
      let findUuid = attrList.find(item => item.type == 'uuid');
      if (!findUuid) {
        let uuid = this.$utils.setUuid();
        let config = {
          type: 'uuid',
          value: uuid,
          text: uuid
        };
        attrList.push(config);
      }
      return attrList;
    },
    filterData(data) { //过滤uuid的td
      let list = data.filter(item => item.type != 'uuid');
      return list;
    }
  },
  computed: {},
  watch: {
    value: {
      handler(val) {
        this.updateValue(val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.item-li {
  & + .item-li {
    margin-top: @space-normal;
  }
  &.edit {
    padding-right: 70px;
    position: relative;
    .item-action {
      position: absolute;
      top: 0;
      right: 0px;
      line-height: 30px;
    }
  }
}
.tstable-body {
  tr {
    &:hover {
      .innerTable {
        background: transparent !important;
      }
    }
  }
  .innerTable {
    .tstable-body {
      thead,
      th,
      tbody {
        background: transparent !important;
      }
      tr {
        &:hover {
          background: transparent !important;
        }
      }
    }
  }
}
</style>
