<template>
  <div class="input-main">
    <div class="content">
      <div class="add-input">
        <Row v-if="canEdit" class="input-border" :gutter="4">
          <Col :span="11">
            <div class="bg-op input-show radius-sm" :class="!isValid?'border-error':''">
              <div class="text-tip fz10 tip-input line-2 mb-md" :title="$t('term.autoexec.ipformattip')">
                <span class="tsfont-question-o input-dec"></span>
                {{ $t('term.autoexec.ipformattip') }}
              </div>
              <Input 
                v-model="value"
                type="textarea"
                :autosize="{minRows: 9,maxRows: 9}"
                :placeholder="inputPlaceholder"
              ></Input>
              <div class="footer-btn">
                <Button type="primary" ghost @click="addTarget">{{ $t('term.autoexec.addtotarget') }}</Button>
                <div class="input-valid" :class="messageConfig.error+messageConfig.info? 'text-href':'text-primary'">
                  <Tooltip max-width="320" theme="light" transfer>
                    <div class="valid-text overflow tips">
                      <span>{{ messageConfig.succee+messageConfig.error+messageConfig.info }}</span>
                      <template v-if="nonExistList.length > 0">
                        <span>{{ getNonExistListText() }}</span>
                        <span>{{ !$utils.isEmpty(defaultSearchValue)?$t('message.autoexec.emptyfiltervalue'):$t('message.autoexec.notfoundsys') }}</span>
                      </template>
                    </div>
                    <div slot="content">
                      <span>{{ messageConfig.succee+messageConfig.error+messageConfig.info }}</span>
                      <div v-if="nonExistList.length > 0">
                        <span>{{ getNonExistListText() }}</span>
                        <span>{{ !$utils.isEmpty(defaultSearchValue)?$t('message.autoexec.emptyfiltervalue'):$t('message.autoexec.notfoundsys') }}</span>
                      </div>
                    </div>
                  </Tooltip>
                </div>
              </div>
            </div>
          </Col>  
          <Col :span="13">
            <div class="bg-op node-show radius-sm">
              <div v-if="currentDataList.length>0" class="text-href clear-btn" @click="clearAll">{{ $t('page.clear') }}</div>
              <Row :gutter="10">
                <Col v-for="(data,index) in currentDataList.slice(0, showNumber)" :key="index" :span="8">
                  <div class="item-span bg-op border-color overflow radius-sm">
                    <span :title="targetText(data)">
                      {{ targetText(data) }}
                    </span>
                    <i class="tsfont-close text-tip" @click="removeItem(index)"></i>
                  </div>
                </Col>
              </Row>
              <div v-if="currentDataList.length>showNumber" class="text-grey div-btn tips">
                <span class="text-tip-active" @click="isMoreNode = true">{{ $t('term.autoexec.viewalltarget', {target: currentDataList.length}) }}</span>
              </div>
              <div v-if="currentDataList.length==0" class="text-tip no-data-tip">{{ $t('term.autoexec.notaddtotarget') }}</div>
            </div>
          </Col>
        </Row>
        <template v-else>
          <NodeView :list="currentDataList"></NodeView>
        </template>
        <MoreTarget
          v-if="isMoreNode"
          v-model="isMoreNode"
          :isReadonly="!canEdit"
          :dataList="currentDataList"
          @on-ok="onOk"
        ></MoreTarget>  
      </div>
    </div>
  </div>
  
</template>
<script>
import addtargetmixin from './addtargetmixin.js';
import {mutations} from '@/views/pages/autoexec/detail/actionDetail/actionState.js';
export default {
  name: '',
  components: {
    MoreTarget: resolve => require(['@/resources/components/FormMaker/formedit/view/resourceinput/more-target.vue'], resolve),
    NodeView: resolve => require(['../targetView/node-view'], resolve)
  },
  filtes: {},
  mixins: [addtargetmixin],
  props: {
  },
  data() {
    return {
      showNumber: 15,
      messageConfig: {
        error: '',
        info: '',
        succee: ''
      },
      errorMessage: '',
      value: '',
      isMoreNode: false,
      currentDataList: [],
      inputPlaceholder: `192.168.0.33
192.168.0.1:22
192.168.0.1:3306/instance_name`,
      nonExistList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async addTarget() {
      let addList = [];
      this.messageConfig = { error: '', info: '', succee: 0};
      if (!this.value.trim()) {
        return false;
      } 
      //前端校验
      let _this = this;
      let errorList = [];
      let list = this.value.trim().split('\n');
      let pattern = /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))(\:([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5]))?(\/\S{1,})?$/;
      list = list.filter((item, index) => {
        item = item.trim();
        if (item && pattern.test(item)) {
          return item;
        } else if (item) {
          errorList.push(item);
        }
      });
      let repeatList = [];
      list.forEach(data => {
        let str = data;
        let arr = null;
        let port = '';
        let name = '';
        if (str.indexOf(':') != -1) {
          arr = str.split(':');
          port = arr[1];
        } else {
          arr = [str];
        }
        if (arr[1] && arr[1].indexOf('/') != -1) {
          let arr1 = arr[1].split('/');
          arr[1] = arr1[0];
          port = arr1[0];
          name = arr1[1];
        }
        arr = {ip: arr[0].trim()};
        if (port) {
          this.$set(arr, 'port', port.trim());
        }
        if (name) {
          this.$set(arr, 'name', name.trim());
        }
        
        if (_this.currentDataList.find(c => c.port && !c.name ? str == c.ip + ':' + c.port : c.port && c.name ? str == c.ip + ':' + c.port + '/' + c.name : str == c.ip)) {
          repeatList.push(str);
        } else {
          addList.push(arr);
        }
      });
      if (addList.length > 0) {
        //接口校验
        await this.validinputnodelist(addList);
      }
      this.messageConfig.error = errorList.length > 0 ? `${errorList.join('、')} ` + this.$t('term.autoexec.formaterror') : '';
      this.messageConfig.info = repeatList.length > 0 ? `${repeatList.join('、')}` + this.$t('term.autoexec.targetrepetition') : '';
    },
    removeItem(index) {
      this.currentDataList.splice(index, 1);
    },
    clearAll() {
      this.currentDataList = [];
    },
    save() {
      return {inputNodeList: this.currentDataList};
    },
    onOk(val) {
      val && (this.currentDataList = val);
      this.isMoreNode = false;
    },
    valid() {
      if (!this.currentDataList.length) {
        this.isValid = false;
      } else {
        this.isValid = true;
      }
      return this.isValid;
    },
    targetText(data) {
      return data.port && data.name ? data.ip + ':' + data.port + '/' + data.name : data.port && !data.name ? data.ip + ':' + data.port : data.ip;
    },
    validinputnodelist(list) {
      let data = {
        filter: this.defaultSearchValue,
        inputNodeList: list,
        cmdbGroupType: this.opType
      };
      return this.$api.autoexec.action.validinputnodelist(data).then(res => {
        if (res.Status == 'OK') {
          let existList = res.Return.existList || [];
          this.nonExistList = res.Return.nonExistList || [];
          if (existList.length > 0) {
            this.currentDataList.unshift(...existList);
          }
          this.messageConfig.succee = this.$t('term.autoexec.importsuccesstarget', {target: existList.length});
        }
      });
    },
    getNonExistListText() {
      let textList = [];
      this.nonExistList.forEach(item => {
        textList.push(this.targetText(item));
      });
      return textList.join('、');
    }
  },
  computed: {
    opType() { 
      return mutations.getOpType();
    }
  },
  watch: {
    defaultValue: {
      handler(val) {
        val && (this.currentDataList = [].concat(val || []));
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang='less' scoped>
.input-main{
  margin-bottom: 16px;
  .top{
    display: flex;
    padding: 16px;
    line-height: 1;
    border: 1px solid;
    >div {
      align-self: center;
    }
    .type-name{
      min-width: 70px;
    }
  }
  .content{
    margin-top: 4px;
  }
}
.add-input{
  textarea{
    line-height: 1.5;
  }
  .footer-btn{
    display: flex;
    padding-top: 12px;
    align-items: flex-end;
    .input-valid {
      flex: 1;
      padding-left: 10px;
      overflow:hidden;
      .valid-text,
      /deep/ .ivu-tooltip,
       /deep/ .ivu-tooltip-rel{
        max-width: 100%;
      }
    }
  }
  .item-span{
    width: 100%;
    display: inline-block;
    position: relative;
    height: 32px;
    line-height: 30px;
    padding: 0 4px;
    border: 1px solid;
    text-align: center;
    margin-bottom: 10px;
    border-radius: 4px;
    .tsfont-close {
      position: absolute;
      right: -3px;
      top: -3px;
      width: 16px;
      height: 16px;
      line-height: 16px;
      display: none;
      cursor: pointer;
    }
    &:hover{
      .tsfont-close {
        display: block;
      }
    }
  }
  .div-btn{
    text-align: right;
    >span{
      margin-right: 16px;
    }
  }
}
.input-show{
  padding: 16px;
  height: 310px;
  .tip-input {
    position: relative;
    padding-left: 16px;
    line-height: 1.5;
    .input-dec{
      position: absolute;
      top: 0;
      left: 0;
    }
  }
}
.node-show{
  padding: 16px;
  height: 310px;
  .clear-btn{
    text-align: right;
    margin-bottom: 12px;
  }
  .no-data-tip{
    text-align: center;
    line-height: 310px;
  }
}
</style>
