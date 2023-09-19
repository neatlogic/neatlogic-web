<template>
  <TsFormSelect
    :value="value"
    v-bind="getSetting"
    transfer
    :readonly="readonly"
    @on-change="updateval"
  ></TsFormSelect>
</template>

<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import sheetCompontMixins from '@/resources/mixins/sheetCompontMixins.js';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  mixins: [sheetCompontMixins],
  model: {
    prop: 'value',
    event: 'change'
  },

  props: {
    config: Object,
    value: [String, Boolean, Object, Array],
    level: {//层级关系
      type: Number,
      default: 2
    }, 
    column: {//选择列，或者 值 显示文案
      type: [Number, String],
      default: 'fa1c10219c0e4b78ba1148e8cd92706c'
    }, 
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {
    this.val = this.value;
  },

  mounted() {},

  beforeUpdate() {},

  updated() {},

  methods: {
    updateval(val) {
      this.$emit('change', val);
    },
    dealDataByUrl(nodeList) {
      //当默认值的引用类型是自定义  处理默认值的数据结构
      let columlist = [];
      let setting = this.config.config || {};
      let _this = this;
      let uuid = setting.mapping[_this.level - 1].value;
      nodeList.forEach(co => {
        if (co[this.column]) {
          if (_this.column != uuid) {
            columlist.push({
              text: co[_this.column].text,
              value: co[uuid].value + '&=&' + co[_this.column].text,
              html: co[_this.column].text + "<small class='text-grey'>(" + co[uuid].value + ')</small>'
            });
          } else {
            columlist.push({
              text: co[_this.column].text,
              value: co[uuid].value + '&=&' + co[_this.column].text,
              html: co[_this.column].text 
            });
          }
        }
      });
      return columlist;
    }
  },
  computed: {
    getSetting() {
      let json = {};
      let setting = this.config.config || {};
      if (setting.dataSource == 'matrix' && this.column && this.level && setting.mapping[this.level - 1] && setting.mapping[this.level - 1].value) { //矩阵获取数据
        let param = { matrixUuid: setting.matrixUuid };
        param.keywordColumn = this.column;
        param.valueField = setting.mapping[this.level - 1].value;
        param.textField = this.column;
        json.params = param;
        json.dynamicUrl = this.defaultSelfJson.defaultUrl;
        json.rootName = 'dataList';
        json.dealDataByUrl = this.dealDataByUrl;
        json.showName = 'html';
      } else if (setting.dataList) {
        json.dataList = getChildList(setting.dataList, this.level - 1);
      } else {
        json.dataList = [];
      }
      json.width = '100%';
      return json;
    }
  },
  watch: {}
};

function cascaderList(dataList, level) {
  let arr = [];
  if (!dataList || dataList.length <= 0) {
    return arr;
  }
  if (level == 1) {
    return arr.concat(dataList);
  } else {
    dataList.forEach(item => {
      arr = arr.concat(cascaderList(item.children, level - 1));
    });
  }
  return arr;
}

function getChildList(dataList, level) {
  let arr = cascaderList(dataList, level);
  return arr.filter((item, i) => {
    let data = arr.find((a, ia) => {
      if (a.value == item.value && ia < i) {
        return a;
      }
    });
    return !data;
  });
}
</script>
