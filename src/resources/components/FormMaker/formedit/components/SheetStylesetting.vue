<template>
  <div class="clearfix bg-grey">
    <ul class="sheetbuilder-styleul">
      <li v-for="(item, index) in styleConfig" :key="index" class="sheetbuilder-styleli">
        <!-- <Select v-if="index =='fontFamily'" :value="stylelist.fontFamily" style="width:84px;">
                  <Option v-for="(ditem, dindex) in item" :key="dindex" :value="dindex">{{ditem}}</Option>
        </Select>-->
        <Select v-if="index == 'fontSize'" v-model="styleLi.fontSize" style="width:68px;">
          <Option
            v-for="(ditem, dindex) in item"
            :key="dindex"
            :value="dindex"
            :style="setSize(dindex)"
          >{{ ditem }}</Option>
        </Select>
        <div
          v-else-if="index == 'fontWeight'"
          class="fw-switch"
          :title="weightConfig[styleLi.fontWeight]"
          @click="toggleFontweight"
        >
          <span :class="'fw-' + styleLi.fontWeight">B</span>
        </div>
        <div v-else-if="index == 'color'" class="color-li" :title="$t('page.fontcolor')">
          <ColorPicker
            v-model="styleLi.color"
            :colors="colorList"
            class="sheet-style-setting-bg"
            :editable="false"
          />
          <div class="style-txt" :style="{ color: styleLi.color }">
            A
            <div class="style-txt-bt" :style="{ background: styleLi.color }"></div>
          </div>
        </div>
        <div v-else-if="index == 'background'" class="color-li" :title="$t('page.backgroundcolor')">
          <ColorPicker
            v-model="styleLi.background"
            class="sheet-style-setting-bg"
            :editable="false"
            :colors="colorList"
          />
          <div class="style-bg bg-op" :style="{ background: styleLi.background,color: styleLi.color}">A</div>
        </div>
        <div v-else-if="index == 'verticalAlign'" class="action-group align-group">
          <span
            v-for="(ditem, dindex) in item"
            :key="dindex"
            :class="ditem == styleLi.verticalAlign ? 'action-item active tsfont-vertical-' + ditem : 'action-item tsfont-vertical-' + ditem"
            :title="verticalConfig[ditem]"
            @click="adjustVertical(ditem, item)"
          ></span>
        </div>
        <div v-else-if="index == 'textAlign'" class="action-group align-group">
          <span
            v-for="(ditem, dindex) in item"
            :key="dindex"
            :class="ditem == styleLi.textAlign ? 'action-item active tsfont-horizontal-' + ditem : 'action-item tsfont-horizontal-' + ditem"
            :title="horizontalConfig[ditem]"
            @click="adjustHorizontal(ditem, item)"
          ></span>
        </div>
        <div v-if="index == 'border'" class="border-div">
          <div :class="styleLi.border == 'none' ? 'border-type tsfont-border-clear' : 'border-type tsfont-border-all text-href'" :title="styleLi.border == 'none' ?'无边框':'有边框'" @click="toggleBorder()"></div>
        </div>
      </li>
    </ul>
    <!-- <div :class="'border-style '+bordertype" @click="toggleBorder">组件边框：</div> -->
  </div>
</template>
<script>
export default {
  name: 'SheetStylesetting',
  components: {},
  props: {
    stylelist: [Object, String]
    // borderstyle:{
    //   type:String,
    //   default:'underline'
    // }
  },
  data() {
    return {
      styleConfig: {
        // fontFamily: {
        //   songti: "宋体",
        //   weiruanyahei: "微软雅黑",
        //   heiti: "黑体",
        //   Arial: "Arial",
        //   Tahoma: "Tahoma"
        // },
        fontSize: {
          // '10px': '特小', //屏蔽原因是chrome浏览器对小于12的字体的支持不明显
          '12px': '小',
          normal: '中',
          '18px': '大',
          '32px': '最大'
        },
        fontWeight: ['normal', 'bold'],
        color: 'inherit',
        background: '',
        verticalAlign: ['top', 'middle', 'bottom'],
        textAlign: ['left', 'center', 'right', 'justify'],
        border: ['none', 'all']
      },
      styleLi: this.stylelist || '',
      colorList: [
        '#EFF0F3',
        '#F5F6FA',
        '#E5E5E5', 
        '#A1A1A1',
        '#212121', 
        '#1670F0', 
        '#FFBA5A',
        '#25B864',
        '#F33B3B', 
        '#E7F0FF', 
        '#FFF5E7', 
        '#E4F6EC', 
        '#F8E3E3',
        '#F9F9F9' // 银行背景颜色值
      ],
      weightConfig: {
        'normal': '正常字体',
        'bold': '加粗字体'
      },
      verticalConfig: {
        'top': '顶部对齐',
        'middle': '居中对齐',
        'bottom': '底部对齐'
      },
      horizontalConfig: {
        'left': '左对齐',
        'center': '居中对齐',
        'right': '右对齐',
        'justify': '两边对齐'
      }
    };
  },
  mounted() {
    // this.bordertype=this.borderstyle;
    // this.styleLi = this.stylelist;
  },
  methods: {
    adjustVertical(val) {
      this.styleLi.verticalAlign = val;
    },
    adjustHorizontal(val) {
      this.styleLi.textAlign = val;
    },
    toggleFontweight() {
      let fwInd = this.styleConfig.fontWeight.indexOf(this.styleLi.fontWeight) == this.styleConfig.fontWeight.length - 1 ? 0 : Math.floor(this.styleConfig.fontWeight.indexOf(this.styleLi.fontWeight)) + 1;
      this.styleLi.fontWeight = this.styleConfig.fontWeight[fwInd];
    },
    toggleBorder() {
      let bdInd = this.styleConfig.border.indexOf(this.styleLi.border) == this.styleConfig.border.length - 1 ? 0 : Math.floor(this.styleConfig.border.indexOf(this.styleLi.border)) + 1;
      this.styleLi.border = this.styleConfig.border[bdInd];
    }
  },
  computed: {
    setSize() {
      return function(fz) {
        return {
          fontSize: fz + '!important'
        };
      };
    }
  },
  watch: {
    stylelist(val) {
      this.styleLi = val;
    },
    styleLi: {
      handler(val) {
        // this.$parent.updateStyle(val);
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
/deep/.ivu-color-picker-picker{
  width:260px;
}
/deep/.ivu-color-picker-picker-panel, /deep/.ivu-color-picker-picker-hue-slider{
  display:none;
}
/deep/ .sheet-style-setting-bg .ivu-color-picker-confirm-color {
  display: none;
}
/deep/ .ivu-color-picker-confirm .ivu-btn-default{
  // 调整按钮间距
  margin-right: 16px;
}
.sheetbuilder-style {
  height: inherit;
  margin-bottom: 0;
}
.sheetbuilder-styleul {
  .ivu-input {
    border-bottom: none;
  }
  .ivu-color-picker-focused {
    box-shadow: none;
  }
  .ivu-color-picker {
    line-height: 26px;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  .color-li {
    position: relative;
    display: block;
    width: 20px;
    text-align: center;
    cursor: pointer;
    font-weight: bolder;
  }
  .style-txt {
    display: block;
    .style-txt-bt {
      position: absolute;
      bottom: 10px;
      height: 3px;
      left: 2px;
      right: 2px;
    }
  }
  .style-bg {
    width: 20px;
    line-height: 20px;
    height: 20px;
    margin-top: 9px;
  }
}
.sheetbuilder-style .sheetbuilder-styleul .sheetbuilder-styleli:not(:last-of-type):after {
  background: #e5e5e5;
  opacity: 0.8;
}
.sheetbuilder-styleul {
  float: left;
}
[class^='tsfont-']:before,
[class*=' tsfont-']:before,
.ts:before {
  font-weight: normal;
  vertical-align: inherit;

}
.fw-switch {
  cursor: pointer;
  display: block;
  width: 16px;
  text-align: center;
}

.fw-bold {
  font-weight: bold;
}

.fw-lighter {
  font-weight: lighter;
  opacity: 0.6;
}

.align-group {
  margin-left:-10px ;
  .action-item {
    font-size: 18px;
    &:after {
      top: 10px;
      bottom: 10px;
    }
  }
}

.border-div {
  padding: 9px 0;
  display: block;
  .border-type {
    width: 20px;
    height: 20px;
    display: block;
    cursor: pointer;
    line-height: 20px;
    font-size: 20px;
  }
}
</style>
