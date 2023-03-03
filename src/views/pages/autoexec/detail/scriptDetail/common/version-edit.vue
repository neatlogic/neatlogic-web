
<template>
  <div>
    <div id="inputParam" class="item-list">
      <div class="title">{{ $t('autoexec.inputParam') }}</div>
      <div class="param-box">
        <template v-if="!isEdit">
          <ParamsReadonly
            v-for="(iParam,iindex) in versionVo.inputParamList"
            :key="iindex"
            :typeList="typeList"
            :config="iParam"
          ></ParamsReadonly>
        </template>
        <ParamDetail
          v-else
          ref="inputParamList"
          :list="versionVo.inputParamList"
          :typeList="typeList"
          :params="paramMode.input"
          :isEdit="isEdit"
          :setValidComponentsList="setValidComponentsList"
        ></ParamDetail>
      </div>
      <div v-if="!isEdit && versionVo.inputParamList.length == 0" class="line-2 text-tip">{{ $t('autoexec.tips.empty.input') }}</div>
    </div>
    <div id="outputParam" class="item-list">
      <div class="title">{{ $t('autoexec.outputParam') }}</div>
      <div class="param-box">
        <template v-if="!isEdit">
          <ParamsReadonly
            v-for="(oParam,oindex) in versionVo.outputParamList"
            :key="oindex"
            :typeList="outputParamTypeList"
            :config="oParam"
          ></ParamsReadonly>
        </template>
        <ParamDetail
          v-else
          ref="outputParamList"
          :list="versionVo.outputParamList"
          :typeList="outputParamTypeList"
          :params="paramMode.output"
          :paramText="$t('autoexec.outputParam')"
          :isEdit="isEdit"
        ></ParamDetail>
      </div>
      <div v-if="!isEdit && versionVo.outputParamList.length == 0" class="line-2 text-tip">{{ $t('autoexec.tips.empty.output') }}</div>
    </div>
    <!-- 自由参数 -->
    <template v-if="!isEdit">
      <ArgumentView :config="versionVo.argument"></ArgumentView>
    </template>
    <template v-else>
      <ArgumentEdit ref="argument" :config="versionVo.argument"></ArgumentEdit>
    </template>
    <!-- <div class="item-list">
      <div class="title require-label">脚本编码</div>
      <div>
        <TsFormSelect
          v-model="versionVo.encoding"
          v-bind="encodingConfig"
          :readonly="!isEdit"
        ></TsFormSelect>
      </div>
    </div> -->
    <div id="versionParser" class="item-list">
      <div class="title require-label">脚本解析器</div>
      <div>
        <TsFormSelect
          ref="versionParser"
          v-model="versionVo.parser"
          v-bind="parserConfig"
          border="border"
          :readonly="!isEdit"
        ></TsFormSelect>
      </div>
    </div>
    <div id="useLib" class="item-list">
      <div class="title">依赖工具</div>
      <div>
        <TsFormSelect
          ref="useLib"
          v-model="versionVo.useLib"
          v-bind="useLibConfig"
          border="border"
          :readonly="!isEdit"
          sperateText="<br/>"
        ></TsFormSelect>
      </div>
    </div>
    <div id="codeLinelist" class="item-list">
      <div class="title require-label">脚本内容
        <Poptip trigger="hover" placement="right-end" transfer>
          <span class="tsfont-question-o"></span>
          <div slot="content">
            <div class="infoBg m-border bg-info-grey">
              <pre>
帮助：
通过参数名来获取参数值，如：
print $inputParam1
通过给输出参数赋值来设定返回值，如：
my $outParam1=＂outParam1-Value＂
输入参数：
“文本”、“密码”类参数可获得一个代表实际值的字符串
“节点”类参数可以获得一个IP
“文件”类参数可获得文件名，存放地址就在当前执行目录。
输出参数：
“文本“类参数可输出任意格式的文本
报告数据：
定义名称为:report_json的参数，值需要是合法的json格式。
退出码标识：
只要ExitCode不等于0则代表异常退出。
注意：
如果需发起子进程，执行完毕后请注意关闭标准输出和错误输出，否则父进程可能无法正常退出。</pre>
            </div>
          </div>
        </Poptip>
      </div>
      <div v-if="isShow" class="line-box">
        <TsCodemirror
          ref="TsCodemirror"
          v-model="versionVo.codeValue"
          :config="{mode:versionVo.parser}"
          :disabled="!isEdit"
          @onBlur="onBlur"
        ></TsCodemirror>
        <p v-if="isInfoCode" class="form-error-tip">请输入脚本内容</p>
        <!-- <EditCode ref="codeLinelist" :dataList="versionVo.lineList" :disabled="!isEdit"></EditCode> -->
      </div>
    </div>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import ParamDetail from './param-detail.vue';
// import EditCode from './edit-code.vue';
import ParamsReadonly from '@/views/pages/autoexec/components/param/params-readonly.vue';
export default {
  name: '',
  components: {
    TsFormSelect,
    ParamDetail,
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror.vue'], resolve),
    // EditCode,
    ParamsReadonly,
    ArgumentEdit: resolve => require(['./argument/argument-edit'], resolve),
    ArgumentView: resolve => require(['./argument/argument-view'], resolve)
  },
  filters: {
  },
  props: {
    typeList: {
      type: Array,
      default: () => []
    },
    config: Object,
    isEdit: {
      type: Boolean,
      default: true
    },
    outputParamTypeList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    // let _this = this;
    return {
      isInfoCode: false,
      isShow: false,
      versionVo: {
        inputParamList: [],
        outputParamList: [],
        parser: '',
        codeValue: '',
        lineList: [],
        argument: {},
        encoding: 'UTF-8'
      },
      parserConfig: {
        type: 'select',
        name: 'parser',
        value: '',
        label: '脚本解析器',
        multiple: false,
        placeholder: '请选择脚本解析器',
        width: '50%',
        dataList: [],
        validateList: [{name: 'required', message: '请选择脚本解析器'}],
        transfer: true
      },
      useLibConfig: {
        type: 'select',
        name: 'useLib',
        dynamicUrl: '/api/rest/autoexec/script/search',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'id',
        params: { isLib: 1, versionStatus: 'passed'},
        value: '',
        label: '依赖工具',
        multiple: true,
        placeholder: '请选择依赖工具',
        width: '50%',
        dataList: [],
        transfer: true
      },
      paramMode: {
        input: {
          mode: 'input'
        },
        output: {
          mode: 'output'
        }
      },
      encodingConfig: {
        url: '/api/rest/universal/enum/get',
        params: {enumClass: 'neatlogic.framework.autoexec.constvalue.ScriptEncoding'},
        transfer: true,
        clearable: false,
        width: '50%',
        border: 'border'
      },
      setValidComponentsList: ['text']
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {     
    this.isShow = true;  
    // 在切换草稿的时候，要把TsCodemirror模板重新渲染一遍,不然高亮会不显示,TsCodemirror 里面的方法 refresh 不起作用
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    codemirrorValInit() {
      let lineList = this.versionVo.lineList;      
      // 兼容老数据
      if (lineList && lineList.length) {
        let temList = [];
        lineList.forEach((v, index) => {
          let content = v.content || '';
          if (index < lineList.length - 1) {
            content += '\n';
          }
          temList.push(content);
        });   
        this.versionVo.codeValue = temList.join('');
      }
    },
    onBlur() {
      let temList = this.$refs.TsCodemirror.codemirror.getValue().split('\n');
      let newList = [];
      temList.forEach(v => {
        if (v) {
          newList.push(v);
        }
      });
      if (newList.length > 0) {
        this.isInfoCode = false;
      }
    },
    codemirrorGetValue() {
      let temList = this.$refs.TsCodemirror.codemirror.getValue().split('\n');
      let newList = [];
      if (temList.length > 0) {
        temList.forEach(v => {
          newList.push({content: v});
        });
      } else {
        this.isInfoCode = true;
      }

      if (newList.length === 0) {
        this.isInfoCode = true;
        return [];
      } else {
        return newList;
      }
    },
    initData(config) {     
      this.getScriptParser();      
      if (config) {
        Object.keys(config).forEach(key => {
          let i = config[key];
          if (this.versionVo.hasOwnProperty(key)) {
            this.versionVo[key] = i;
          }
        });
        if (this.isEdit && !this.useLibConfig.params.hasOwnProperty('excludeList') && config.scriptId) {
          this.$set(this.useLibConfig.params, 'excludeList', [config.scriptId]);
        }
      } else {
        let versionVo = {
          inputParamList: [],
          outputParamList: [],
          parser: '',
          useLib: [],
          lineList: [],
          argument: {},
          encoding: 'UTF-8'
        };
        this.versionVo = Object.assign(this.versionVo, versionVo);
      }
    },
    getScriptParser() {
      let data = {
        enumClass: 'neatlogic.framework.autoexec.constvalue.ScriptParser'
      };
      this.$api.autoexec.action.getParamsTypeLit(data).then(res => {
        if (res.Status == 'OK') {
          this.parserConfig.dataList = res.Return;
          this.codemirrorValInit();
        }
      });
    },
    async valid() {
      let validList = [];
      if (this.$refs.inputParamList && this.$refs.inputParamList.validName().length > 0) {
        validList.push({focus: '#inputParam', text: '输入参数数据填写不正确', type: 'error'});
      }
      if (this.$refs.outputParamList && this.$refs.outputParamList.validName().length > 0) {
        validList.push({focus: '#outputParam', text: '输出参数数据填写不正确', type: 'error'});
      }
      if (this.$refs.versionParser && !this.$refs.versionParser.valid()) {
        validList.push({focus: '#versionParser', text: '解析器：请选择', type: 'error'});
      }
      if (this.codemirrorGetValue().length === 0) {
        validList.push({focus: '#codeLinelist', text: '脚本内容：请输入内容', type: 'error'});
      }
      if (this.$refs.argument && !this.$refs.argument.valid()) {
        validList.push({focus: '#argument', text: '自由参数：请输入内容', type: 'error'});
      } 
      // let lineValid = await this.validCheck(); //接口未完成，之后补
      this.$emit('updateValidList', validList);
      return validList;
    },
    save() {
      let inputParamList = this.$refs.inputParamList ? this.$refs.inputParamList.saveParamList() : this.versionVo.inputParamList;
      let outputParamList = this.$refs.outputParamList ? this.$refs.outputParamList.saveParamList() : this.versionVo.outputParamList;
      let argument = this.$refs.argument ? this.$refs.argument.save() : this.versionVo.argument;
      let data = {
        paramList: [],
        parser: this.versionVo.parser,
        useLib: this.versionVo.useLib,
        // encoding: this.versionVo.encoding,
        lineList: this.codemirrorGetValue()
        // lineList: this.$refs.codeLinelist.getValue()
      };
      if (inputParamList.length > 0) {
        data.paramList.push(...inputParamList);
      }
      if (outputParamList.length > 0) {
        data.paramList.push(...outputParamList);
      }
      if (argument && !this.$utils.isEmpty(argument)) {
        this.$set(data, 'argument', argument);
      }
      return data;
    },
    validCheck() {
      if (this.versionVo.parser) {
        let data = {
          parser: this.versionVo.parser,
          lineList: this.codemirrorGetValue()
          // lineList: this.$refs.codeLinelist.getValue()
        };
        let validList = [];
        let _this = this;
        return new Promise((resolve, reject) => {
          _this.$api.autoexec.script.validCheck(data)
            .then(res => {
              if (result.Status == 'OK') {
                let list = res.Return;
                this.versionVo.lineList = list;
                for (let i = 0; i < list.length; i++) {
                  if (list[i].riskCodeLevel == 'critical') {
                    validList.push({text: '脚本内容：不符合规则', type: 'error'});
                  }
                }
              }
              resolve(validList);
            })
            .catch(error => {
              validList.push({text: error.Message, type: 'error'});
              resolve(validList);
            });
        });
      }
    }
  },
  computed: {},
  watch: {
    config: {
      handler(val) {
        this.initData(val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.item-list{
    padding-bottom: 16px;
    .title{
      font-size: 14px;
      padding-bottom: 10px;
    }
  }
  .param-box{
    padding-top: 6;
  }
.infoBg{
    padding: 8px;
    border-radius: 10px;
}
</style>
