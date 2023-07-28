<template>
  <div
    v-click-outside:false="onClickOutside"
    v-click-outside:false.mousedown="onClickOutside"
    v-click-outside:false.touchstart="onClickOutside"
    class="select-container"
    tabindex="1"
    @click.stop
    @keydown.tab="handleKeydown"
  >
    <div v-if="!disabled">
      <Poptip
        ref="pop"
        v-model="isshow"
        :trigger="trigger"
        :width="popWidth"
        placement="bottom-start"
        transfer
        class="select-poptip"
      >
        <div
          ref="selectBox"
          class="type-select text-action bg-op overflow radius-sm"
          :class="isshow?'border-primary':'border-color'"
          :style="getStyle"
        >
          <span v-if="selectValue">{{ showName(selectValue) }}</span>
          <span v-else class="text-tip">{{ placeholder }}</span>
          <i class="tsfont-down select-icon"></i>
          <i v-if="clearable" class="clearBtn text-icon ivu-icon tsfont-close-s bg-op" @click.stop="clearValue"></i>
        </div>
        <div slot="content" ref="dropdown" @click.stop>
          <div class="content-box">
            <div
              v-for="(item,index) in list"
              :key="index"
              class="content-list dividing-color text-action"
              :class="{'text-href':item[valueName] == selectValue}"
              @click="changeValue($event,item)"
            >
              <div class="type-name" :style="{'min-width':popLable+'px'}">
                <span v-if="isIcon" class="icon-type text-grey" :class="iconConfig[item[valueName]]?iconConfig[item[valueName]]:'tsfont-forminput'"></span>
                <span>{{ item[textName] }}</span>
              </div>
              <div class="text-tip type-tip pl-sm">{{ item.description }}</div>
            </div>
          </div>
        </div>
      </Poptip>
      <input
        type="text"
        class="hidden"
        :placeholder="placeholder"
        @focus="toggleShow(true)"
      >
      <transition name="fade">
        <slot name="validMessage">
          <span
            v-if="validMesage != ''"
            class="form-error-tip"
            :title="validMesage"
            v-html="validMesage"
          ></span>
        </slot>
      </transition>
    </div>
    <div v-else>
      <div class="type-select border-color bg-disabled radius-sm tsform-edit-readonly" :style="getStyle">{{ showName(value) }}</div>
    </div>
  </div>
</template>
<script>
import { directive as ClickOutside } from '@/resources/directives/v-click-outside-x.js';
export default {
  name: 'PoptipSelect',
  directives: { ClickOutside },
  components: {
  },
  filters: {},
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    value: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    trigger: { type: String, default: 'click' },
    width: { //输入数值    输入百分比
      type: [String, Number],
      default: '100%'
    },
    popLable: {
      type: Number,
      default: 90
    },
    valueName: {
      //value渲染值
      default: 'value'
    },
    textName: {
      //text渲染值
      default: 'text'
    },
    isIcon: { //是否显示图标
      type: Boolean,
      default: false
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default() {
        return this.$t('page.pleaseselect');
      }
    },
    errorMessage: {
      type: String,
      default() {
        return this.$t('page.pleaseselect');
      }
    }
  },
  data() {
    return {
      isshow: false,
      selectValue: '',
      popWidth: 460,
      iconConfig: {
        text: 'tsfont-forminput', //文本输入
        password: 'tsfont-lock', //密码
        file: 'tsfont-wenjian', //文件
        date: 'tsfont-calendar', //日期
        datetime: 'tsfont-riqishijian', //日期时间
        json: 'tsfont-json', //json
        select: 'tsfont-formselect', //下拉单选
        multiselect: 'tsfont-formselectcascader', //下拉多选
        time: 'tsfont-formtime', //时间
        radio: 'tsfont-circle-o', //单选
        checkbox: 'tsfont-check-square', //复选
        node: 'tsfont-blocks', //节点
        account: 'tsfont-userinfo', //账号
        textarea: 'tsfont-formtextarea', //文本域
        phase: 'tsfont-stage', //阶段
        switch: 'tsfont-canvas', //开关
        userselect: 'tsfont-group'
      },
      validMesage: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.updatePosition();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeValue(event, item) {
      let value = item ? item[this.valueName] : '';
      if (this.$utils.isSame(this.selectValue, value)) {
        return;
      }
      this.selectValue = value;
      this.isshow = false;
      this.$emit('change', this.selectValue);
      this.$emit('on-keydown', event, this.selectValue);
      this.validMesage = '';
    },
    onClickOutside(event) {
      const $el = this.$refs.dropdown ? this.$refs.dropdown || null : null;
      if (!$el || $el === event.target || $el.contains(event.target)) {
        return;
      }
      this.isshow = false;
    },
    updatePosition() {
      if (this.$el) {
        let width = this.$el.querySelector('.type-select').clientWidth;
        if (width > this.popWidth) {
          this.popWidth = width;
        }
      }
    },
    handleKeydown(e) {
      //切tab的时候隐藏
      if (e.key == 'Tab' && e.type == 'keydown') {
        if (this.isshow) {
          this.isshow = false;
        }
      }
    },
    toggleShow(status) {
      if (!this.isshow && status) {
        this.isshow = true;
      }
    },
    clearValue() {
      //清除数据
      this.selectValue = '';
      this.$emit('change', this.selectValue);
    },
    valid() {
      let isValid = true;
      if (this.isRequired && !this.selectValue) {
        isValid = false;
        this.validMesage = this.errorMessage;
      } else {
        this.validMesage = '';
      }
      return isValid;
    }
  },
  computed: {
    showName() {
      return function(val) {
        let textName = '';
        let findItem = this.list.find(i => i[this.valueName] == val);
        if (findItem) {
          textName = findItem[this.textName];
        }
        return textName;
      };
    },
    getStyle: function() {
      let _this = this;
      let resultJson = {};

      if (typeof _this.width == 'number') {
        resultJson.width = _this.width + 'px';
      } else if (typeof _this.width == 'string') {
        resultJson.width = _this.width;
      }
      return resultJson;
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val && val != '') {
          this.selectValue = val;
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
.content-box{
  max-height: 330px;
}
.content-list{
  display: flex;
  align-items: flex-start;
  &:not(:last-child){
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom:1px solid;
  }
  .type-name{
    // min-width: 70px;
    // padding-right: 10px;
  }
  .type-tip{
    width: 100%;
    height: 100%;
    white-space: normal;
  }
}
.type-select{
  position: relative;
  width: 100%;
  height: 32px;
  line-height: 30px;
  padding: 0 21px 0 10px;
  border: 1px solid;
  .select-icon{
    position: absolute;
    right: 8px;
    top: 0;
  }
  .clearBtn {
    position: absolute;
    right: 2px;
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    padding: 2px;
    font-size: 14px;
    cursor: pointer;
    display: none;
    opacity: 1;
  }
  &:hover {
    .clearBtn {
      display: block;
    }
  }
}
/deep/ .ivu-poptip-rel,
.ivu-poptip{
  width: 100%;
}
.icon-type{
  padding-right: 10px;
}
</style>
