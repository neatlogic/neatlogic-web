<template>
  <div class="row-select border-color bg-op radius-sm">
    <Dropdown
      ref="dropDown"
      style="width:100%;min-height:30px;"
      transfer
      transfer-class-name="rowselect-dropper"
    >
      <div style="min-height:30px">{{ setRowtxt(rowList) }}</div>
      <DropdownMenu slot="list" :style="'width:'+dropWidth+'px'">
        <li
          v-for="rowli in rowLength"
          :key="rowli"
          :class="setRowli(rowli, rowList)"
          @click="toggleselectRow(rowli)"
        >
          {{ rowli }}
        </li>
      </DropdownMenu>
    </Dropdown>
    <!-- <span class="icon-select ts-icon" @click="selectRow(rowList)"></span> -->
    <!-- start_选择行的弹窗 -->
    <TsDialog
      :isShow.sync="showSelectrow"
      v-bind="dialogConfig"
      @on-ok="updateSelectrow()"
      @on-close="clearSelectrow"
    >
      <div>
        <RowView
          :value="rowVal"
          :sheetsConfig="sheetsConfig"
          :controllerList="controllerList"
          @update-value="setRow"
        ></RowView>
      </div>
    </TsDialog>
    <!-- end_选择行的弹窗 -->
  </div>
</template>
<script>
export default {
  name: 'RowSelect',
  components: {
    RowView: resolve => require(['./row-view.vue'], resolve)
  },
  filters: {},
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: [String, Array],
    rowLength: [Number],
    sheetsConfig: Object,
    controllerList: Array
  },
  data() {
    return {
      rowList: [], //值
      showSelectrow: false, //是否显示选择行的弹窗
      rowVal: [], //选中列
      dialogConfig: {
        maskClose: false,
        showCloseIcon: false,
        title: '请选择行',
        type: 'modal'
      },
      dropWidth: 200
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.$el) {
      this.dropWidth = this.$el.getBoundingClientRect().width;
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getRowgroup(list) {
      let result = [];
      let i = 0;
      result[i] = [list[0]];
      list.reduce(function(prev, cur) {
        cur - prev === 1 ? result[i].push(cur) : (result[++i] = [cur]);
        return cur;
      });
      return result;
    },
    toggleselectRow(li) {
      let val = this.rowList;
      if (val && val.length > 0) {
        if (val.indexOf(li) > -1) {
          let turn = val.indexOf(li);
          val.splice(turn, 1);
        } else {
          val.push(li);
        }
      } else {
        val = [];
        val.push(li);
      }
      val.sort(this.$utils.sortNumber());
      this.rowList = val;
    },
    selectRow(val) {
      let parent = getParent(this);
      parent && parent.getData && parent.getData();
      this.rowVal = this.$utils.deepClone(val) || [];
      this.showSelectrow = true;
      this.$refs.dropDown.currentVisible = false;
    },
    updateSelectrow() {
      this.rowList = this.rowVal;
      this.showSelectrow = false;
    },
    clearSelectrow() {
      this.rowVal = [];
    },
    setRow(val) {
      this.rowList = val || [];
    }
  },
  computed: {
    setRowtxt() {
      return function(list) {
        let txt = '';
        if (list && list.length > 0) {
          list.forEach(li => {
            if (li > this.rowLength) {
              list.splice(list.indexOf(li), 1);
            }
          });
        }

        if (list && list.length > 0) {
          let listtxt = this.getRowgroup(list);
          listtxt.forEach((li, lindex) => {
            if (li.length > 1) {
              txt += li[0] + '-' + li[li.length - 1];
            } else {
              txt += li[0];
            }

            if (lindex < listtxt.length - 1) {
              txt += ',';
            }
          });
        }
        return txt;
      };
    },
    setRowli() {
      return function(li, val) {
        let classTxt = 'ivu-select-item';
        if (val && val.length > 0) {
          if (val.indexOf(li) > -1) {
            classTxt += ' ivu-dropdown-item-selected';
          }
        }
        return classTxt;
      };
    }
  },
  watch: {
    value: {
      handler: function(val) {
        //20210531_接口返回的数据先判断是不是数字（[1,2,3]保存后接口会处理成["1","2","3"]，需要在这里再处理为数字免得影响行的逻辑）
        let rowList = [];
        if (val && val.length) {
          rowList = val.map(v => {
            return typeof v == 'string' ? parseInt(v) : v;
          });
        }
        if (!this.$utils.isSame(rowList, this.rowList)) {
          this.rowList = rowList;
        }
      },
      deep: true,
      immediate: true
    },
    rowList: {
      handler: function(val) {
        this.$emit('change', val);
      },
      deep: true
    }
  }
};
function getParent(node) {
  let list = ['FormeditGlobal'];
  if (node && node.$parent) {
    let tag = node.$parent.$options.tagComponent;
    if (list.indexOf(tag) >= 0) {
      return node.$parent;
    } else if (node.$parent) {
      return getParent(node.$parent);
    } else {
      return false;
    }
  } else {
    return false;
  }
}
</script>
<style lang="less" scoped>
.row-select {
  position: relative;
  display: block;
  line-height: 31px;
  border-bottom: 1px solid;
  cursor: pointer;
  padding-right: 20px;
  min-height: 32px;
}
.icon-select {
  position: absolute;
  top: 50%;
  right: 8px;
  line-height: 1;
  transform: translateY(-50%);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}
</style>

