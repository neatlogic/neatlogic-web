<template>
  <div class="target-div">
    <div>
      <div class="div-content">
        <!-- 作业参数作为执行目标 -->
        <template v-if="paramList.length">
          <span class="text-tip nopadding">{{ $t('term.autoexec.jobparam') }}</span>
          <template v-for="(p,pindex) in paramList">
            <span v-if="getParamText(p.text)" :key="`p_${pindex}`" class="item border-color bg-op">{{ getParamText(p.text) }}</span>
          </template>
        </template>
        <!-- 过滤器 -->
        <template v-if="filter">
          <Filters
            ref="filterMain"
            :defaultValue="filter"
            :readonly="true"
            :bgOp="false"
            class="nopadding filter-main overflow"
            @clickMoreBtn="moreVisible=true"
          ></Filters>
          <span v-if="type=='now'" class="btn text-tip-active" @click="moreVisible=true">{{ $t('page.viewdetails') }}</span>
          <span
            v-else-if="canEdit && type=='runtime' && filter"
            class="tsfont-edit-s btn text-tip-active"
            :title="$t('page.edit')"
            @click="moreVisible=true"
          ></span>
          <span v-if="canEdit && filter" class="btn text-href" @click="clearTarget">{{ $t('page.clear') }}</span>
        </template>
        <!-- 添加按钮 -->
        <Button
          v-if="canEdit && type=='runtime' && showData.length<=0 && !filter"
          type="primary"
          ghost
          @click="addTarget()"
        ><span class="tsfont-plus btn-icon">{{ $t('term.autoexec.executetarget') }}</span>
        </Button>
        <!-- 已经选中的数据 -->
        <template v-for="(data,index) in showData">
          <span v-if="index<showNumber" :key="index" class="item border-color bg-op">{{ data.text }}</span>
        </template>
        <!-- 操作按钮 -->
        <div v-if="showData.length>0" class="btn-div">
          <span v-if="showData.length>showNumber" class="text-action tsfont-option-horizontal" @click="moreVisible=true">
            <!-- 更多省略号 -->
          </span>
          <span
            v-if="canEdit"
            class="tsfont-edit-s btn text-tip-active"
            :title="$t('page.edit')"
            @click="moreVisible=true"
          ></span>
          <span v-else-if="showData.length>showNumber" class="btn  text-tip-active" @click="moreVisible=true"> {{ $t('page.viewmore') }}</span>
          <span v-if="canEdit && (showData.length>0)" class="btn text-primary" @click="clearTarget">{{ $t('page.clear') }}</span>
        </div>
      </div>
      <transition name="fade">
        <span v-if="validMessage" class="form-error-tip" :title="validMessage">{{ validMessage }}</span>
      </transition>
      <span v-if="!canEdit && showData.length<=0 && paramList.length<=0 && !filter" class="text-tip">{{ $t('page.nodata') }}</span>
    </div>
    <!-- 编辑添加模态框 -->
    <TsDialog
      v-if="moreVisible && addType=='all'"
      type="slider"
      :isShow="moreVisible"
      width="medium"
      :title="getTitle"
      :hasFooter="canEdit"
      :maskClose="!canEdit"
      @on-close="onOkUpdateList(false)"
    >
      <div class="pl-nm pr-nm">
        <TargetDetail
          v-if="type=='runtime'"
          :id="id"
          ref="targetDetail"
          :config="valueConfig"
          :canEdit="canEdit"
          :defaultSearchValue="filterSearchValue"
        ></TargetDetail>
        <TargetView
          v-else
          :id="id"
          :config="valueConfig"
          :defaultSearchValue="filterSearchValue"
        ></TargetView>
      </div>
      <template v-slot:footer>
        <Button @click="onOkUpdateList(false)">{{ $t('page.cancel') }}</Button>
        <Button
          v-if="canEdit && type=='runtime'"
          type="primary"
          ghost
          @click="validSetting()"
        >{{ $t('page.validate') }}</Button>
        <Button type="primary" @click="okTarget()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
    <NodeDetail
      v-else-if="moreVisible && addType=='node'"
      :visible="moreVisible"
      :value="valueConfig.selectNodeList?valueConfig.selectNodeList.map(item=>item.id):[]"
      :nodeList="valueConfig.selectNodeList?valueConfig.selectNodeList:[]"
      :isValid="true"
      :config="defaultConfig"
      @on-ok="onOkNode(true,...arguments)"
      @close="onOkUpdateList(false)"
      @validSetting="nodeValidSetting"
    ></NodeDetail>
    <TargetValid
      v-if="isValidDialog"
      :visible="isValidDialog"
      :resultList="resultList"
      @save="saveValid()"
      @close="closeValid()"
    ></TargetValid>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TargetDetail: () => import('@/views/pages/autoexec/components/common/addTarget/target-detail.vue'),
    NodeDetail: () => import('@/views/pages/autoexec/components/param/edit/node/add-node.vue'),
    Filters: () => import('@/views/pages/autoexec/components/common/executionMode/filters.vue'),
    TargetView: () => import('@/views/pages/autoexec/components/common/targetView/target.vue'),
    TargetValid: () => import('@/views/pages/autoexec/components/common/targetView/target-valid.vue')
  },
  filters: {},
  props: {
    id: [Number, String],
    canEdit: {
      type: [Boolean],
      default: true
    },
    value: {
      type: Object
    },
    isRequired: {
      default: true
    },
    addType: {
      default: 'all', //现阶段值可以为all node
      type: String
    },
    type: {
      //执行方式类型
      type: String,
      default: 'runtime'
    },
    executeConfig: Object, //连接协议，用户
    runtimeParamList: Array, //作业参数
    needBorder: {
      type: Boolean,
      default: true
    },
    filterSearchValue: { //节点搜索条件
      type: Object
    },
    defaultTagFilter: Array
  },
  data() {
    return {
      validMessage: '',
      valueConfig: {},
      showData: [], //展示的数据
      moreVisible: false, //显示更多的模态框
      showNumber: 0, //是否需要展示节点的数量查看更多的操作
      paramList: [], //length > 0：表示作业参数作为执行目标
      filter: null, //过滤器
      isValidDialog: false, //校验
      executeValue: {
        protocolId: null,
        executeUser: null
      },
      defaultConfig: {},
      selectNodeList: [] //单独添加节点时，节点选中数据
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    window.addEventListener('resize', this.updateShowData);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.updateShowData);
  },
  destroyed() {},
  methods: {
    initData(val, isValid) {
      let _this = this;
      this.validMessage = '';
      this.showData = [];
      this.valueConfig = {};// 设置默认初始值，解决切换不同的组合工具，执行目标内容没有清空的问题
      this.showNumber = 0;
      this.valueConfig = Object.assign(this.valueConfig, this.$utils.deepClone(val));
      let paramList = this.valueConfig.paramList ? this.valueConfig.paramList.map(item => ({ text: item, type: 'param' })) : [];
      this.paramList = paramList;
      let nodeList = this.valueConfig.selectNodeList ? this.valueConfig.selectNodeList.map(item => ({ text: _this.targetText(item), type: 'node' })) : [];
      let inputList = this.valueConfig.inputNodeList ? this.valueConfig.inputNodeList.map(item => ({ text: _this.targetText(item), type: 'input' })) : [];
      this.showData = [].concat(nodeList, inputList);
      this.showNumber = this.showData.length;
      this.$nextTick(() => {
        this.updateShowData();
      });
      if (isValid && this.canEdit && this.isRequired && this.noTarget) {
        this.validMessage = this.$t('form.validate.required', {target: this.$t('term.autoexec.executetarget')});
      }

      if (this.showData.length > 0) {
        this.$https.post('/api/rest/resourcecenter/tag/list/forselect', {}).then(res => {
          let resdata = res.Return.tbodyList || [];
          if (resdata.length > 0) {
            this.showData.forEach((v, i) => {
              resdata.forEach(j => {
                if (v.text == j.id) {
                  v.text = j.name;
                }
              });
            });
          }
        });
      }
    },
    targetText(data) {
      return data.port && data.name ? data.ip + ':' + data.port + '/' + data.name : data.port && !data.name ? data.ip + ':' + data.port : data.ip;
    },
    updateShowData() {
      //计算位置
      if (this.$el && this.$el.querySelector('.div-content')) {
        let $el = this.$el.querySelector('.div-content');
        let width = 0;
        let showNumber = 0;
        let maxWidth = $el.clientWidth;
        let list = Array.from($el.children);
        list.forEach(el => {
          if (el.nodeName == 'SPAN') {
            width = width + el.offsetWidth + 16;
            if (width + 150 > maxWidth) {
              return true;
            }
            showNumber++;
          }
        });
        showNumber !== 0 && (this.showNumber = showNumber);
      } else {
        this.updateShowTime && clearTimeout(this.updateShowTime);
        setInterval(this.updateShowTime, 100);
      }
    },
    clearTarget() {
      this.valueConfig = {
        // selectNodeList: [],
        // paramList: [],
        // inputNodeList: [],
        // filter: null
      };
      this.showData = [];
      this.filter = null;
      if (this.isRequired) {
        this.validMessage = this.$t('form.validate.required', {target: this.$t('term.autoexec.executetarget')});
      }
    },
    onOkUpdateList(val, valueList) {
      this.moreVisible = false;
      if (val) {
        //确定
        if (this.$refs.targetDetail && this.addType == 'all') {
          //添加所有的节点
          this.valueConfig = {};
          let executeNodeConfig = this.$refs.targetDetail.save();
          for (let key in executeNodeConfig) {
            let item = executeNodeConfig[key];
            if (!this.$utils.isEmpty(item)) {
              this.$set(this.valueConfig, key, item);
            }
          }
          this.filter = executeNodeConfig.filter ? executeNodeConfig.filter : null;
        } else if (this.addType == 'node') {
          //单独添加节点
          this.valueConfig = { selectNodeList: valueList };
        }
        this.initData(this.valueConfig, true);
      }
      this.valid();
      this.$emit('on-ok');
    },
    openMore() {
      this.moreVisible = true;
    },
    valid() {
      //是否有执行目标
      let isValid = true;
      this.validMessage = '';
      if (this.canEdit && this.isRequired) {
        if (this.noTarget) {
          isValid = false;
          this.validMessage = this.$t('form.validate.required', {target: this.$t('term.autoexec.executetarget')});
        }
        return isValid;
      }
      return true;
    },
    getValue() {
      return this.valueConfig;
    },
    addTarget() {
      this.valueConfig = {};
      this.moreVisible = true;
    },
    async okTarget() {
      //执行目标保存，需要先校验判断
      if (this.$refs.targetDetail && !this.$refs.targetDetail.valid()) {
        return false;
      }
      await this.validSetting(true);
      if (this.isValidDialog) {
        return;
      } else {
        this.onOkUpdateList(true);
      }
    },
    validSetting(type, list) {
      //true不需要提示校验信息
      let data = {
        protocolId: this.executeValue.protocolId ? this.executeValue.protocolId : null,
        executeUser: null
      };
      if (this.executeValue.executeUser && this.executeValue.executeUser.value) {
        if (this.executeValue.executeUser.mappingMode === 'constant') {
          this.$set(data, 'executeUser', this.executeValue.executeUser.value);
        } else if (this.executeValue.executeUser.mappingMode === 'runtimeparam' && !this.$utils.isEmpty(this.runtimeParamList)) {
          let findItem = this.runtimeParamList.find(i => i.key === this.executeValue.executeUser.value);
          if (findItem) {
            this.$set(data, 'executeUser', findItem.defaultValue);
          }
        }
      }
      if (this.$refs.targetDetail && this.addType == 'all') {
        let executeNodeConfig = this.$refs.targetDetail.save();
        if (!this.$refs.targetDetail.valid()) {
          return false;
        } else {
          Object.assign(data, executeNodeConfig);
        }
      } else if (this.addType == 'node') {
        this.$set(data, 'selectNodeList', list || []);
      }
      this.isValidDialog = false;
      let _this = this;
      return this.$api.autoexec.action.getValidList(data).then(res => {
        if (res.Status == 'OK') {
          _this.resultList = res.Return.list || [];
          _this.resultList.length && (_this.isValidDialog = true);
          if (!_this.isValidDialog) {
            if (!type) {
              this.$Message.success(this.$t('message.validatesuccess'));
            }
          }
        }
      });
    },
    saveValid() {
      //校验完成，保存
      this.onOkUpdateList(true, this.selectNodeList);
      this.isValidDialog = false;
    },
    closeValid() {
      //关闭校验弹框
      this.isValidDialog = false;
    },
    nodeValidSetting(list) {
      this.validSetting(false, list);
    },
    async onOkNode(val, valueList) {
      //单独添加节点时
      this.selectNodeList = valueList;
      await this.validSetting(true, valueList);
      if (this.isValidDialog) {
        this.moreVisible = true;
        return;
      } else {
        this.moreVisible = false;
        this.onOkUpdateList(val, valueList);
      }
    }
  },
  computed: {
    isMore() {
      return this.showNumber <= this.showData.length;
    },
    getTitle() {
      let title = '';
      if (this.canEdit && !this.noTarget) {
        //编辑
        title = this.$t('dialog.title.edittarget', {target: this.$t('term.autoexec.executetarget')});
      } else if (this.canEdit && this.noTarget) {
        //新增
        title = this.$t('page.newtarget', {target: this.$t('term.autoexec.executetarget')});
      } else {
        //查看
        title = this.$t('page.viewtarget', {target: this.$t('term.autoexec.executetarget')});
      }
      return title;
    },

    getComponent() {
      let config = {
        all: TargetDetail,
        nodoe: NodeDetail
      };
      return config[this.addType];
    },
    noTarget() {
      return this.showData.length <= 0 && this.paramList.length <= 0 && !this.filter;
    },
    getParamText() {
      return val => {
        let find = this.runtimeParamList.find(item => item.key == val) || {};
        return find.name || '';
      };
    }
  },
  watch: {
    value: {
      handler(val) {
        this.initData(val);
        if (val) {
          let filter = !this.$utils.isEmpty(val.filter) ? this.$utils.deepClone(val.filter) : null;
          if (this.type == 'runtime') {
            if (filter && this.$utils.isEmpty(val.inputNodeList) && this.$utils.isEmpty(val.selectNodeList)) {
              this.filter = filter;
            }
          }
          if (this.type == 'now') {
            this.filter = filter;
          }
        }
      },
      immediate: true,
      deep: true
    },
    executeConfig: {
      handler(val) {
        this.executeValue = this.$utils.deepClone(val);
      },
      immediate: true,
      deep: true
    },
    defaultTagFilter: {
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          let filter = {
            tagIdList: val
          };
          this.$set(this.defaultConfig, 'filter', filter);
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang='less' scoped>
.target-div {
  .div-content {
    white-space: nowrap;
    line-height: 30px;
    overflow: hidden;
    &:hover {
      .btn-div {
        .btn {
          display: inline-block;
        }
      }
    }
    > *,
    .btn-div > span {
      padding: 0px 8px;
      display: inline-block;
      + span {
        margin-left: 10px;
      }
    }

    .add-span {
      cursor: pointer;
    }
    .item {
      padding: 0px 16px;
      border: 1px solid;
      position: relative;
      border-radius: 4px;
      > .remove {
        cursor: pointer;
        font-size: 12px;
        vertical-align: baseline;
      }
      > .icon {
        position: absolute;
        left: -2px;
        top: 0px;
        line-height: 1;
        transform: scale(0.85);
      }
    }
    .btn-div {
      display: inline-block;
      .btn {
        cursor: pointer;
      }
    }
    .nopadding {
      padding: 0 !important;
    }
    .filter-main {
      max-width: 80%;
    }
  }
}
</style>
