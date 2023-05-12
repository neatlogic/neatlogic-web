<template>
  <div class="form-li">
    <div class="node-main">
      <div v-if="!disabled && !readonly" class="node-select" @click="selectList">
        <Button type="primary" ghost>
          {{ $t('term.autoexec.selectnode') }}
        </Button>
      </div>
      <div v-if="nodeList.length > 0" class="node-box overflow">
        <TsRow :gutter="8">
          <Col v-for="(item, index) in getShowList(nodeList)" :key="index" :span="fileSpan">
            <div class="node-list border-color bg-op radius-sm">
              <div class="overflow" :title="targetText(item)"> {{ targetText(item) }}</div>
              <span v-if="!disabled && !readonly" class="tsfont-close btn-remove text-tip-active" @click="removeNode(item)"></span>
            </div>
          </Col>
        </TsRow>
      </div>
      <template v-if="nodeList.length > showNumber">
        <div class="tsfont-option-horizontal text-tip-active" @click="lookNodeList"></div>
      </template>
    </div>
    <AddNode
      v-if="showDialog"
      v-model="selecValuetList"
      :nodeList="nodeList"
      :visible="showDialog"
      :config="config"
      @on-ok="onOk"
      @close="endAdd"
    ></AddNode>
    <div v-if="config.desc" class="text-tip">{{ config.desc }}</div>
    <transition name="fade">
      <slot name="validMessage">
        <span
          v-if="validMesage != '' && nodeList.length == 0"
          class="form-error-tip"
          :title="validMesage"
          v-html="validMesage"
        ></span>
      </slot>
    </transition>
    <MoreTarget
      v-if="showAllDialog"
      v-model="showAllDialog"
      :isReadonly="disabled || readonly"
      :dataList="nodeList"
      @on-ok="okMore"
    ></MoreTarget> 
  </div>
</template>
<script>
import viewmixin from './viewmixin.js';
export default {
  name: 'Node',
  components: {
    AddNode: resolve => require(['../edit/node/add-node'], resolve),
    MoreTarget: resolve => require(['@/resources/components/FormMaker/formedit/view/resourceinput/more-target.vue'], resolve)
  },
  filters: {},
  mixins: [viewmixin],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    desc: String
  },
  data() {
    return {
      showDialog: false,
      nodeList: [],
      selecValuetList: [],
      keyword: '',
      dataConfig: {},
      validMesage: '',
      showAllDialog: false,
      showNumber: 2
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() { this.getDataConfig(); },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getDataConfig() {
      let setting = Object.assign({}, this.config);
      setting.validateList = setting.validateList || [];
      if (typeof this.isRequired == 'boolean') {
        //当从别的判断带过来的关于这个组件是否必填的选项时，进行原来required的覆盖
        if (this.isRequired && setting.validateList.indexOf('required') < 0) {
          setting.validateList.push('required');
        } else if (!this.isRequired && setting.validateList.indexOf('required') > -1) {
          setting.validateList = setting.validateList.filter(v => {
            return v != 'required';
          });
        }
      }
      this.dataConfig = setting;
      this.showNumber = this.dataConfig.showNumber || 2;
      this.$emit('change', this.value || []);
    },
    selectList() {
      if (this.disabled || this.readonly) {
        return;
      }
      if (this.nodeList.length > 0) {
        this.selecValuetList = this.nodeList.map(i => {
          return i.id;
        });
      } else {
        this.selecValuetList = [];
      }
      this.showDialog = true;
    },
    onOk(list) {
      this.nodeList = list || [];
      this.$emit('change', this.nodeList);
      this.showDialog = false;
    },
    valid() {
      let isValid = true;
      this.validMesage = '';
      if (this.dataConfig && this.dataConfig.validateList && this.dataConfig.validateList.includes('required') && this.nodeList.length == 0) {
        this.validMesage = this.$t('form.validate.addnode');
        isValid = false;
      }
      return isValid;
    },
    endAdd() {
      this.showDialog = false;
    },
    removeNode(obj) {
      this.nodeList.splice(this.nodeList.findIndex(item => item.id === obj.id), 1);
      this.$emit('change', this.nodeList);
    },
    lookNodeList() {
      this.showAllDialog = true;
    },
    okMore(list) {
      if (list) {
        this.nodeList = list;
        this.$emit('change', this.nodeList);
      }
      this.showAllDialog = false;
    }
  },
  computed: {
    fileSpan() {
      let span = 24 / this.showNumber;
      return span;
    },
    getShowList() {
      return function(list) {
        let showList = list.slice(0, this.showNumber);
        return showList;
      };
    },
    targetText() {
      return data => {
        return data.port && data.name ? data.ip + ':' + data.port + '/' + data.name : data.port && !data.name ? data.ip + ':' + data.port : data.ip;
      };
    }
  },
  watch: {
    value: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.nodeList = this.$utils.deepClone(newVal);
        } else {
          this.nodeList = [];
        }
      },
      deep: true,
      immediate: true
    },
    config: {
      handler() {
        this.getDataConfig();// config数据没有更新的问题，导致验证还是旧的验证信息
      },
      deep: true
    }
  }
};
</script>
<style lang='less' scoped>
.node-main{
  display: flex;
  justify-content: space-between;
   >div{
    white-space: nowrap;
    align-self: center;
    &:not(:first-child){
      padding-left: 10px;
    }
  }
  .node-box{
    width: 100%;
    flex: 1;
    text-align: left;
  }
}
.node-list{
  position: relative;
  height: 32px;
  line-height: 30px;
  padding: 0 4px;
  border: 1px solid;
  text-align: center;
  .btn-remove {
    position: absolute;
    right: -3px;
    top: -3px;
    width: 16px;
    height: 16px;
    line-height: 16px;
    display: none;
  }
  &:hover{
    .btn-remove {
      display: block;
    }
  }
}
.all-node {
  width: 100%;
  line-height: 32px;
  .search {
    display: flex;
    justify-content: flex-end;
    padding: 0 26px;
  }
  .node-content{
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    height: 300px;
    padding: 16px 26px;
    .node-list {
      margin-bottom: 16px;
    }
  }
}
</style>
