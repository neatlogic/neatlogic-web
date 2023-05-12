<template>
  <div class="param-detail input-border">
    <div v-if="paramList.length > 0" class="param-list text-title tips param-header">
      <TsRow :gutter="8">
        <Col span="3">
          <div class="overflow">{{ $t('term.autoexec.parameterenglishname') }}</div>
        </Col>
        <Col span="3">
          <div class="overflow">{{ $t('term.autoexec.parameterchinesename') }}</div>
        </Col>
        <Col span="3">
          <div class="overflow">{{ $t('term.autoexec.controltype') }}</div>
        </Col>
        <Col span="8">
          <div class="overflow">{{ $t('page.validate') }}/{{ $t('page.defaultvalue') }}</div>
        </Col>
        <Col span="7">
          <div class="overflow">{{ $t('page.description') }}</div>
        </Col>
      </TsRow>
      <div class="btn-item" style="top: -7px;">
        {{ $t('page.require') }}
      </div>
    </div>
    <div v-if="paramList && paramList.length > 0" class="param-box">
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
                :disabled="!isEdit"
                maxlength="50"
                :validateList="validateConfig.key"
                :errorMessage="item.keyErrorMessage"
                :placeholder="$t('term.autoexec.parameterenglishname')"
                @on-change="changeName(item, index,'key')"
              ></TsFormInput>
            </Col>
            <Col span="3">
              <TsFormInput
                ref="nameInput"
                v-model="item.name"
                :disabled="!isEdit"
                maxlength="50"
                :validateList="validateConfig.name"
                :placeholder="$t('term.autoexec.parameterchinesename')"
                :errorMessage="item.nameErrorMessage"
                @on-change="changeName(item, index,'name')"
              ></TsFormInput>
            </Col>
            <Col span="3">
              <PoptipSelect
                v-model="item.type"
                :list="paramsTypeList"
                :disabled="!isEdit"
                isIcon
                @change="(val)=>{changeType(val,item)}"
              ></PoptipSelect>
            </Col>
            <Col span="8">
              <div class="param-handler">
                <div v-if="excludeTyptList.indexOf(item.type) > -1">-</div>
                <Items
                  :is="handlerType(item.type)"
                  v-else
                  ref="itemInput"
                  v-model="item.defaultValue"
                  :defaultValue="item.defaultValue"
                  :config="getselectConfig(item)"
                  :disabled="!isEdit"
                  :setValidComponentsList="setValidComponentsList"
                  @getConfig="(config)=>{getParamConfig(index,config)}"
                ></Items>
              </div>
            </Col>
            <Col span="7">
              <TsFormInput
                v-model="item.description"
                :disabled="!isEdit"
                maxlength="255"
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
                :disabled="!isEdit"
              ></TsFormSwitch>
            </div>
            <div v-if="isEdit" class="del-btn tsfont-trash-o text-tip-active" @click="delParam(index)"></div>
          </div>
        </div>
      </vuedraggable>
    </div>
    <Button
      v-if="isEdit"
      type="primary"
      ghost
      @click="addParam"
    >
      <span class="tsfont-plus" style="padding-right:4px"></span><span>{{ paramText }}</span>
    </Button>
  </div>
</template>
<script>
import Items from '@/views/pages/autoexec/components/param/edit';
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    // TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    PoptipSelect: resolve => require(['@/resources/components/PoptipSelect/PoptipSelect'], resolve),
    ...Items,
    vuedraggable: resolve => require(['vuedraggable'], resolve)
  },
  filters: {},
  props: {
    list: {
      type: Array,
      default: () => []
    },
    typeList: {
      type: Array,
      default: () => []
    },
    isEdit: {
      type: Boolean,
      default: true
    },
    params: {
      type: Object,
      default: () => {}
    },
    paramText: {
      type: String,
      default() {
        return this.$t('page.inputparam');
      }
    },
    setValidComponentsList: Array
  },
  data() {
    let _this = this;
    return {
      paramList: [
        {
          key: '',
          defaultValue: '',
          description: '',
          isRequired: 1,
          type: 'text',
          ..._this.params
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
      excludeTyptList: ['phase'] //过滤不需要默认值的组件类型
    };
  },
  beforeCreate() {},
  created() {
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
    addParam() {
      let obj = {
        key: '',
        name: '',
        defaultValue: '',
        description: '',
        isRequired: 1,
        type: 'text',
        ...this.params
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
        } else {
          this.changeName(item, index, 'key');
          this.changeName(item, index, 'name');
        }
      });
      if (!this.isRepeatName) {
        if (nameInputList && keyInputList) {
          for (let i = 0; i < nameInputList.length; i++) {
            if (!nameInputList[i].valid()) {
              validList.push(false);
            }
          }
          for (let k = 0; k < keyInputList.length; k++) {
            if (!keyInputList[k].valid()) {
              validList.push(false);
            }
          }
        }
        if (itemInputList) {
          for (let j = 0; j < itemInputList.length; j++) {
            if (!itemInputList[j].valid()) {
              validList.push(false);
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
    saveParamList() {
      let list = [];
      this.paramList.forEach(item => {
        if (item.key != '' && item.type != '') {
          delete item.keyErrorMessage;
          delete item.nameErrorMessage;
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
        config.defaultValue && this.$set(this.paramList[index], 'defaultValue', config.defaultValue);
      }
    }
  },
  computed: {
    handlerType() {
      return (value) => {
        let type = 'defaultInput';
        if (value) {
          type = value + 'Handler';
        }
        return type;
      };
    },
    getselectConfig() {
      let _this = this;
      return data => {
        let config = {};
        if (data.config && JSON.stringify(data.config) != '{}') {
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
  watch: {
    list: {
      handler(val) {
        if (val && val.length > 0) {
          this.paramList = this.$utils.deepClone(val);
        } else {
          this.paramList = [];
        }
      },
      deep: true,
      immediate: true
    },
    typeList: {
      handler(val) {
        this.paramsTypeList = val;
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
.param-header{
  padding-bottom: @space-sm !important;
}
.param-list{
  position: relative;
  padding-right: 60px;
  padding-bottom: 16px;
  left: -20px;
  padding-left: 20px;
  &:last-child{
    padding-bottom: 10px;
  }
  &:hover{
    .del-btn{
      display: block;
    }
    .move {
      display: block;
    }
  }
  .btn-item{
    width: 50px;
    position: absolute;
    right: 0;
    top: 0;
    display: flex;
    justify-content: space-between;
    height: 32px;
    line-height: 32px;
  }
  .del-btn{
    display: none; 
  }
  .move {
    position: absolute;
    left: 0;
    top: 8px;
    display: none;
    cursor: move;
  }
}
.item-col{
  display: flex;
  justify-content: space-between;
  height: 32px;
  line-height: 32px;
}
.param-handler {
  line-height: 32px;
}
</style>
