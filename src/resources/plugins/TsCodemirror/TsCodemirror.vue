<template>
  <div class="tscodemirror" :class="cmOptions.readOnly ? 'disabled' : ''">
    <Loading v-if="isLoading" :text="loadingText" :loadingShow="isLoading" type="fix"></Loading>
    <codemirror ref="myCode" :placeholder="placeholder" v-model="currentValue" :options="getOption" class="tscodemirror-code" :class="[classCodeStyle, !isValidPass ? 'border-color-error' : 'border-color']" :style="setHeight" @blur="onBlur" @focus="onFocus" @cursorActivity="cursorActivity" @scroll="onScroll"></codemirror>
    <transition name="fade">
      <slot name="validMessage">
        <span v-if="validMesage != ''" class="form-error-tip" :title="validMesage" v-html="validMesage"></span>
      </slot>
    </transition>
  </div>
</template>
<script>
import { codemirror } from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
//主题色
import 'codemirror/theme/eclipse.css'; //白
//import "codemirror/theme/abcdef.css";//黑
import 'codemirror/theme/monokai.css';
// //导入自动提示核心文件及样式
// import 'codemirror/addon/hint/show-hint.css';
// import 'codemirror/addon/hint/show-hint.js';
// //导入指定语言的提示文件
// import 'codemirror/addon/hint/javascript-hint.js';
import './codemirror.less';
import 'codemirror/addon/hint/show-hint.css';

let CodeMirror = require('codemirror/lib/codemirror');

//编辑模式引入选择
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/htmlmixed/htmlmixed');
require('codemirror/addon/edit/matchbrackets');

//代码折叠
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/xml-fold.js';
import 'codemirror/addon/fold/indent-fold.js';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/markdown-fold.js';
import 'codemirror/addon/fold/comment-fold.js';
//placeholder插件
import 'codemirror/addon/display/placeholder.js';
// 新加语言
import 'codemirror/mode/python/python.js';
import 'codemirror/mode/ruby/ruby.js';
import 'codemirror/mode/vbscript/vbscript.js';
import 'codemirror/mode/perl/perl.js';
import 'codemirror/mode/powershell/powershell.js';
import 'codemirror/mode/shell/shell.js';
import 'codemirror/mode/vue/vue.js';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/xml/xml';
import formMixins from '@/resources/mixins/formMixins.js';

export default {
  name: 'TsCodemirror',
  components: { codemirror },
  tagComponent: 'TsForm',
  mixins: [formMixins],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: ''
    },
    lineNumbers: {
      type: Boolean,
      default: true
    },
    value: {
      type: String,
      default: ''
    }, //初始数据
    codeMode: {
      //代码模式，text/javascript、htmlmixed
      type: String,
      default: 'text/javascript'
    },
    classCode: {
      //样式
      type: String,
      default: ''
    },
    isReadOnly: {
      type: Boolean,
      default: false
    },
    theme: {
      type: String,
      default: 'eclipse'
    },
    height: {
      type: String,
      default: '100%'
    },
    code: {
      type: String,
      default: ''
    },
    blurText: {
      type: String,
      default: ''
    },
    disabled: {
      //是否不可操作
      type: Boolean,
      default: false
    },
    config: {
      type: Object
    },
    placeholder: {
      type: String
    }
  },
  data() {
    return {
      validMesage: this.errorMessage || '',
      currentValidList: this.filterValid(this.validateList) || [],
      currentValue: this.value,
      classCodeStyle: this.classCode,
      cmOptions: {
        mode: this.codeMode, //模式
        theme: this.theme, //默认主题
        indentUnit: 2, //缩近单位，默认2
        smartIndent: true, //是否智能缩近
        tabSiae: 4, //Tab缩近，默认4
        readOnly: this.isReadOnly || this.disabled, //是否只读
        lineNumbers: this.lineNumbers, //是否显示行号
        firstLineNumber: 1, //默认起始行号1
        foldGutter: true, //折叠
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        lineWrapping: true
      },
      event: null,
      myCode: '',
      doc: null, //实例对象
      pos: null, //光标位置
      myBlurText: '',
      modeMappingConfig: {
        //语言映射
        javascript: 'text/javascript',
        json: 'text/javascript',
        htmlmixed: 'htmlmixed',
        python: 'python',
        ruby: 'ruby',
        vbscript: 'vbscript',
        perl: 'perl',
        powershell: 'powershell',
        shell: 'shell',
        sh: 'shell',
        csh: 'shell',
        bash: 'shell',
        cmd: 'shell',
        ksh: 'shell',
        vue: 'vue',
        xml: 'xml'
      },
      isValidPass: true
    };
  },
  mounted() {
    this.refresh();
  },
  methods: {
    cursorActivity(event) {
      this.event = event;
      this.doc = event.getDoc();
      const cursor = this.doc.getCursor();
      this.pos = {
        line: cursor.line,
        ch: cursor.ch
      };
    },
    changeCode() {
      this.$nextTick(() => {
        this.doc.replaceRange(this.myCode, this.pos);
        this.event.setCursor(this.pos);
        this.event.focus();
        this.$emit('repeatClick', this.myBlurText);
      });
    },
    saveData: function () {
      var _this = this.$refs.myCode.codemirror;
      var val = _this.getValue();
      return val;
    },
    onBlur(e) {
      this.$emit('onBlur');
      if (this.currentValidList.length > 0 && this.canValid('blur', this.currentValidList)) {
        this.valid(this.currentValue);
      }
    },
    onFocus(e) {
      if (!this.doc) {
        //定位光标所在行数
        let event = this.$refs.myCode.codemirror;
        this.cursorActivity(event);
      }
      this.$emit('onFocus');
    },
    onScroll(code) {
      this.$emit('onScroll', code);
    },
    refresh() {
      //新增手动刷新编辑器
      this.$nextTick(() => {
        this.$refs.myCode && this.$refs.myCode.refresh();
      });
    }
  },
  computed: {
    codemirror() {
      return this.$refs.myCode.codemirror;
    },
    setHeight() {
      return { height: this.height };
    },
    getOption() {
      let cmOptions = Object.assign(this.cmOptions, this.config);
      this.$set(cmOptions, 'mode', cmOptions.mode && this.modeMappingConfig[cmOptions.mode] ? this.modeMappingConfig[cmOptions.mode] : 'text/javascript');
      return cmOptions;
    }
  },
  watch: {
    currentValue: {
      handler(val) {
        this.$emit('update:value', val);
        this.$emit('change', val);
        if (!this.$utils.isSame(val, this.value)) {
          if (this.currentValidList.length > 0 && this.canValid('change', this.currentValidList)) {
            this.valid(val);
          }
        } else {
          this.validMesage = '';
          this.isValidPass = true;
        }
      },
      deep: true
    },
    value: {
      handler: function (val) {
        this.currentValue = val;
      },
      deep: true,
      immediate: true
    },
    code: {
      handler(val) {
        this.myCode = val;
      },
      deep: true,
      immediate: true
    },
    blurText: {
      handler(val) {
        if (val) {
          this.myBlurText = val;
        } else {
          this.myBlurText = this.myBlurText;
        }
      },
      deep: true
    },
    disabled: {
      handler(val) {
        this.$set(this.cmOptions, 'readOnly', this.isReadOnly || val);
        this.refresh();
      },
      immediate: true
    }
  }
};
</script>
<style lang="less">
.tscodemirror {
  .tscodemirror-code {
    border: 1px solid;
    border-radius: 6px;
  }
  .CodeMirror {
    height: 100%;
    .CodeMirror-lines {
      min-height: 120px;
    }
  }
}
</style>
