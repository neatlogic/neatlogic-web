<template>
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
              :disabled="!isEdit"
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
              :disabled="!isEdit"
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
                :isRequired="item.isRequired && !item.editable"
                @getConfig="(config)=>{getParamConfig(index,config)}"
              ></Items>
            </div>
          </Col>
          <Col span="7">
            <TsFormInput
              v-model="item.description"
              :disabled="!isEdit"
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
              :disabled="!isEdit"
            ></TsFormSwitch>
          </div>
          <div>
            <TsFormSwitch
              v-model="item.editable"
              :true-value="1"
              :false-value="0"
              :disabled="!isEdit"
            ></TsFormSwitch>
          </div>
          <div v-if="isEdit" class="del-btn tsfont-trash-o text-tip-active" @click="delParam(index)"></div>
        </div>
      </div>
    </vuedraggable>
    <div class="add-text">
      <Button
        v-if="isEdit"
        type="primary"
        ghost
        @click="addParam"
      ><span class="tsfont-plus">{{ $t('page.param') }}</span></Button>
    </div>
  </div>
</template>
<script>
import Items from '@/views/pages/autoexec/components/param/edit';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput.vue';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect.vue';
import TsFormSwitch from '@/resources/plugins/TsForm/TsFormSwitch.vue';
import PoptipSelect from '@/resources/components/PoptipSelect/PoptipSelect.vue';
export default {
  name: '',
  components: {
    TsFormInput,
    TsFormSelect,
    TsFormSwitch,
    PoptipSelect,
    ...Items,
    vuedraggable: () => import('vuedraggable')
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
    setValidComponentsList: Array
  },
  data() {
    return {
      paramList: [],
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
  created() {},
  beforeMount() {},
  mounted() {
    let _this = this;
    //默认进来聚焦第一个
    this.$nextTick(() => {
      if (_this.$refs.keyInput && _this.$refs.keyInput.length && _this.$refs.keyInput[0] && _this.$refs.keyInput[0].focus) {
        _this.$refs.keyInput[0].focus();
      }
    });
  },
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
    saveParamList() {
      let list = [];
      this.paramList.forEach(item => {
        if (item.key != '' && item.type != '') {
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
    validDefaultValue() {
      let isValid = true;
      this.paramList.forEach(item => {
        if (item.isRequired && !item.editable && this.$utils.isEmpty(item.defaultValue)) {
          isValid = false;
        }
      });
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
  watch: {
    list: {
      handler(val) {
        this.paramList = this.$utils.deepClone(val);
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
.param-handler {
  line-height: 32px;
}
</style>
