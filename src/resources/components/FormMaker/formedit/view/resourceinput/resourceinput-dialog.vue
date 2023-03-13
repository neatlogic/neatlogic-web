/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div>
    <div v-if="!isReadonly">
      <div class="btn-list">
        <Button @click="addNode">添加目标</Button>
        <Button v-if="currentDataList.length > 0" @click="clearAll('current')">清空</Button>
      </div>
      <div v-if="currentDataList.length > 0">
        <NodeView
          :isReadonly="isReadonly"
          :list="currentDataList"
          @onOk="onOk"
        ></NodeView>
      </div>
      <transition name="fade">
        <span v-if="validMesage != ''" class="form-error-tip">{{ validMesage }}</span>
      </transition>
    </div>
    <div v-else>
      <NodeView :isReadonly="isReadonly" :list="currentDataList"></NodeView>
    </div>
    <TsDialog
      type="slider"
      :isShow.sync="isShowModal"
      width="large"
      title="添加目标"
      className="resourceinput-dialog"
      @on-ok="okAdd"
      @on-close="close"
    >
      <div class="add-input">
        <TsRow class="input-border" :gutter="4">
          <Col :span="11">
            <div class="bg-op input-show radius-sm">
              <div class="text-tip fz10 tip-input line-2 mb-md" title="主机类目标输入格式为 IP，服务类目标输入格式为IP:PORT，数据库类目标格式为IP:PORT/SID，一行一个目标">
                <span class="tsfont-question-o input-dec"></span>
                主机类目标输入格式为 IP，服务类目标输入格式为IP:PORT，数据库类目标格式为IP:PORT/SID，一行一个目标
              </div>
              <Input
                v-model="value"
                type="textarea"
                :rows="9"
                :placeholder="inputPlaceholder"
              ></Input>
              <div class="footer-btn">
                <Button type="primary" ghost @click="addTarget()">添加到目标</Button>
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
                          <template v-if="messageConfig.list.length -1 > iindex">、</template>
                        </span>
                        <span>未在资产清单中找到对应资产，执行时将跳过上述目标</span>
                      </template>
                    </div>
                  </Tooltip>
                </div>
              </div>
            </div>
          </Col>
          <Col :span="13">
            <div class="bg-op node-show radius-sm">
              <div v-if="newDataList.length>0" class="text-href clear-btn" @click="clearAll('new')">{{ $t('page.clear') }}</div>
              <Row :gutter="10">
                <Col v-for="(data,index) in newDataList" :key="index" :span="8">
                  <div class="item-span bg-op border-color overflow radius-sm">
                    <span :title="targetText(data)">
                      {{ targetText(data) }}
                    </span>
                    <i class="tsfont-close text-tip" @click="removeItem(index)"></i>
                  </div>
                </Col>
              </Row>
              <div v-if="newDataList.length==0" class="text-tip no-data-tip">未添加执行目标</div>
            </div>
          </Col>
        </TsRow>
      </div>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    NodeView: resolve => require(['./node-view'], resolve)
  },
  filters: {},
  props: {
    isReadonly: {
      type: Boolean,
      default: false
    },
    defaultValue: {
      type: Array,
      default: () => []
    },
    setting: Object, //组件配置里面设置的属性值
    formView: {//false 代表着组件显示在布局编辑那一块（作用：简化显示，节约性能），  true 代表着通过form-view页面显示
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      currentDataList: [],
      validMesage: '',
      isShowModal: false,
      newDataList: [],
      inputPlaceholder: `192.168.0.33
192.168.0.1:22
192.168.0.1:3306/instance_name`,
      showNumber: 15,
      messageConfig: {
        error: '',
        info: '',
        succee: '',
        list: []
      },
      errorMessage: '',
      value: ''
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
    addNode() {
      this.messageConfig = { error: '', info: '', succee: '', list: [] };
      this.newDataList = this.$utils.deepClone(this.currentDataList);
      this.isShowModal = true;
    },
    async addTarget() {
      this.messageConfig = { error: '', info: '', succee: 0, list: [] };
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
        arr = { ip: arr[0].trim() };
        if (port) {
          this.$set(arr, 'port', port.trim());
        }
        if (name) {
          this.$set(arr, 'name', name.trim());
        }
        if (_this.newDataList.find(c => (c.port && !c.name ? str == c.ip + ':' + c.port : c.port && c.name ? str == c.ip + ':' + c.port + '/' + c.name : str == c.ip))) {
          repeatList.push(str);
        } else {
          this.newDataList.unshift(arr);
          this.messageConfig.succee++;
        }
      });
      this.messageConfig.succee = `成功导入${this.messageConfig.succee}个目标；`;
      this.messageConfig.error = errorList.length > 0 ? `${errorList.join('、')} 格式不正确；` : '';
      this.messageConfig.info = repeatList.length > 0 ? `${repeatList.join('、')} 目标重复；` : '';
      //后台校验
      if (this.formView) {
        let channelUuid = this.$route.query.uuid || null;
        let processTaskId = this.$route.query.processTaskId || sessionStorage.getItem('processTaskId') || null;
        if (channelUuid || processTaskId) {
          let data = {
            data: this.newDataList,
            attributeUuid: this.setting.uuid,
            config: {}
          };
          processTaskId ? (data.config.processTaskId = processTaskId) : (data.config.channelUuid = channelUuid);
          let res = await this.$api.framework.form.validFormDate(data);
          if (res.Status == 'OK' && res.Return && res.Return.list) {
            let list = res.Return.list;
            list.length && (this.messageConfig.list = list[0].list);
          } 
        }
      }
    },
    removeItem(index) {
      this.newDataList.splice(index, 1);
    },
    clearAll(type) {
      if (type == 'current') {
        this.currentDataList = [];
      } else {
        this.newDataList = [];
      }
    },
    okAdd() {
      this.currentDataList = this.$utils.deepClone(this.newDataList);
      this.close();
    },
    onOk(val) {
      if (val) {
        this.currentDataList = val;
      }
    },
    close() {
      this.isShowModal = false;
      this.value = '';
      this.newDataList = [];
    },
    save() {
      return this.currentDataList;
    },
    removeCurrentItem(index) {
      this.currentDataList.splice(index, 1);
    }
  },
  computed: {
    targetText() {
      return data => {
        return data.port && data.name ? data.ip + ':' + data.port + '/' + data.name : data.port && !data.name ? data.ip + ':' + data.port : data.ip;
      };
    }
  },
  watch: {
    defaultValue: {
      handler(val) {
        this.currentDataList = [].concat(val || []);
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang='less' scoped>
.btn-list{
  padding-bottom: 8px;
  >button {
    margin-right: 10px;
  }
}
.resourceinput-dialog {
  min-width: 760px;
  .add-input {
    textarea {
      line-height: 1.5;
    }
    .footer-btn {
      display: flex;
      padding-top: 12px;
      align-items: flex-end;
      .input-valid {
        flex: 1;
        padding-left: 10px;
        overflow: hidden;
        .valid-text,
        /deep/ .ivu-tooltip,
        /deep/ .ivu-tooltip-rel {
          max-width: 100%;
        }
      }
    }
    .item-span {
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
      .node-name {
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
      &:hover {
        .tsfont-close {
          display: block;
        }
      }
    }
    .div-btn {
      text-align: right;
      > span {
        margin-right: 16px;
      }
    }
  }
  .input-show {
    padding: 16px;
    height: calc(100vh - 160px);
    overflow-y: auto;
    .tip-input {
      position: relative;
      padding-left: 16px;
      min-height: 34px;
      .input-dec {
        position: absolute;
        top: 0;
        left: 0;
      }
    }
  }
  .node-show {
    padding: 16px;
    width: 100%;
    height: calc(100vh - 160px);
    overflow-y: auto;
    .clear-btn {
      text-align: right;
      margin-bottom: 8px;
    }
    .no-data-tip {
      text-align: center;
      line-height: 270px;
    }
  }
}
</style>
