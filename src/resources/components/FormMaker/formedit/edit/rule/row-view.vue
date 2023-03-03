<template>
  <div>
    <div class="tstable-container input-border">
      <table v-if="tableList" style="table-layout: fixed;" class="sheet-table tstable-body">
        <tbody>
          <tr>
            <th colspan="2"></th>
            <th v-for="(w, i) in tableList[0]" :key="i" class="text-tip">{{ String.fromCharCode(i + 65) }}</th>
          </tr>
          <tr
            v-for="(tr, tindex) in tableList"
            :key="tindex"
            :class="setTr(tindex + 1)"
            @click.stop="toggleRow(tindex + 1)"
          >
            <td width="30">
              <div :class="setCheck(tindex + 1)">
                <i class="tsfont-check icon-check"></i>
              </div>
            </td>
            <td width="40" class="text-tip">{{ tindex + 1 }}</td>
            <template v-for="(td, dindex) in tr">
              <td
                v-if="showTd(td)"
                :key="dindex"
                :colspan="getMergeCell(td, 'colspan')"
                :rowspan="getMergeCell(td, 'rowspan')"
                style="position: relative;"
                :style="getStyle(td)"
              >
                <template v-if="td">
                  <div v-if="td.component" :class="'component-' + td.component.handler">
                    <div v-if="td.component.handler == 'forminput'">
                      <Input :value="getLabel(td.component)" />
                    </div>
                    <div v-else-if="td.component.handler == 'formtextarea'">
                      <Input :value="getLabel(td.component)" type="textarea" />
                    </div>
                    <div v-if="td.component.handler == 'formradio'">
                      <Radio :value="getLabel(td.component)">{{ getLabel(td.component) }}</Radio>
                    </div>
                    <div v-else-if="td.component.handler == 'formcheckbox'">
                      <Checkbox :value="getLabel(td.component)">{{ getLabel(td.component) }}</Checkbox>
                    </div>
                    <div v-else-if="td.component.handler == 'formselect'">
                      <Select :value="getLabel(td.component)">
                        <Option :value="getLabel(td.component)">{{ getLabel(td.component) }}</Option>
                      </Select>
                    </div>
                    <div v-else-if="td.component.handler == 'formdate'">
                      <DatePicker type="date" :placeholder="getLabel(td.component)"></DatePicker>
                    </div>
                    <div v-else-if="td.component.handler == 'formtime'">
                      <TimePicker type="time" :placeholder="getLabel(td.component)"></TimePicker>
                    </div>
                    <div v-else-if="td.component.handler == 'formnumber'">
                      <Input :value="getLabel(td.component)" type="number" />
                    </div>
                    <div v-else-if="td.component.handler == 'formemail'">
                      <Input :value="getLabel(td.component)" type="email" />
                    </div>
                    <div v-else-if="td.component.handler == 'formphone'">
                      <Input :value="getLabel(td.component)" type="tel" />
                    </div>
                    <div v-else-if="td.component.handler == 'formtext'">{{ getLabel(td.component) }}</div>
                    <div v-else-if="td.component.handler == 'formeditor'">
                      <Input :value="getLabel(td.component)" type="textarea" />
                    </div>
                    <div v-else-if="td.component.handler == 'formdivider'">
                      <div style="width:100%;height:1px;" class="bg-grey"></div>
                    </div>
                    <div v-else-if="td.component.handler == 'formstaticlist'">
                      <Button>添加数据</Button>
                    </div>
                    <div v-else-if="td.component.handler == 'formcascadelist'">
                      <Select :value="getLabel(td.component)" style="width:80%">
                        <Option :value="getLabel(td.component)">{{ getLabel(td.component) }}</Option>
                      </Select>
                    </div>
                    <div v-else-if="td.component.handler == 'formdynamiclist'">
                      <Button>添加数据</Button>
                    </div>
                    <div v-else-if="td.component.handler == 'formresoureces'">
                      <Button><i class="tsfont-plus"></i>执行目标</Button>
                    </div>
                    <div v-else-if="td.component.handler == 'protocol'">
                      <Select :value="getLabel(td.component)">
                        <Option :value="getLabel(td.component)">{{ getLabel(td.component) }}</Option>
                      </Select>
                    </div>
                    <div v-else></div>
                  </div>
                  <div
                    v-else
                    class="item-content"
                    v-html="td.content"
                  ></div>
                  <div style="position:absolute;top:0;left:0;bottom:0;right:0;z-index:9;"></div>
                </template>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
      <div v-else>暂无可供选择的行</div>
    </div>
  </div>
</template>

<script>
export default {
  name: '',
  components: {},
  props: {
    value: [Array, Boolean],
    sheetsConfig: Object,
    controllerList: Array
  },
  data() {
    return {
      rowlist: {}, //原来从外层带过来的布局数据
      selectedList: [], //选中行
      deleteList: [], //需删除的列行
      lefterList: [],
      tableList: [],
      headerList: [],
      mergeList: []
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {
    this.getDelete();
  },

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    getMergeCell(td, action) {
      let mergecell = { colspan: 1, rowspan: 1 };
      let _this = this;
      if (td) {
        if (_this.mergeList && _this.mergeList.length > 0) {
          _this.mergeList.forEach(me => {
            if (me.col === td.col && me.row === td.row) {
              _this.$set(mergecell, 'colspan', me.colspan);
              _this.$set(mergecell, 'rowspan', me.rowspan);
            }
          });
        }
      }
      return mergecell[action];
    },
    showTd(td) {
      let isShow = true;
      if (td) {
        const deleteList = this.deleteList;
        if (deleteList && deleteList.length > 0) {
          deleteList.forEach(de => {
            if (de.col == td.col && de.row == td.row) {
              isShow = false;
            }
          });
        }
      }
      return isShow;
    },
    getDelete() {
      let demodata = this.$utils.deepClone(this.sheetsConfig);
      let tablelists = [];
      demodata.tableList.forEach((tr, i) => {
        let trlist = [];
        tr.forEach((td, j) => {
          if (td) {
            if (td.component || td.content != null) {
              trlist.push(td);
            } else {
              trlist.push({
                row: i,
                col: j,
                content: td
              });
            }
          } else {
            trlist.push({
              row: i,
              col: j,
              content: ''
            });
          }
        });
        tablelists.push(trlist);
      });
      this.tableList = tablelists;
      this.lefterList = demodata.lefterList || [];
      this.headerList = demodata.headerList || [];
      this.mergeList = demodata.mergeList || [];
      this.deleteList = [];
      if (this.mergeList && this.mergeList.length > 0) {
        const mergeG = this.mergeList;
        for (var i = 0; i < mergeG.length; i++) {
          var mergeg = mergeG[i];
          for (var c = 0; c < mergeg.colspan; c++) {
            for (var r = 0; r < mergeg.rowspan; r++) {
              if (c != 0 || r != 0) {
                this.deleteList.push({
                  col: mergeg.col + c,
                  row: mergeg.row + r
                });
              }
            }
          }
        }
      }
    },
    toggleRow(ind) {
      if (this.selectedList && this.selectedList.length > 0) {
        if (this.selectedList.indexOf(ind) > -1) {
          let turn = this.selectedList.indexOf(ind);
          this.selectedList.splice(turn, 1);
        } else {
          this.selectedList.push(ind);
        }
      } else {
        this.selectedList.push(ind);
      }
      this.selectedList.sort(this.$utils.sortNumber());
    },
    getStyle(td) {
      let styleJson = {};
      if (td.component) {
        styleJson.textAlign = 'left';
      } else if (td.content) {
        styleJson.textAlign = 'right';
      }
      styleJson = Object.assign(styleJson, td.style);
      return styleJson;
    }
  },

  filter: {},

  computed: {
    setColWith() {
      return function(w, headerList) {
        let sum = 0;
        headerList &&
          headerList.forEach(item => {
            sum = sum + Math.floor(item);
          });
        return (w / sum) * 100 + '%';
      };
    },
    setCheck() {
      return function(ind) {
        let classStr = 'checkbox-container';
        if (this.selectedList && this.selectedList.indexOf(ind) > -1) {
          classStr += ' selected';
        }
        return classStr;
      };
    },
    setTr() {
      return function(ind) {
        let classStr = 'row-tr';
        if (this.selectedList && this.selectedList.indexOf(ind) > -1) {
          classStr += ' selected';
        }
        return classStr;
      };
    },
    getLabel() {
      return function(com) {
        let labelname = '';
        if (this.controllerList && this.controllerList.length > 0) {
          this.controllerList.forEach(c => {
            if (c.uuid == com.uuid) {
              labelname = c.label;
            }
          });
        }
        return labelname;
      };
    }
  },

  watch: {
    value: {
      handler: function(val) {
        this.selectedList = val || [];
      },
      immediate: true
    },
    selectedList: {
      handler: function(val) {
        this.$emit('update-value', val);
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.row-tr {
  cursor: pointer;
}
.component-td {
  border-width: 1px;
  border-style: solid;
}
</style>
