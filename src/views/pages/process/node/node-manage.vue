<template>
  <div>
    <Loading :loadingShow="nodeLoading" type="fix"></Loading>
    <TsContain @scroll="scroll">
      <template v-slot:topLeft>
        <TsFormSelect v-model="keyword" v-bind="selectConfig" @on-change="getNodeList"></TsFormSelect>
      </template>
      <template v-slot:topRight>
        <div style="text-align: right">
          <Button type="primary" :disabled="saving" @click="saveConfig">{{ $t('page.save') }}</Button>
        </div>
      </template>
      <div slot="content" class="content input-border">
        <template v-if="nodeList && nodeList.length > 0">
          <div
            v-for="(node, index) in nodeList"
            :id="node.handler"
            :key="index"
            class="panle-contain bg-op"
          >
            <div class="title-left">
              <i :class="['type-icon', node.icon]"></i>
              {{ node.name }}
            </div>
            <div class="contain-right">
              <div v-if="node.config.authorityList">
                <p class="text-title block-title">
                  <span class="bg-block" :class="{ 'text-primary': node.handler == nodeType && actionType == 'auth' }">{{ $t('page.auth') }}</span>
                  <span class="border-line dividing-color" :class="{ 'border-primary': node.handler == nodeType && actionType == 'auth' }"></span>
                </p>
                <Row class="block-div">
                  <Col
                    v-for="(authority, authorityIndex) in node.config.authorityList"
                    :key="authorityIndex"
                    class="col-span"
                    span="8"
                    style="padding-bottom: 4px"
                  >
                    <span class="text-grey span-title">{{ authority.text }}</span>
                    <UserSelect
                      v-model="authority.acceptList"
                      :is-change-write="false"
                      :groupList="authority.groupList"
                      transfer
                    ></UserSelect>
                  </Col>
                </Row>
              </div>
              <template v-for="map in mapList">
                <div v-if="node.config[map.value]" :key="map.value">
                  <p class="text-title block-title">
                    <span class="bg-block" :class="{ 'text-primary': node.handler == nodeType && actionType == 'button' }">{{ map.text }}</span>
                    <span class="border-line dividing-color" :class="{ 'border-primary': node.handler == nodeType && actionType == 'button' }"></span>
                  </p>
                  <Row class="block-div">
                    <Col
                      v-for="(custom, customIndex) in node.config[map.value]"
                      :key="customIndex"
                      class="col-span custom-flex"
                      span="8"
                    >
                      <span class="custom-col-2 overflow" :title="custom.text">{{ custom.text }}</span>
                      <span class="custom-col-1">
                        <img src="~@/resources/assets/images/itsm/btn-relevance.png" />
                      </span>
                      <span class="custom-col-3" style="padding-left: 10%">
                        <Input v-model="custom.value" :placeholder="custom.text" />
                      </span>
                    </Col>
                  </Row>
                </div>
              </template>
            </div>
          </div>
        </template>
        <div v-else>
          <NoData></NoData>
        </div>
      </div>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: 'NodeManage',
  components: {
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: [],
  data() {
    return {
      keyword: '',
      nodeLoading: true,
      nodeList: [],
      selectConfig: {
        // 节点名称下拉
        url: '/api/rest/process/step/handler/search',
        rootName: 'stepHandlerList',
        valueName: 'name',
        textName: 'name',
        placeholder: this.$t('form.placeholder.pleaseselect', { target: this.$t('term.process.nodename') }),
        transfer: true,
        search: true,
        border: 'border'
      },
      mapList: [
        { value: 'customButtonList', text: this.$t('term.process.btnmapping') },
        { value: 'customStatusList', text: this.$t('term.process.statusmapping') },
        { value: 'replaceableTextList', text: this.$t('term.process.othersmapping') }
      ],
      saving: false,
      nodeType: null, //用于从别处过来的时候获取是哪一种节点类型
      actionType: null, //用于从别处过来的时候获取是哪一种参数
      isFinishscroll: true //判断定位到指定节点类型的事件是否完成
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.getNodeList();
    let _this = this;
    if (this.$route.query && Object.keys(this.$route.query).length) {
      this.$route.query.nodeType && (this.nodeType = this.$route.query.nodeType);
      this.$route.query.actionType && (this.actionType = this.$route.query.actionType);
      this.$nextTick(() => {
        if (this.nodeType && this.$el.querySelector('#' + this.nodeType)) {
          _this.$el.querySelector('#' + this.nodeType).scrollIntoView(true);
          _this.isFinishscroll = false;
        }
      });
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getNodeList() {
      let _this = this;
      return this.$api.process.process.getNodeList({ keywork: this.keyword }).then(res => {
        if (res.Status == 'OK') {
          _this.nodeList = res.Return.stepHandlerList;
          _this.nodeList.forEach(async item => {
            if (item.config.authorityList && item.config.authorityList.length) {
              item.config.authorityList.forEach(authority => {
                // acceptList为null代表是初始化数据，用户没有设置过，这是将defaultValue的值赋给acceptList
                // acceptList为[]代表是用户设置为不授权给任何人
                if (authority.acceptList == null) {
                  this.$set(authority, 'acceptList', authority.defaultValue);
                }
              });
            }
          });
          _this.nodeLoading = false;
        }
      });
    },
    getValue(handler) {
      let valueList = [];
      this.nodeList &&
        this.nodeList.forEach(item => {
          if (handler && item.handler != handler) {
            return;
          }
          let enableAuthority = 0;
          let { authorityList = [] } = item.config || {};
          if (!this.$utils.isEmpty(authorityList) && authorityList.length > 0) {
            authorityList.forEach(authority => {
              if (authority.acceptList && authority.acceptList.length > 0) {
                enableAuthority = 1;
              }
            });
          }
          let data = {
            handler: item.handler,
            config: Object.assign(
              {},
              item.config,
              {
                authorityList: authorityList
              },
              { enableAuthority: enableAuthority }
            )
          };
          //映射字段处理
          this.mapList.forEach(cc => {
            data.config[cc.value] = item.config[cc.value];
          });
          valueList.push(data);
        });
      return valueList;
    },
    valid() {
      let isSubmit = true;
      if (!isSubmit) {
        this.$Message.warning(this.$t('form.validate.required', { target: this.$t('page.notificationstrategy') }));
        return;
      }
      return isSubmit;
    },
    saveConfig() {
      let nodeValueList = {
        processStepHandlerList: []
      };
      if (this.valid()) {
        nodeValueList.processStepHandlerList = this.getValue();
        if (!this.saving) {
          this.saving = true;
          this.$api.process.process
            .saveNode(nodeValueList)
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.savesuccess'));
              }
            })
            .finally(() => {
              this.saving = false;
            });
        }
      }
    },
    scroll(e) {
      //一旦滚动，清除从别处带来的定位
      let _this = this;
      if (_this.$el && this.nodeType && _this.$el.querySelector('#' + this.nodeType)) {
        if (_this.$el.querySelector('#' + this.nodeType).offsetTop != e) {
          _this.nodeType = null;
          _this.actionType = null;
        }
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>

<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';

.content {
  .ivu-input-small {
    height: 24px !important;
    padding: 1px 7px !important;
  }

  .custom-flex {
    display: flex;
    align-items: center;
    padding-bottom: 10px;
    .custom-col-1 {
      flex: 1;
    }

    .custom-col-2 {
      flex: 2;
    }
    .custom-col-3 {
      flex: 3;
    }
  }
  .error-color {
    border-color: @error-color !important;
  }
  .text-href.tsfont-plus-o {
    &::before {
      padding-right: 5px;
    }
  }

  .panle-contain {
    position: relative;
    padding: 14px 14px 14px 150px;
    border-radius: 10px;
    margin-bottom: 12px;

    .block-title {
      position: relative;

      > .bg-block {
        position: relative;
        padding-right: 15px;
        z-index: 1;
        > .name {
          float: left;
          margin-right: 8px;
        }
        > .select {
          float: left;
        }
        .notify-icon {
          padding-left: 8px;
          cursor: pointer;
        }
      }

      > .border-line {
        border-top: 1px solid;
        height: 1px;
        position: absolute;
        left: 0;
        right: 0;
        top: 15px;
        &.notify {
          left: 200px;
          right: 110px;
        }
      }

      line-height: 2.4;
      padding-bottom: 6px;
    }

    .block-div {
      padding-bottom: 16px;
      > .isHidden {
        display: none;
      }
    }

    .title-left {
      position: absolute;
      width: 150px;
      left: 0px;
      padding-top: 50px;
      text-align: center;

      .type-icon {
        display: block;
        line-height: 35px;
        font-size: 20px;

        &::before {
          font-weight: normal;
        }
      }
    }

    .col-span {
      padding-right: 5%;
    }

    .notify-col {
      .notify-btn {
        visibility: hidden;
        opacity: 0.6;
        font-size: 12px;
        padding: 0px 5px;
        cursor: pointer;

        &:hover {
          opacity: 0.8;
        }
      }

      &:hover {
        .notify-btn {
          visibility: visible;
        }
      }
    }

    .span-title {
      line-height: 2;
    }

    .notify-panle {
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 2px;
      box-shadow: 0px 0px 4px 0px @default-boxshadow-main;
    }
  }
}
</style>
