
<template>
  <div>
    <div id="inputParam" class="item-list">
      <div class="title">{{ $t('page.inputparam') }}</div>
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
      <div v-if="!isEdit && versionVo.inputParamList.length == 0" class="line-2 text-tip">{{ $t('page.notarget', {target: $t('page.inputparam')}) }}</div>
    </div>
    <div id="outputParam" class="item-list">
      <div class="title">{{ $t('page.outputparam') }}</div>
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
          :paramText="$t('page.outputparam')"
          :isEdit="isEdit"
        ></ParamDetail>
      </div>
      <div v-if="!isEdit && versionVo.outputParamList.length == 0" class="line-2 text-tip">{{ $t('page.notarget', {target: $t('page.outputparam')}) }}</div>
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
      <div class="title require-label">{{ $t('term.autoexec.scriptparser') }}</div>
      <div>
        <TsFormSelect
          ref="versionParser"
          v-model="versionVo.parser"
          v-bind="parserConfig"
          border="border"
          :readonly="!isEdit"
          @change="changeParser"
        ></TsFormSelect>
      </div>
    </div>
    <div id="useLib" class="item-list">
      <div class="title">{{ $t('term.autoexec.dependenttool') }}</div>
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
      <div class="title require-label">{{ $t('term.autoexec.scriptcontent') }}
        <Poptip trigger="hover" placement="right-end" transfer>
          <span class="tsfont-question-o"></span>
          <div slot="content">
            <div class="infoBg m-border bg-info-grey">
              <pre>{{ $t('term.autoexec.scriptcontenttips') }}</pre>
            </div>
          </div>
        </Poptip>
      </div>
      <div v-if="isShow" class="line-box">
        <div v-if="versionVo.parser == 'package'"> 
          <TsUpLoad
            data-type="autoexec"
            styleType="button"
            className="smallUpload"
            :format="['tar']"
            :multiple="false"
            :uploadCount="2"
            :defaultList="defaultFileList"
            :readonly="!isEdit"
            @remove="getFileList"
            @getFileList="getFileList"
          >
            <div v-if="isEdit" slot="tips" class="mt-xs">{{ $t('term.autoexec.supportonlytarfile') }}</div>
          </TsUpLoad>
          <p v-if="ishowUploadFileTip" class="form-error-tip">{{ $t('term.autoexec.pleaseselectuploadfile') }}</p>
        </div>
        <template v-else>
          <TsCodemirror
            ref="TsCodemirror"
            v-model="versionVo.codeValue"
            :config="{mode:versionVo.parser}"
            :disabled="!isEdit"
            @onBlur="onBlur"
          ></TsCodemirror>
          <p v-if="isInfoCode" class="form-error-tip">{{ $t('form.placeholder.pleaseinput', {target: $t('term.autoexec.scriptcontent')}) }}</p>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import ParamDetail from './param-detail.vue';
import ParamsReadonly from '@/views/pages/autoexec/components/param/params-readonly.vue';
export default {
  name: '',
  components: {
    TsFormSelect,
    ParamDetail,
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror.vue'], resolve),
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve),
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
    return {
      ishowUploadFileTip: false, // 是否显示上传文件提示
      defaultFileList: [], // 回显上传文件列表
      defaultFileId: null,
      isInfoCode: false,
      isShow: false,
      versionVo: {
        inputParamList: [],
        outputParamList: [],
        parser: '',
        codeValue: '',
        lineList: [],
        argument: {},
        encoding: 'UTF-8',
        packageFileId: null
      },
      parserConfig: {
        type: 'select',
        name: 'parser',
        value: '',
        label: this.$t('term.autoexec.scriptparser'),
        multiple: false,
        placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('term.autoexec.scriptparser')}),
        width: '50%',
        dataList: [],
        validateList: [{name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('term.autoexec.scriptparser')})}],
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
        label: this.$t('term.autoexec.dependenttool'),
        multiple: true,
        placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('term.autoexec.dependenttool')}),
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
  created() {},
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
    changeParser(parservalue) {
      // 脚本解析器值改变
      if (parservalue != 'package') {
        // 需要清空值
        this.versionVo.packageFileId = null;
        this.ishowUploadFileTip = false;
      }
    },
    //获取上传文件列表
    getFileList(fileList) {
      let newFile = '';
      let fileIdList = [];
      if (fileList && fileList.length > 0) {
        if (fileList && fileList.length == 2) {
          // 替换之前旧的值
          newFile = fileList.find((item) => item.id != this.defaultFileId);
          if (newFile) {
            this.defaultFileList = [newFile];
            this.defaultFileId = newFile.id;
            this.versionVo.packageFileId = newFile.id;
          }
        } else if (fileList && fileList.length == 1) {
          // 只选择一个
          fileIdList = this.$utils.mapArray(fileList, 'id');
          this.versionVo.packageFileId = fileIdList && fileIdList.length > 0 ? fileIdList[0] : null;
        }
        this.ishowUploadFileTip = false;
      } else {
        this.versionVo.packageFileId = null;
        this.defaultFileId = null;
        this.defaultFileList = [];
        this.ishowUploadFileTip = true;
      }
    },
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
      let temList = this.$refs.TsCodemirror ? this.$refs.TsCodemirror.codemirror.getValue().split('\n') : [];
      let newList = [];
      if (temList.length > 0) {
        temList.forEach(v => {
          if (v) {
            newList.push({content: v});
          }
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
          if (config.hasOwnProperty('packageFile') && !this.$utils.isEmpty(config.packageFile)) {
            // 脚本解析器为package时，需要回显上传文件列表
            this.defaultFileList = [config.packageFile];
            this.defaultFileId = config.packageFile.id;
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
          encoding: 'UTF-8',
          packageFileId: null
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
          let parserList = res.Return;
          if (this.hasOwnProperty('config') && this.config.hasOwnProperty('isLib') && this.config.isLib == 0) {
            let index = parserList.findIndex(item => item.value == 'package');
            if (index != -1) {
              parserList.splice(index, 1);
            }
          } 
          this.parserConfig.dataList = parserList;
          this.codemirrorValInit();
        }
      });
    },
    async valid() {
      let validList = [];
      if (this.$refs.inputParamList && this.$refs.inputParamList.validName().length > 0) {
        validList.push({focus: '#inputParam', text: this.$t('term.autoexec.inputparamerror'), type: 'error'});
      }
      if (this.$refs.outputParamList && this.$refs.outputParamList.validName().length > 0) {
        validList.push({focus: '#outputParam', text: this.$t('term.autoexec.outputparamerror'), type: 'error'});
      }
      if (this.$refs.versionParser && !this.$refs.versionParser.valid()) {
        validList.push({focus: '#versionParser', text: this.$t('term.autoexec.selectparser'), type: 'error'});
      }
      if (this.versionVo.parser != 'package' && this.codemirrorGetValue().length === 0) {
        // 脚本解析器不是package时，需要验证必填
        validList.push({focus: '#codeLinelist', text: this.$t('term.autoexec.inputscriptcontent'), type: 'error'});
      }
      if (this.versionVo.parser == 'package' && !this.versionVo.packageFileId) {
        // 脚本解析器是package时，上传附件必填
        validList.push({focus: '#codeLinelist', text: this.$t('term.autoexec.pleaseselectuploadfile'), type: 'error'});
        this.ishowUploadFileTip = true;
      } else {
        this.ishowUploadFileTip = false;
      }
      if (this.$refs.argument && !this.$refs.argument.valid()) {
        validList.push({focus: '#argument', text: this.$t('term.autoexec.inputfreeparam'), type: 'error'});
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
      if (this.versionVo.packageFileId) {
        data.packageFileId = this.versionVo.packageFileId;
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
                    validList.push({text: this.$t('term.autoexec.scriptcontenterror'), type: 'error'});
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
    },
    changeIsLib(isLib) {
      if (isLib != null) {
        let index = this.parserConfig.dataList.findIndex(item => item.value == 'package');
        if (isLib == 0 && index != -1) {
          this.parserConfig.dataList.splice(index, 1);
        } else if (isLib == 1 && index == -1) {
          this.parserConfig.dataList.splice(this.parserConfig.dataList.length, 0, { text: 'package', value: 'package'});
        }
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
