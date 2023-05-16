<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-ok="okSetting"
      @on-close="closeSetting"
    >
      <template v-slot>
        <div class="params-main input-border">
          <div class="simple-mode">
            <div class="param-detail">
              <div v-if="paramList.length > 0" class="param-list text-title">
                <TsRow :gutter="8">
                  <Col span="3">
                    <div>{{ $t('term.autoexec.parameterenglishname') }}</div>
                  </Col>
                  <Col span="3">
                    <div>{{ $t('term.autoexec.parameterchinesename') }}</div>
                  </Col>
                  <Col span="3">
                    <div>{{ $t('term.autoexec.controltype') }}</div>
                  </Col>
                  <Col span="8">
                    <div>{{ $t('page.validate') }}/{{ $t('page.defaultvalue') }}</div>
                  </Col>
                  <Col span="7">
                    <div>{{ $t('page.description') }}</div>
                  </Col>
                </TsRow>
                <div class="btn-item" style="top: 10px;">
                  <div>{{ $t('page.require') }}</div>
                  <div>{{ $t('term.autoexec.editable') }}</div>
                </div>
              </div>
              <vuedraggable
                tag="div"
                :list="paramList"
                handle=".move"
              >
                <div v-for="(item,index) in paramList" :key="index" class="param-list">
                  <div class="move tsfont-bar"></div>
                  <TsRow :gutter="8">
                    <Col span="3">
                      <TsFormInput
                        ref="keyInput"
                        v-model="item.key"
                        :disabled="!canEdit"
                        maxlength="50"
                        :validateList="item.name?validateConfig.keyRequired:validateConfig.key"
                        :errorMessage="item.keyErrorMessage"
                        :placeholder="$t('term.autoexec.parameterenglishname')"
                        @on-change="changeName(item, index,'key')"
                      ></TsFormInput>
                    </Col>
                    <Col span="3">
                      <TsFormInput
                        ref="nameInput"
                        v-model="item.name"
                        :disabled="!canEdit"
                        maxlength="50"
                        :validateList="item.key?validateConfig.nameRequired:validateConfig.name"
                        :errorMessage="item.nameErrorMessage"
                        :placeholder="$t('term.autoexec.parameterchinesename')"
                        @on-change="changeName(item, index,'name')"
                      ></TsFormInput>
                    </Col>
                    <Col span="3">
                      <PoptipSelect
                        v-model="item.type"
                        :list="paramsTypeList"
                        :disabled="!canEdit"
                        isIcon
                        @change="(val)=>{changeType(val,item)}"
                      ></PoptipSelect>
                    </Col>
                    <Col span="8">
                      <div v-if="excludeTyptList.indexOf(item.type) > -1">-</div>
                      <Items
                        :is="handlerType(item.type)"
                        v-else
                        ref="itemInput"
                        v-model="item.defaultValue"
                        :defaultValue="item.defaultValue"
                        :config="getselectConfig(item)"
                        :disabled="!canEdit"
                        :setValidComponentsList="setValidComponentsList"
                        @getConfig="(config)=>{getParamConfig(index,config)}"
                      ></Items>
                    </Col>
                    <Col span="7">
                      <TsFormInput
                        v-model="item.description"
                        :disabled="!canEdit"
                        maxlength="500"
                        :placeholder="$t('page.description')"
                      ></TsFormInput>
                    </Col>
                  </TsRow>
                  <div class="btn-item">
                    <div>
                      <TsFormSwitch
                        v-model="item.isRequired"
                        :true-value="1"
                        :false-value="0"
                        :disabled="!canEdit"
                      ></TsFormSwitch>
                    </div>
                    <div>
                      <TsFormSwitch
                        v-model="item.editable"
                        :true-value="1"
                        :false-value="0"
                        :disabled="!canEdit"
                      ></TsFormSwitch>
                    </div>
                    <div v-if="canEdit" class="del-btn tsfont-trash-o text-tip-active" @click="delParam(index)"></div>
                  </div>
                </div>
              </vuedraggable>
              <div class="add-text">
                <Button
                  v-if="canEdit"
                  type="primary"
                  ghost
                  @click="addParam"
                ><span class="tsfont-plus">{{ $t('page.param') }}</span></Button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import Items from '@/views/pages/autoexec/components/param/edit';
export default {
  name: '',
  components: {
    ...Items,
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    PoptipSelect: resolve => require(['@/resources/components/PoptipSelect/PoptipSelect'], resolve),
    vuedraggable: resolve => require(['vuedraggable'], resolve)
  },
  filters: {},
  props: {
    canEdit: Boolean,
    appSystemId: Number, //应用id
    appModuleId: Number, //模块id
    envId: Number, //环境id
    runtimeParamList: Array
  },
  data() {
    let _this = this;
    return {
      dialogConfig: {
        title: this.$t('term.autoexec.jobparam'),
        type: 'slider',
        width: '1200px',
        isShow: true,
        hasFooter: _this.canEdit
      },
      paramList: [
        {
          key: '',
          defaultValue: '',
          description: '',
          isRequired: 1,
          type: 'text',
          editable: 1
        }
      ],
      paramsTypeList: [],
      validateConfig: {
        key: ['key-special'],
        keyRequired: ['required', 'key-special'],
        name: ['name-special'],
        nameRequired: ['required', 'name-special']
      },
      isRepeatName: false, //参数名重复
      excludeTyptList: ['phase'], //过滤不需要默认值的组件类型
      setValidComponentsList: ['text'] //设置校验规则的组件
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.getParamsTypeLit();
    this.getParamList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {
    
  },
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getParamList() {
      let data = {
        appSystemId: this.appSystemId
      };
      this.$api.deploy.apppipeline.getPipelineParams(data).then(res => {
        if (res.Status == 'OK') {
          if (res.Return && res.Return.length > 0) {
            this.paramList = res.Return;
          }
        }
      });
    },
    getParamsTypeLit() {
      //选择组件类型
      let data = { enumClass: 'neatlogic.framework.autoexec.constvalue.ParamType' };
      return this.$api.common.getSelectList(data).then(res => {
        if (res.Status == 'OK') {
          this.paramsTypeList = res.Return;
        }
      });
    },
    closeSetting() {
      this.$emit('close');
    },
    okSetting() {
      if (this.validName().length > 0) {
        return;
      }
      if (!this.validParamList()) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('term.deploy.deleteallcite'),
          btnType: 'error',
          'on-ok': vnode => {
            this.saveParamList();
            vnode.isShow = false;
          }
        });
      } else {
        this.saveParamList();
      }
    },
    saveParamList() {
      let paramList = this.updateParamList();
      let data = {
        appSystemId: this.appSystemId,
        paramList: paramList
      };
      let _this = this;
      this.$api.deploy.apppipeline.savePipelineParams(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          _this.$emit('saveParamList', data.paramList);
          _this.closeSetting();
        }
      });
    },
    addParam() {
      let obj = {
        key: '',
        name: '',
        defaultValue: '',
        description: '',
        isRequired: 1,
        type: 'text',
        editable: 1
      };
      this.paramList.push(obj);
    },
    delParam(index) {
      this.paramList.splice(index, 1);
      this.validName();
    },
    validName() {
      let keyInputList = this.$refs.keyInput;
      let nameInputList = this.$refs.nameInput;
      let itemInputList = this.$refs.itemInput;
      let validList = [];
      this.paramList.forEach((item, index) => {
        if (item.key != '' && item.name == '') {
          this.$set(item, 'nameErrorMessage', this.$t('form.validate.pleaseenterthecontent'));
          validList.push(false);
        } else if (item.name != '' && item.key == '') {
          this.$set(item, 'keyErrorMessage', this.$t('form.validate.pleaseenterthecontent'));
          validList.push(false);
        } else if (item.key != '' || item.name != '') {
          item.key != '' && this.changeName(item, index, 'key');
          item.name != '' && this.changeName(item, index, 'name');
        }
      });
      if (!this.isRepeatName) {
        if (nameInputList && keyInputList) {
          for (let i = 0; i < nameInputList.length; i++) {
            if (!nameInputList[i].valid()) {
              validList.push(nameInputList[i]);
            }
          }
          for (let k = 0; k < keyInputList.length; k++) {
            if (!keyInputList[k].valid()) {
              validList.push(keyInputList[k]);
            }
          }
        }
        if (itemInputList) {
          for (let j = 0; j < itemInputList.length; j++) {
            if (!itemInputList[j].valid()) {
              validList.push(itemInputList[j]);
            }
          }
        }
      } else {
        validList.push(false);
      }
      return validList;
    },
    changeName(item, index, type) {
      let findNameList = [];
      this.paramList.forEach(t => {
        if (item[type] != '' && t[type] == item[type]) {
          findNameList.push(t);
        }
      });
      this.$nextTick(() => { 
        if (type == 'key') {
          if (findNameList.length > 1) {
            this.isRepeatName = true;
            this.$set(item, 'keyErrorMessage', this.$t('form.validate.englishnamerepetition'));
          } else {
            this.isRepeatName = false;
            this.paramList.forEach(p => {
              this.$set(p, 'keyErrorMessage', '');
            });
          }
        } else if (type == 'name') {
          if (findNameList.length > 1) {
            this.isRepeatName = true;
            this.$set(item, 'nameErrorMessage', this.$t('form.validate.chinesenamerepetition'));
          } else {
            this.isRepeatName = false;
            this.paramList.forEach(p => {
              this.$set(p, 'nameErrorMessage', '');
            });
          }
        }
      });
    },
    updateParamList() {
      let list = [];
      // let typeList = ['select', 'multiselect', 'radio', 'checkbox', 'node'];//参数需要保存config配置的
      this.paramList.forEach(item => {
        if (item.key != '' && item.type != '') {
          // if (!typeList.includes(item.type)) { this.$delete(item, 'config'); }
          list.push(item);
        }
      });
      return list;
    },
    changeType(val, item) {
      if (val == 'node') {
        item.defaultValue = [];
      } else if (val == 'file') {
        item.defaultValue = {};
      } else {
        item.defaultValue = '';
      }
      item.config = {};
    },
    getParamConfig(index, config) {
      if (config) {
        this.$set(this.paramList[index], 'config', config);
      }
    },
    validParamList() { //校验默认的参数列表key是否发生改变
      let isValid = true;
      let paramList = this.paramList;
      if (!this.$utils.isSame(this.runtimeParamList, paramList)) {
        this.runtimeParamList.forEach(item => {
          let findParam = paramList.find(p => p.key == item.key);
          if (!findParam) {
            isValid = false;
          }
        });
      }
      return isValid;
    }
  },
  computed: {
    handlerType() {
      let _this = this;
      return value => {
        let type = 'defaultInput';
        let findConfig = _this.paramsTypeList.find(item => item.value == value);
        if (findConfig) {
          type = findConfig.value + 'Handler';
        }
        return type;
      };
    },
    getselectConfig() {
      let _this = this;
      return data => {
        let config = {};
        if (data.config && !this.$utils.isEmpty(data.config)) {
          config = data.config;
          config.type = data.type;
        } else {
          let findConfig = _this.paramsTypeList.find(item => item.value == data.type);
          if (findConfig) {
            config = findConfig.config;
          }
        }
        return config;
      };
    }
  },
  watch: {}
};
</script>
<style lang='less' scoped>
.param-detail {
  .param-list {
    position: relative;
    padding-right: 110px;
    padding-top: 16px;
    padding-left: 20px;
    &:last-of-type{
      padding-bottom: 16px;
    }
    &:hover {
      .del-btn {
        display: block;
      }
      .move {
        display: block;
      }
    }
    .btn-item {
      width: 100px;
      position: absolute;
      right: 0;
      top: 16px;
      display: flex;
      justify-content: space-between;
      height: 32px;
      line-height: 32px;
      padding-right: 28px;
    }
    .del-btn {
      display: none;
      position: absolute;
      right: 0;
    }
    .move {
      position: absolute;
      left: 0;
      top: 24px;
      cursor: move;
      display: none;
    }
  }
  .add-text {
    padding-left: 20px;
  }
}

.item-col {
  display: flex;
  justify-content: space-between;
  height: 32px;
  line-height: 32px;
}
</style>
