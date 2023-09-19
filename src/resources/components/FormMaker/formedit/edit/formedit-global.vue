<template>
  <div class="formsetting-container bg-grey" style="overflow: visible;">
    <div class="formTop">
      <!-- <i class="tsfont-left btn-togglewidth text-action" @click="toggleWidth"></i> -->
      表单设置
    </div>
    <div class="btn-closeedit tsfont-close" @click="hideEdit"></div>
    <div ref="formContainer" class="formContain">
      <div class="formsetting-block">
        <label class="formsetting-label text-grey">
          默认隐藏行
        </label>
      </div>
      <div>
        <RowSelect
          v-model="globalSetting.defaultHiderow"
          :rowLength="rowLength"
          :sheetsConfig="sheetsConfig||{}"
          :controllerList="controllerList||[]"
        ></RowSelect>
      </div>
      <div
        :is="conf"
        v-for="(conf, cindex) in globalConfig"
        :ref="conf"
        :key="cindex"
        :globalSetting="globalSetting"
        :sheetsConfig="sheetsConfig"
        :controllerList="controllerList"
        :rowLength="rowLength"
        :componentRuleuuid="componentRuleuuid"
        @updateGlobal="updateGlobal"
        @clearRuleuuid="clearRuleuuid"
      ></div>
    </div>
    <!-- <div class="ivu-drawer-drag-move-trigger" @mousedown="adjust"><div class="ivu-drawer-drag-move-trigger-point"><i></i><i></i><i></i><i></i><i></i></div></div> -->
  </div>
</template>

<script>
import ConfigItem from './global';
import RowSelect from './rule/row-select.vue';
export default {
  name: 'FormeditGlobal',
  tagComponent: 'FormeditGlobal',
  components: {
    ...ConfigItem,
    RowSelect
  },
  model: {
    prop: 'globalSetting',
    event: 'change'
  },
  props: {
    globalSetting: { type: Object },
    controllerList: { type: Array },
    rowLength: Number,
    componentRuleuuid: String
  },
  data() {
    return {
      //globalConfig: ['label', 'rule', 'scripts']
      globalConfig: ['rule', 'scripts'],
      relationList: [],
      sheetsConfig: null,
      showSelectrow: false, //是否显示选择行的弹窗
      rowVal: [] //选中列
    };
  },

  beforeCreate() {},

  created() {
    this.getData();
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
    getData() {
      let sheetdata = this.$parent.getSheetdata();
      this.sheetsConfig = sheetdata.sheetsConfig;
      this.relationList = this.$parent.controllerList; //获取表单的所有组件（含自己）
    },
    hideEdit() {
      this.$emit('closeEditform');
    },
    toggleWidth() {
      this.$emit('toggleWidth');
    },
    hightlight(uuid) {
      this.$emit('hightlight', uuid);
    },
    updateGlobal(type, config) {
      this.globalSetting[type] = config;
      this.$emit('change', this.globalSetting);
    },
    validAll() {
      let _this = this;
      _this.$nextTick(() => {
        _this.globalConfig.forEach(conf => {
          _this.$refs[conf] && _this.$refs[conf][0].valid();
        });
      });
    },
    validItem(type, data) {
      this.validAll();
      if (type == 'rule' && data) {
        this.$nextTick(() => {
          if (this.$refs.formContainer && this.$refs.formContainer.querySelector('.rule_' + data.type + '_' + data.index)) {
            let offsettop = Math.max(0, this.$refs.formContainer.querySelector('.rule_' + data.index).offsetTop + this.$refs.formContainer.querySelector('.rule_' + data.type + '_' + data.index).offsetTop - 50);
            this.$refs.formContainer.scrollTop = offsettop;
          }
        });
      }
    },
    adjust(e) {
      let width = window.innerWidth - e.clientX;
      this.$emit('adjustwidth', Math.max(width, 380));
    },
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
      let val = this.globalSetting.defaultHiderow || [];
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
      this.$set(this.globalSetting, 'defaultHiderow', val);
    },
    selectRow(val) {
      this.rowVal = this.$utils.deepClone(val) || [];
      this.showSelectrow = true;
    },
    updateSelectrow() {
      this.$set(this.globalSetting, 'defaultHiderow', this.rowVal);
      this.showSelectrow = false;
    },
    clearSelectrow() {
      this.rowVal = [];
    },
    setRow(val) {
      this.rowVal = val || [];
    },
    clearRuleuuid() {
      this.$emit('clearRuleuuid');      
    }
  },

  filter: {},

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
  }
};
</script>
<style lang="less" scoped>
.btn-ewresize {
  position: absolute;
  top: 50%;
  height: 40px;
  margin-top: -15px;
  left: 0px;
  width: 10px;
  border: 1px solid;
  cursor: ew-resize;
  border-radius: 8px;
}
.row-select{
  padding-left: 6px;
  border: 1px solid;
}
 /deep/ .row-select {
      position: relative;
      display: block;
      line-height: 31px;
      border-bottom: 1px solid;
      cursor: pointer;
      padding-right: 20px;
      min-height: 32px;
  }
 /deep/ .icon-select {
      position: absolute;
      top: 50%;
      right: 8px;
      line-height: 1;
      transform: translateY(-50%);
      transition: all 0.2s ease-in-out;
      cursor: pointer;
  }
</style>
