<template>
  <div class="form-li">
    <div class="node-main">
      <div v-if="!disabled && !readonly" class="node-select" @click="selectList">
        <Button type="primary" ghost>
          {{ $t('term.autoexec.selectnode') }}
        </Button>
      </div>
      <div class="node-box overflow">
        <template v-if="nodeType == 'selectNodeList'">
          <TsRow v-if="nodeList.length > 0" :gutter="8">
            <Col v-for="(item, index) in getShowList(nodeList)" :key="index" :span="fileSpan">
              <div class="node-list border-color bg-op radius-sm">
                <div class="overflow" :title="targetText(item)"> {{ targetText(item) }}</div>
                <span v-if="!disabled && !readonly" class="tsfont-close btn-remove text-tip-active" @click="removeNode(item)"></span>
              </div>
            </Col>
          </TsRow>
        </template>
        <template v-else>
          <FilterSearch :defaultValue="filter" :showSearchNumber="showNumber" readonly></FilterSearch>
        </template>
      </div>
      <template v-if="nodeList.length > showNumber || Object.keys(filter).length > showNumber">
        <div class="tsfont-option-horizontal text-tip-active" @click="selectList"></div>
      </template>
    </div>
    <NodeDialog
      v-if="showDialog"
      v-model="selecValuetList"
      :nodeList="nodeList"
      :visible="showDialog"
      :config="config"
      :disabled="disabled || readonly"
      :opType="opType"
      @on-ok="onOk"
      @close="endAdd"
    ></NodeDialog>
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
  </div>
</template>
<script>
import comMixin from './editmixin.js';
export default {
  name: 'Node',
  components: {
    NodeDialog: resolve => require(['./node/node-dialog'], resolve),
    FilterSearch: resolve => require(['@/views/pages/autoexec/components/common/filter-search.vue'], resolve)
  },
  filters: {},
  mixins: [comMixin],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    desc: String,
    opType: String
  },
  data() {
    return {
      showDialog: false,
      nodeList: [],
      selecValuetList: [],
      keyword: '',
      dataConfig: {},
      validMesage: '',
      showNumber: 1,
      nodeType: 'selectNodeList', //selectNodeList:选择节点；filter：选择过滤器
      filter: {}
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
      this.showNumber = setting.showNumber || 1;
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
    onOk(list, config) {
      this.nodeList = list || [];
      this.filter = config ? config.filter : {};
      this.$emit('change', this.nodeList);
      this.$emit('getConfig', config);
      this.showDialog = false;
    },
    valid() {
      let isValid = true;
      this.validMesage = '';
      if (this.getSetting && this.getSetting.validateList && this.getSetting.validateList.includes('required') && this.nodeList.length == 0) {
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
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          this.nodeType = val.nodeType || 'selectNodeList';
          this.filter = val.filter || {};
        }
      },
      deep: true,
      immediate: true
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
