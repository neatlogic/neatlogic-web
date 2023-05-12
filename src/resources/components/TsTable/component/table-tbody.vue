/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <draggable
    v-if="tbodyList.length && theadList.length"
    :list="list"
    :disabled="!canDrag"
    :animation="150"
    tag="tbody"
    handle=".drag-handle"
    class="tbody-main"
    draggable="tr"
    @end="updateRowSort"
  >
    <template v-for="(bitem, bindex) in list">
      <tr
        :key="bindex"
        :class="setRowClass(bitem, selectList, bindex)"
        :style="setTr()"
        @click="clickTr(bitem, bindex, $event)"
      >
        <th v-if="columnList && columnList.length" :style="fixLeft">
          <div>{{ columnList[bindex].displayName }}</div>
        </th>
        <td v-if="canDrag" class="drag-container drag-handle" style="cursor:move;">
          <slot v-if="isMain" name="drag-handle"><i class="tsfont-drag"></i></slot>
        </td>
        <td
          v-for="(hitem, hindex) in theadList"
          :key="hitem.uuid || hindex"
          :class="getClassName(bitem, hitem, bindex)"
          :style="setTd()"
          @click="clickTd($event, bitem, hitem)"
        >
          <div :class="hitem.key == 'action' ? (hideAction ? 'action-div' : 'action-div nohide') : ''" :style="hitem.key == 'action' ? getActionPostion(offsetWidth, scrollLeft) : ''">
            <slot :name="hitem.key" :row="bitem" :index="bindex">
              <div
                v-if="hitem.key == 'selection'"
                class="radius-mi"
                :class="getSection(bitem.isDisabled || false, selectList.indexOf(bitem[keyName] || bindex) > -1 || false)"
                @click.stop="selectOne(bitem, bindex)"
              ></div>
              <div
                v-else-if="hitem.key == 'expander'"
                class="radius-mi text-href"
                :class="getExpandClass(bitem)"
                @click.stop="expandOne(bitem)"
              ></div>
              <div v-else-if="hitem.key == 'action'" @click.stop>
                <div class="tstable-action">
                  <ul class="tstable-action-ul">
                    <li v-for="btn in bitem.action" :key="btn.name">{{ btn.text }}</li>
                  </ul>
                </div>
              </div>
              <div v-else>
                <div v-if="hitem.type">
                  <div
                    v-if="hitem.type == 'linktext'"
                    class="text-href"
                    :class="hitem.textStyle"
                    @click.stop="operation(bitem, hitem.textValue)"
                  >
                    {{ bitem['' + hitem.key + ''] }}
                  </div>
                  <span v-else-if="hitem.type == 'time'" :class="hitem.textStyle">
                    {{ bitem['' + hitem.key + ''] | formatDate }}
                  </span>
                  <span v-else-if="hitem.type == 'company'">
                    {{ bitem['' + hitem.key + ''] }} {{ hitem.value }}
                  </span>
                  <span v-else-if="hitem.type == 'html'" :class="hitem.textStyle" v-html="bitem['' + hitem.key + '']"></span>
                  <span v-else-if="hitem.type == 'startEndTime'" :class="hitem.textStyle">
                    {{ bitem['' + hitem.key + ''] | formatDate }} ~ {{ bitem['' + hitem.keyend + ''] | formatDate }}
                  </span>
                  <span v-else-if="hitem.type == 'TextLinkList'">
                    <span
                      :key="hitem.key"
                      :class="row['' + hitem.textStyle + '']"
                      class="text-href"
                      @click.stop="operation(bitem, hitem.textValue)"
                    >
                      {{ rowList(bitem['' + hitem.key + ''], hitem.valueKey) }}
                    </span>
                  </span>
                  <span v-else-if="hitem.type == 'textList'">
                    <span
                      :key="hitem.key"
                      :class="row['' + hitem.textStyle + '']"
                      class="text-href"
                      @click.stop="operation(bitem, hitem.textValue)"
                    >
                      {{ rowList(bitem['' + hitem.key + ''], hitem.valueKey) }}
                    </span>
                  </span>
                  <span v-else-if="hitem.type == 'statusList'" v-html="statesList(bitem['' + hitem.key + ''], hitem.stateArr)">
                  </span>
                  <span v-else-if="hitem.type == 'switch'" :class="hitem.textStyle" @click.stop>
                    <i-switch
                      :key="bitem['' + hitem.key + '']"
                      v-model="bitem['' + hitem.key + '']"
                      :true-value="hitem.stateArr[0]"
                      :false-value="hitem.stateArr[1]"
                      @on-change="operation(bitem, hitem.textValue)"
                    ></i-switch>
                  </span>
                  <span v-else-if="hitem.type == 'user'" @click.stop>
                    <span v-if="typeof bitem['' + hitem.key + ''] == 'string'">
                      <UserCard
                        v-if="bitem['' + hitem.key + '']"
                        :initType="bitem['' + hitem.key + ''].initType"
                        :uuid="bitem['' + hitem.key + ''].uuid || bitem['' + hitem.key + '']"
                      ></UserCard>
                    </span>
                    <span v-else-if="typeof bitem['' + hitem.key + ''] == 'object'">
                      <UserCard v-bind="bitem['' + hitem.key + '']" hideAvatar></UserCard>
                    </span>
                    
                  </span>
                  <span v-else-if="hitem.type == 'usercards'" :class="hitem.textStyle" @click.stop>
                    <GroupList :dataList="bitem['' + hitem.key + '']"></GroupList>
                  </span>
                  <span v-else-if="hitem.type == 'status'" :class="hitem.textStyle">
                    <Status type="text" :config="bitem['' + hitem.key + '']"></Status>
                  </span>
                  <!-- Status -->
                  <span v-else-if="hitem.type == 'tag'" :class="hitem.textStyle" @click.stop>
                    <span v-if="hitem.valueKey">
                      <GroupList :dataList="bitem['' + hitem.key + '']" type="tag" :textName="hitem.valueKey"></GroupList>
                    </span>
                    <span v-else>
                      <GroupList :dataList="bitem['' + hitem.key + '']" type="tag"></GroupList>
                    </span>                    
                  </span>
                  <span v-else-if="hitem.type == 'file'">
                    <TdFile :list="bitem[hitem.key]"></TdFile>
                  </span>
                  <span v-else>
                    {{ getTdValue(bitem, hitem.key) }}
                  </span>
                </div>
                <div v-else>
                  <span v-if="hitem.maxLength && bitem[''+hitem.key+''] && bitem[''+hitem.key+''].length > hitem.maxLength">
                    <!-- <Poptip word-wrap max-width="200">
                      <div slot="content">
                        {{ bitem[''+hitem.key+''] }}
                      </div>
                      <span class="cursor">{{ bitem[''+hitem.key+''].substr(0, Number(hitem.maxLength)) }}...</span>
                    </Poptip> -->
                    <span :title="bitem[''+hitem.key+'']">{{ bitem[''+hitem.key+''].substr(0, Number(hitem.maxLength)) }}...</span>
                  </span>
                  <span v-else>{{ bitem[''+hitem.key+''] }}</span>
                  <!-- {{ getTdValue(bitem, hitem.key) }}  之前的方法-->
                </div>

              </div>
            </slot>
            <!-- 箭头方法点击隐藏 -->
            <div v-if="hideAction && hitem.key == 'action'" class="btn-hideaction action-bg" @click.stop="toggleShowaction(bindex)">
              <i class="tsfont-right text-primary btn-hideicon"></i>
              <!-- 点击箭头→ -->
            </div>
          </div>
        </td>
      </tr>
      <!-- :key="'expand_' + bitem[keyName] || bindex" 之前的 -->
      <tr
        v-if="canExpand"
        :key="'expand_' + backfn(bindex, bitem ,keyName)"
        :style="bitem['_expand'] ? 'display:table-row' : 'display:none;'"
        class="folder-tr"
      >
        <td :colspan="colsList.length" :style="setTd()">
          <slot name="expand" :row="bitem"></slot>
        </td>
      </tr>
      <template v-else></template>
    </template>
  </draggable>
</template>
<script>
import draggable from 'vuedraggable';
export default {
  name: 'TBody',
  components: {
    draggable,
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    GroupList: resolve => require(['@/resources/components/GroupList/GroupList.vue'], resolve),
    Status: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    TdFile: resolve => require(['./td-file.vue'], resolve)
  },
  filters: {},
  props: {
    tbodyList: {
      type: Array,
      default: function() {
        return [];
      }
    },
    theadList: Array,
    columnList: Array,
    selectList: Array,
    canDrag: Boolean,
    keyName: {
      type: String
    },
    classKey: {
      type: [String, Array]
    },
    scrollLeft: Number,
    offsetWidth: Number,
    hideAction: {
      //是否可以收起浮动操作栏
      type: Boolean,
      default: true
    },
    isMain: {
      type: Boolean,
      default: false
    },
    canSelectRow: {
      type: Boolean,
      default: false
    },
    colsList: {
      type: Array,
      default: function() {
        return [];
      }
    },
    canExpand: Boolean,
    disabled: {
      //true  false  默认为false
      type: Boolean,
      default: false
    },
    multiple: {
      //是否支持选中多行
      type: Boolean,
      default: true
    },
    isExpand: {
      //是否有展开更多
      type: Boolean,
      default: false      
    },
    theme: Object, //自定义主题,
    canResize: Boolean
  },
  data() {
    return {
      actionstatusList: [], //操作栏是否展开状态
      cellWidthList: [], //每一行的每个单元格的宽度数组集合
      tableWidth: '100%',
      list: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    let _this = this;
    if (_this.$el && _this.$el.rows && _this.$el.rows.length) {
      let cellWidthList = [];
      let arr = Array.from(_this.$el.rows[0].cells);
      arr.forEach(c => {
        cellWidthList.push(c.offsetWidth);
      });
      _this.cellWidthList = cellWidthList;
      _this.$emit('getTbodyWidth', 'list', _this.cellWidthList);
    }
  },
  beforeUpdate() {},
  updated() {
    this.tableWidth = this.$el.getBoundingClientRect().width;
    this.$emit('setWidth');// 解决表格操作按钮，获取宽度不正确问题，导致右键菜单渲染问题不正确问题
  },
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    updateRowSort(event) {
      this.$emit('updateRowSort', event, this.list);
    },
    onStart(event) {
    },
    backfn(bindex, bitem, keyName) {
      let name = '';
      if (!keyName && !bitem['' + keyName + ''] && bitem['' + keyName + ''] != 0 && keyName != 0) {
        name = bindex;
      } else {
        name = bitem['' + keyName + ''];      
      }
      return name;
    },
    removeCommentNode(el) {
      //修复draggable的bug——将注释当成一个子节点拖拽排序
      if (el && el.childNodes && el.childNodes.length) {
        el.childNodes.forEach(c => {
          if (c.nodeType && c.nodeType == 8) {
            el.removeChild(c);
          }
        });
      }
    },
    setTr() {
      if (this.theme) {
        let table = this.theme.TsTable;
        if (table) {
          let themeConfig = this.$utils.mergeObj(this.theme.common, table.tr);
          return themeConfig;
        }
      }
    },    
    setTd() {
      if (this.theme) {
        let table = this.theme.TsTable;
        if (table) {
          let themeConfig = this.$utils.mergeObj(this.theme.common, table.td);
          return themeConfig;
        }
      }
    },
    clickTr(item, index, evt) {
      //后期需求调整为点击整行就是选中，去掉点击是否是选择框的判断
      let canSelect = this.theadList.find(t => {
        return t.key == 'selection';
      });
      //if (this.canSelectRow && canSelect) {
      if (this.canSelectRow) {
        this.$emit('selectOne', item, index, evt);
      }
      this.$emit('clickTr', item, index, evt);
    },
    toggleShowaction(index, type) {
      if (type) {
        this.actionstatusList[index] = false;
      } else {
        this.$set(this.actionstatusList, index, !this.actionstatusList[index]);
      }
    },
    operation(row, index) {
      this.$emit('operation', row, index);
    },
    statesList(value, stateArr) {
      let name = '';
      let html = '';
      let textStyle = '';
      stateArr.forEach(v => {
        if (v.value == value) {
          name = v.name;
          textStyle = v.textStyle || '';
        }
      });
      html = '<span class="' + textStyle + '">' + name + '</span>';
      return html;
    },
    rowList(row, valueKey) {
      let name = '';      
      if (row.length > 0) {
        row.forEach(v => {
          name += v['' + valueKey + ''] + ',';
        });
        name = name.substr(0, name.length - 1);
      } else {
        name = '';
      }
      return name;
    },
    clickTd(event, bitem, hitem) {
      if (hitem.key === 'action' || hitem.key === 'selection') {
        event.stopPropagation();
      }
    },
    selectOne(item, index) {
      this.$emit('selectOne', item, index);
    },
    expandOne(row) {
      this.$emit('toggleExpand', row);
    }
  },
  computed: {
    setRowClass() {
      return (row, selectedlist, index) => {
        let classStr = '';
        let keyName = this.keyName ? row[this.keyName] : index;
        if (!this.classKey) {
          classStr += 'tstable-tr';
        } else {
          if (typeof this.classKey == 'string') {
            classStr += 'tstable-tr trtype-' + row[this.classKey] + ' ' + row[this.classKey];
          } else {
            let classList = this.classKey.map(c => {
              return row[c];
            });
            classStr += 'tstable-tr ' + classList.join(' ');
          }
        }
        if (selectedlist && selectedlist.length && selectedlist.indexOf(keyName) > -1) {
          classStr += ' selected';
        }
        let canSelect = this.theadList.find(t => {
          return t.key == 'selection';
        });
        if (canSelect) {
          classStr += ' cursor-pointer';
        }
        return classStr;
      };
    },
    setActionwidth() {
      let style = { width: 0 };
      Object.assign(style, {
        width: this.actionwidth + 8 + 'px'
      });
      return style;
    },
    getClassName() {
      let _this = this;
      return function(bitem, hitem, bindex) {
        let sectionList = '';
        if (hitem.className) {
          sectionList += hitem.className;
        }
        if (this.actionstatusList[bindex] == true) {
          sectionList += ' hideAction';
        }
        if (hitem.key == 'action') {
          sectionList += ' action-tr';
        }

        //如果指定了宽度则换行
        let keyList = ['action', 'selection'];
        let findCol = _this.colsList.find(cc => cc.key == hitem.key + 'Width');
        if (findCol && !keyList.includes(hitem.key) && (typeof findCol.width == 'number' || findCol.width) && !this.canResize) {
          sectionList += ' td-wrap';
        }
        return sectionList;
      };
    },
    getExpandClass() {
      return function(row) {
        if (row['_expander'] != false) {
          if (row['_expand']) {
            return 'tsfont-minus-square';
          } else {
            return 'tsfont-plus-square';
          }
        }
      };
    },
    getSection() {
      return function(isDisabled, isSelected) {
        let sectionList = 'tstable-selection';
        if (!this.multiple) {
          sectionList += ' radio';
        }
        if (isDisabled || this.disabled) {
          sectionList += ' disabled';
        }
        if (isSelected) {
          sectionList += ' selected';
        }
        return sectionList;
      };
    },
    getTdValue() {
      return function(item, key) {
        if (key) {
          const pathList = key.split('.');
          return pathList.reduce((result, path) => {
            return result[path];
          }, item);
        } else {
          return '';
        }
      };
    },    
    getActionPostion() {
      return function(width, scrollleft) {
        return {
          right: Math.max((width - scrollleft + 24), 24) + 'px'
        };
      };
    },
    fixLeft() {
      let translateStyle = '';
      if (this.scrollLeft && this.scrollLeft > 0) {
        translateStyle = 'translate3d(' + (this.scrollLeft % 2 == 0 ? Math.floor(this.scrollLeft) : Math.floor(this.scrollLeft) - 1) + 'px,0,0)';
      } else {
        translateStyle = 'none';
      }
      return {
        transform: translateStyle
      };
    }
  },
  watch: {
    tbodyList: {
      handler: function(val) {
        let _this = this;
        this.list = this.canDrag ? this.$utils.deepClone(val) : val;
        //this.list = val;
        if (_this.$el && _this.$el.rows && _this.$el.rows.length) {
          _this.$nextTick(() => {
            let cellWidthList = [];
            let arr = Array.from(_this.$el.rows[0].cells);
            arr.forEach(c => {
              cellWidthList.push(c.offsetWidth);
            });
            _this.cellWidthList = cellWidthList;
            _this.$emit('getTbodyWidth', 'list', _this.cellWidthList);
            _this.$emit('getTbodyWidth', 'list', _this.$el.getBoundingClientRect().width);
          });
        }
      },
      deep: true,
      immediate: true
    },
    tableWidth: {
      handler: function(val) {
        this.$emit('getTbodyWidth', 'total', val);
      },
      deep: true,
      immediate: true
    },
    scrollLeft: {
      handler: function(val) {
        //this.$emit('getTbodyWidth', 'total', val);
      },
      deep: true,
      immediate: true
    },
    list: {
      handler: function(val) {
        //由于list是来自tbodyList的deepClone，当list经过一系列操作后恢复到初始状态，将不触发updateTbodyList。如果希望触发，则需要在updateTbodyList方法中重新的tbodyList进行重新赋值
        const isSame = this.$utils.isSame(val, this.tbodyList);
        if (!isSame) {
          this.$emit('updateTbodyList', val);
        }
      },
      deep: true,
      immediate: true      
    }
  }
};
</script>
