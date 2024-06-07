<template>
  <div class="resourceinput-nomarl">
    <div class="add-input">
      <div class="edit-main">
        <div class="edit-input">
          <div class="bg-op input-show input-border radius-sm">
            <div class="text-tip fz10 tip-input line-2 mb-md" title="主机类目标输入格式为 IP，服务类目标输入格式为IP:PORT，数据库类目标格式为IP:PORT/SID，一行一个目标">
              <span class="tsfont-question-o input-dec"></span>
              主机类目标输入格式为 IP，服务类目标输入格式为IP:PORT，数据库类目标格式为IP:PORT/SID，一行一个目标
            </div>
            <Input
              v-model="value"
              type="textarea"
              :autosize="{minRows: 8,maxRows: 8}"
              :placeholder="inputPlaceholder"
            ></Input>
            <div class="footer-btn">
              <Button type="primary" ghost @click="addTarget">添加到目标</Button>
              <div class="input-valid" :class="messageConfig.error+messageConfig.info? 'text-href':'text-primary'">
                <Tooltip max-width="320" theme="light" transfer>
                  <div class="valid-text overflow tips">
                    {{ messageConfig.succee+messageConfig.error+messageConfig.info }}
                    <template v-if="messageConfig.list.length > 0">
                      <span>以下目标：</span>
                      <span v-for="(i,iindex) in messageConfig.list" :key="iindex">
                        {{ i.ip }}
                        <template v-if="i.port">:{{ i.port }}</template>
                        <template v-if="i.name">/{{ i.name }}</template>
                        <template v-if="messageConfig.list.length -1 > iindex">、</template>
                      </span>
                      <span>未在资产清单中找到对应资产，执行时将跳过上述目标</span>
                    </template>
                  </div>
                  <div slot="content">
                    <span>{{ messageConfig.succee+messageConfig.error+messageConfig.info }}</span>
                    <template v-if="messageConfig.list.length > 0">
                      <span>以下目标：</span>
                      <span v-for="(i,iindex) in messageConfig.list" :key="iindex">
                        {{ i.ip }}
                        <template v-if="i.port">:{{ i.port }}</template>
                        <template v-if="i.name">/{{ i.name }}</template>
                        <template v-if="messageConfig.list.length-1 > iindex">、</template>
                      </span>
                      <span>未在资产清单中找到对应资产，执行时将跳过上述目标</span>
                    </template>
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
        <div class="edit-node">
          <div class="bg-op node-show radius-sm">
            <template v-if="currentDataList.length>0">
              <TsRow :gutter="10">
                <Col :span="24">
                  <div class="text-href clear-btn" @click="clearAll">{{ $t('page.clear') }}</div>
                </Col>
                <Col v-for="(data,index) in showDataList(currentDataList)" :key="index" :span="8">
                  <div class="item-span bg-op border-color">
                    <span :title="targetText(data)" class="node-name overflow">
                      {{ targetText(data) }}
                    </span>
                    <i class="tsfont-close text-tip" @click="removeItem(index)"></i>
                  </div>
                </Col>
                <Col v-if="currentDataList.length>showNumber" :span="24">
                  <div class="tips text-tip-active div-btn" @click="isMoreNode = true">查看所有{{ currentDataList.length }}个目标</div>
                </Col>
              </TsRow>
            </template>
            <div v-if="currentDataList.length==0" class="text-tip no-data-tip">未添加执行目标</div>
          </div>
        </div>
      </div>
      <MoreTarget
        v-if="isMoreNode"
        v-model="isMoreNode"
        :dataList="currentDataList"
        @on-ok="onOk"
      ></MoreTarget>
    </div>
  </div>
</template>
<script>

export default {
  name: 'Resourceinput',
  components: {
    MoreTarget: () => import('@/resources/components/FormMaker/formedit/view/resourceinput/more-target.vue')
  },
  filtes: {},
  props: {
    currentValue: Object,
    setting: Object, //组件配置里面设置的属性值
    formView: {//false 代表着组件显示在布局编辑那一块（作用：简化显示，节约性能），  true 代表着通过form-view页面显示
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showNumber: 15,
      messageConfig: {
        error: '',
        info: '',
        succee: '',
        list: []
      },
      errorMessage: '',
      value: '',
      isMoreNode: false,
      currentDataList: [],
      inputPlaceholder: `192.168.0.33
192.168.0.1:22
192.168.0.1:3306/instance_name`
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
      this.messageConfig = { error: '', info: '', succee: 0, list: []};
      if (!this.value.trim()) {
        this.messageConfig.succee = '';
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
          this.currentDataList.unshift(arr);
          this.messageConfig.succee++;
        }
      });
      this.messageConfig.succee = `成功导入${this.messageConfig.succee}个目标；`;
      this.messageConfig.error = errorList.length > 0 ? `${errorList.join('、')} 格式不正确；` : '';
      this.messageConfig.info = repeatList.length > 0 ? `${repeatList.join('、')} 目标重复；` : '';
      //接口校验
      if (this.formView) {
        let channelUuid = sessionStorage.getItem('channelUuid') || null;
        let processTaskId = this.$route.query.processTaskId || sessionStorage.getItem('processTaskId') || null;
        if (channelUuid || processTaskId) {
          let params = {
            data: {
              inputNodeList: _this.currentDataList,
              type: 'input'
            },
            attributeUuid: this.setting.uuid,
            config: {}
          };
          processTaskId && this.$set(params.config, 'processTaskId', processTaskId);
          channelUuid && this.$set(params.config, 'channelUuid', channelUuid);
          await this.$https.post('/api/rest/process/form/attribute/check', params).then(res => {
            if (res.Status == 'OK' && res.Return && !res.Return.result) {
              let list = res.Return.list;
              list.length && (this.messageConfig.list = list);
            }
          });
        }
      }
    },
    removeItem(index) {
      this.currentDataList.splice(index, 1);
    },
    clearAll() {
      this.currentDataList = [];
    },
    save() {
      return this.currentDataList;
    },
    onOk(val) {
      if (val) {
        this.currentDataList = val;
      }
      this.isMoreNode = false;
    }
  },
  computed: {
    targetText() {
      return data => {
        return data.port && data.name ? data.ip + ':' + data.port + '/' + data.name : data.port && !data.name ? data.ip + ':' + data.port : data.ip;
      };
    },
    showDataList() {
      return val => {
        let list = val.slice(0, this.showNumber);
        return list;
      };
    }
  },
  watch: {
    currentValue: {
      handler(val) {
        if (!this.$utils.isEmptyObj(val)) {
          let data = this.$utils.deepClone(val);
          this.currentDataList = data.inputNodeList || [];
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
.resourceinput-nomarl{
  .add-input{
    min-width: 760px;
  }
  .edit-main{
    display: flex;
    justify-content: space-between;
    .edit-input{
      width: 50%;
      padding-right: 10px;
    }
    .edit-node {
      width: 50%;
      padding-right: 6px;
    }
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
    .node-name{
      display: inline-block;
      width: 100%;
    }
    .tsfont-close {
      position: absolute;
      right: 0px;
      top: 0px;
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
  height: 300px;
  .tip-input {
    position: relative;
    padding-left: 16px;
    min-height: 34px;
    .input-dec{
      position: absolute;
      top: 0;
      left: 0;
    }
  }
}
.node-show{
  padding: 8px 16px;
  width: 100%;
  height: 300px;
  .clear-btn{
    text-align: right;
    margin-bottom: 8px;
  }
  .no-data-tip{
    text-align: center;
    line-height: 270px;
  }
}
</style>
