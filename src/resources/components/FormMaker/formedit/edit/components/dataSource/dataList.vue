<template>
  <div class="dataList">
    <!-- start_静态数据源 -->
    <div class="static-main">
      <div class="input-border">
        <div class="static-title">
          <label class="formsetting-label text-grey require-label" style="line-height: 1;margin-bottom: 8px;width: 110px;">值</label>
          <label class="formsetting-label text-grey require-label" style="line-height: 1;margin-bottom: 8px;width: 130px;">显示文字</label>
        </div>
        <draggable
          v-if="dataList && dataList.length > 0"
          tag="ul"
          class="dataSource-ul"
          :list="dataList"
          handle=".tsfont-bar"
          ghost-class="bg-primary"
        >
          <li v-for="(item, index) in dataList" :key="index">
            <TsFormInput
              ref="valueValid"
              v-model="item.value"
              placeholder="请输入值"
              style="width: 110px;padding-right: 5px;display: inline-block;vertical-align: top;"
              maxlength="50"
              :index="index"
              :text="'text'"
              :validateList="validJson"
              @on-blur="autocompleteText(item, index)"
            ></TsFormInput>
            <TsFormInput
              ref="textValid"
              v-model="item.text"
              placeholder="请输入显示文字"
              style="width: 130px;display: inline-block;vertical-align: top;"
              maxlength="50"
              :index="index"
              :text="'value'"
              :validateList="validJson"
            ></TsFormInput>
            <span
              v-if="dataList.length <= 500"
              class="tsfont-plus-o span-btn btn-add"
              title="新增"
              @click="addOption(index)"
            ></span>
            <span
              v-if="dataList.length > 1"
              class="tsfont-minus-o span-btn btn-remove"
              title="删除"
              @click="removeOption(index)"
            ></span>
            <span v-if="dataList.length > 1" class="tsfont-bar span-btn btn-move" title="移动"></span>
          </li>
        </draggable>
      </div>
    </div>
    <!-- end_静态数据源 -->
  </div>
</template>
<script>
import draggable from 'vuedraggable';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
let _this;
export default {
  name: 'DataList',
  components: {
    draggable,
    TsFormInput
  },
  props: {
    dataList: {
      type: Array,
      default: () => [{ value: '', text: '' }]
    },
    level: {
      type: [Number, String],
      default: 1
    }
  },

  data() {
    let _this = this;
    return {
      validJson: _this.level > 1 ? [{
        name: 'isAllEmpty',
        trigger: 'change',
        validator(rule, value, _vue) {
          if (_vue) {
            let index = _vue.$el.getAttribute('index');
            let text = _vue.$el.getAttribute('text');
            if (typeof value == 'string' && value.trim() != '') {
              return true;
            } else if (_this.dataList[index][text]) {
              return false;
            } else {
              _this.$refs[text + 'Valid'][index].validMesage = '';
            } 
          }
          return true;
        },
        message: '请输入内容'
      }] : ['required']
    };
  },
  created() {},
  mounted() {
    _this = this;
  },
  destroyed() {},
  methods: {
    addOption(index) {
      //新增下拉选项
      this.dataList.splice(index + 1, 0, { value: '', text: '' });
    },
    removeOption(index) {
      //移除下拉选项
      this.$delete(this.dataList, index);
      this.$emit('changeDefaultValue');
    },

    autocompleteText(item, index) {
      //失焦后，如果下拉显示为空，自动把值赋值过来
      let somevalue = 0;
      let value = item.value;
      if (value && !getDefaultValue(this.dataList, value, index)) {
        for (let a = 1; ; a++) {
          value = item.value + '_' + a;
          if (getDefaultValue(this.dataList, value)) {
            break;
          }
        }
      }

      item.value = value;

      if (!item.text && item.value) {
        item.text = item.value;
      }
      this.$forceUpdate();
      value && this.$emit('changeDefaultValue');
    },
    validComponent() {
      let _this = this;
      let validList = [];
      let val = [];
      let hasNull = false; //是否含有空的静态数据
      this.$refs.valueValid && this.$refs.valueValid.forEach(item => item.valid());
      this.$refs.textValid && this.$refs.textValid.forEach(item => item.valid());
      _this.dataList &&
        _this.dataList.forEach((item, a) => {
          if (item.value == '' && !hasNull) {
            hasNull = true;
            validList.push('静态数据源：值不可以为空');
          }
          if (item.text == '' && !hasNull) {
            hasNull = true;
            validList.push('静态数据源：显示值不可以为空');
          }
          if (item.isDefaultValue) {
            //默认选中数据处理
            val.push(item.value);
          }
        });
      return validList;
    }
  },
  computed: {},
  watch: {}
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
@import (reference) '~@/resources/assets/css/variable.less';
.dataList {
  .static-main {
    .static-title {
      padding-right: 70px;
      opacity: 0.6;
    }
    .dataSource-ul {
      list-style: none;
      > li {
        position: relative;
        padding-right: 70px;
        margin-bottom: 8px;
        .span-btn {
          width: 20px;
          height: 28px;
          line-height: 28px;
          text-align: center;
          position: absolute;
          top: 2px;
          right: 0;
          cursor: ns-resize;
          vertical-align: middle;
          &.btn-add {
            right: 40px;
            cursor: pointer;
          }
          &.btn-remove {
            right: 20px;
            cursor: pointer;
          }
        }
      }
    }
  }
  .bg-primary {
    background-color: fade(@primary-color, 10%);
  }
}
</style>
