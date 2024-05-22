<!--静态数据源编辑组件-->
<template>
  <div>
    <div class="flex-between">
      <div></div>
      <div class="text-grey flex-1">{{ $t('page.value') }}</div>
      <div class="text-grey flex-1">{{ $t('page.name') }}</div>
      <div v-if="needBatchEdit" class="btn-style"><span :class="disabled?'text-disabled':'text-href'" @click="openBatchEdit()">{{ $t('page.batchedit') }}</span></div>
    </div>
    <draggable
      v-if="dataListLocal && dataListLocal.length > 0"
      tag="ul"
      class="dataSource-ul"
      :list="dataListLocal"
      handle=".tsfont-bar"
      ghost-class="item-selected"
    >
      <div v-for="(item, index) in dataListLocal" :key="index" class="flex-between tab-item">
        <div v-if="dataListLocal.length > 1 && !disabled" class="pr-xs">
          <span
            class="tsfont-bar"
            style="cursor:move"
            :title="$t('page.move')"
          ></span>
        </div>
        <div class="pr-xs flex-1">
          <TsFormInput
            v-model="item.value"
            border="border"
            :validateList="['required']"
            maxlength="50"
            :disabled="disabled"
            @on-blur="autocompleteText(item, index)"
          ></TsFormInput>
        </div>
        <div class="pr-xs flex-1">
          <TsFormInput
            v-model="item.text"
            border="border"
            :validateList="['required']"
            maxlength="50"
            :disabled="disabled"
          ></TsFormInput>
        </div>
        <div class="text-right">
          <Poptip
            v-model="item._visible"
            transfer
            :disabled="disabled"
            placement="bottom-end"
          >
            <span class="tsfont-setting" :class="disabled?'text-disabled':'text-action'" @click="clickSetting()"></span>
            <div slot="content">

              <div class="tsfont-lightning border-base-bottom pb-xs text-action" @click="openReactionDialog(item, index)">{{ $t('term.framework.reactionsetting') }}</div>
              <div class="flex-start pt-xs">
                <div class="pr-sm">{{ $t('term.framework.hidetab') }}</div>
                <TsFormSwitch
                  v-model="item.isHide"
                  :falseValue="false"
                  :trueValue="true"
                  @on-change="changeHideSwitch(item)"
                ></TsFormSwitch>
              </div>
            </div>
          </Poptip>
          <span
            v-if="dataListLocal.length <= 500"
            class="tsfont-plus-o"
            :class="disabled?'text-disabled':'text-action'"
            style="padding:0px 4px"
            @click="addData(item, index)"
          ></span>
          <span
            v-if="dataListLocal.length > 1"
            class="tsfont-minus-o"
            :class="disabled?'text-disabled':'text-action'"
            @click="removeData(item, index)"
          ></span>
        </div>
      </div>
    </draggable>
    <div v-else><span v-if="!disabled" class="tsfont-plus text-href" @click="addData()">{{ $t('dialog.title.addtarget',{'target':$t('page.data')}) }}</span></div>
    <TsDialog
      v-if="isBatchEdit"
      :isShow="true"
      type="modal"
      :title="$t('term.autoexec.batchexportdata')"
      @on-close="isBatchEdit = false"
      @on-ok="confirmBatchEdit()"
    >
      <template v-slot>
        <div class="text-grey" v-html="$t('message.framework.staticbatchdatatip')">
        </div>
        <TsFormInput
          v-model="dataListString"
          type="textarea"
          :row="10"
          :placeholder="$t('page.value') + ',' + $t('page.name')"
        ></TsFormInput>
      </template>
    </TsDialog>
    <ReactionDialog
      v-if="isReactionShow"
      :formItem="tabItem"
      :formItemList="formItemList"
      @close="closeReactionDialog"
    ></ReactionDialog>
  </div>
</template>
<script>
import draggable from 'vuedraggable';

export default {
  name: '',
  components: {
    draggable,
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    ReactionDialog: () => import('@/resources/plugins/TsSheet/form-item-reaction-dialog.vue')
  },
  props: {
    needCopyValue: {type: Boolean, default: true}, //默认需要复制数据，避免内部修改影响原数据，cascader则不能复制，使用复制模式继承关系会断裂
    needBatchEdit: { type: Boolean, default: true },
    value: { type: Array },
    disabled: { type: Boolean, default: false },
    formItemList: Array
  },
  data() {
    return {
      isBatchEdit: false,
      dataListString: '',
      dataListLocal: null,
      isReactionShow: false,
      tabItem: {},
      tabIndex: null,
      reaction: { hide: {}, display: {}, readonly: {}, disable: {} }
    };
  },
  beforeCreate() {},
  created() {
    this.init();
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
    init() {
      this.dataListLocal = (this.needCopyValue ? this.$utils.deepClone(this.value) : this.value);
      if (!this.dataListLocal) {
        this.dataListLocal = [];
      }
    },
    clickSetting() {

    },
    //计算数据最大层次
    countLevel(level, dataList) {
      for (let i = 0; i < dataList.length; i++) {
        const data = dataList[i];
        if (data.children && data.children.length > 0) {
          return this.countLevel(level + 1, data.children);
        }
      }
      return level;
    },
    addData(item, index) {
      if (this.disabled) {
        return;
      }
      if (item) {
        this.$set(item, '_visible', false);
      }
      if (index) {
        this.dataListLocal.splice(index + 1, 0, { value: '', text: '' });
      } else {
        this.dataListLocal.push({ value: '', text: '' });
      }
    },
    removeData(item, index) {
      if (this.disabled) {
        return;
      }
      if (item) {
        this.$set(item, '_visible', false);
      }
      this.dataListLocal.splice(index, 1);
    },
    transferDataToString(parentList, dataList) {
      if (!parentList) {
        parentList = [];
      }
      let str = '';
      if (dataList && dataList.length > 0) {
        dataList.forEach(element => {
          if (element.value != '' && element.text != '') {
            if (str) {
              str += '\n';
            }
            for (let i = 0; i < parentList.length; i++) {
              str += '-';
            }
            str += element.value + ',' + element.text;
            if (element.children && element.children.length > 0) {
              const subParentList = this.$utils.deepClone(parentList);
              subParentList.push(element);
              str += '\n';
              str += this.transferDataToString(subParentList, element.children);
            }
          }
        });
      }
      return str;
    },
    transferStringToData(parentList, str) {
      let childIndex = 0;
      while (str.startsWith('-')) {
        str = str.substr(1);
        childIndex += 1;
      }
      let dataList = null;
      if (childIndex > 0) {
        const parentNode = parentList[childIndex - 1];
        if (parentNode) {
          if (!parentNode.children) {
            this.$set(parentNode, 'children', []);
          }
          dataList = parentNode.children;
        }
      } else {
        dataList = parentList;
      }
      const option = str.split(',');
      if (option.length == 1) {
        if (dataList.find(d => d.value == option[0])) {
          dataList.push({ value: option[0], text: option[0] });
        }
      } else if (option.length == 2) {
        if (!dataList.find(d => d.value == option[0])) {
          dataList.push({ value: option[0], text: option[1] });
        }
      }
      return dataList;
    },
    openBatchEdit() {
      if (this.disabled) {
        return;
      }
      let dataList = this.dataListLocal;
      this.dataListString = this.transferDataToString([], dataList);
      this.isBatchEdit = true;
    },
    confirmBatchEdit() {
      this.dataListLocal.splice(0);
      if (this.dataListString) {
        const elements = this.dataListString.split('\n');
        const regex = /^[\-]*/i;
        const dataList = [];
        let maxPrefixLen = 0;
        elements.forEach((element, index) => {
          const prefix = regex.exec(element);
          let prefixLen = 0;
          if (prefix != null) {
            prefixLen = prefix.toString().length;
            maxPrefixLen = Math.max(maxPrefixLen, prefixLen);
          }
          element = element.substr(prefixLen);
          const option = element.split(',');
          let parentData = null;
          if (prefixLen > 0) {
            parentData = this.findLast(dataList, index, prefixLen);
          }
          if (option.length == 1) {
            dataList.push({ _index: index, _parentIndex: parentData && parentData._index, _prefix: prefixLen, value: option[0], text: option[0] });
          } else if (option.length > 1) {
            dataList.push({ _index: index, _parentIndex: parentData && parentData._index, _prefix: prefixLen, value: option[0], text: option[1] });
          }
        });
        if (dataList.length > 0) {
          for (let i = dataList.length - 1; i >= 0; i--) {
            const data = dataList[i];
            if (data._parentIndex != null) {
              const parentData = dataList.find(d => d._index === data._parentIndex);
              if (parentData) {
                if (!parentData.children) {
                  parentData['children'] = [];
                }
                parentData.children.unshift(data);
                dataList.splice(i, 1);
              }
            }
          }
        }
        this.dataListLocal = this.clearData(dataList);
        const level = this.countLevel(1, this.dataListLocal);
        this.$emit('change-level', level);
      }
      this.isBatchEdit = false;
    },
    clearData(dataList) {
      dataList.forEach(d => {
        for (let key in d) {
          if (key.startsWith('_')) {
            delete d[key];
          }
          if (d.children && d.children.length > 0) {
            this.clearData(d.children);
          }
        }
      });
      return dataList;
    },
    findLast(dataList, index, prefix) {
      for (let i = dataList.length - 1; i >= 0; i--) {
        const d = dataList[i];
        if (d._index < index && d._prefix == prefix - 1) {
          return d;
        }
      }
      return null;
    },
    autocompleteText(item, index) {
      //失焦后，如果下拉显示为空，自动把值赋值过来
      let value = item.value;
      if (value && !getDefaultValue(this.dataListLocal, value, index)) {
        for (let a = 1; ; a++) {
          value = item.value + '_' + a;
          if (getDefaultValue(this.dataListLocal, value)) {
            break;
          }
        }
      }
      item.value = value;
      if (!item.text && item.value) {
        item.text = item.value;
      }
    },
    changeHideSwitch(item) {
      this.$set(item, '_visible', false);
    },
    openReactionDialog(item, index) {
      this.$set(item, '_visible', false);
      this.tabIndex = index;
      if (item.reaction) {
        this.tabItem = item;
      } else {
        this.tabItem = {
          ...item,
          reaction: this.$utils.deepClone(this.reaction)
        };
      }
      this.isReactionShow = true;
    },
    closeReactionDialog(reactionConf) {
      this.isReactionShow = false;
      if (reactionConf) {
        this.$set(this.dataListLocal[this.tabIndex], 'reaction', reactionConf);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    dataListLocal: {
      handler: function(val) {
        this.$emit('input', val);
      },
      deep: true
    }
  }
};
function getDefaultValue(list, value, index) {
  //判断是否有重复数据
  let isDefaultValue = true;
  for (let i = 0; i < list.length; i++) {
    if (typeof index != 'undefined' && index != i && list[i].value == value) {
      isDefaultValue = false;
      break;
    } else if (typeof index == 'undefined' && list[i].value == value) {
      isDefaultValue = false;
      break;
    }
  }
  return isDefaultValue;
}
</script>
<style lang="less" scoped>
.flex-1 {
  flex: 1;
}
.tab-item {
  &:not(:last-child) {
    padding-bottom: 10px;
  }
}
</style>
