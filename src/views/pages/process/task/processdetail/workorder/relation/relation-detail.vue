<template>
  <div class="task-relation" :style="setContentHeight(contentHeight)">
    <div v-if="isShowTip" class="tip-block">
      <div class="bg-info-grey padding-sm radius-sm">
        <span class="tsfont-danger-o text-primary btn-icon"></span>
        <span>当前工单所在服务未配置任何关系类型，无法手动关联其他工单，如需添加，请联系管理员!</span>
      </div>
    </div>
    <div v-if="!isShowTip" class="add-top">
      <span class="tsfont-plus text-href" @click="relatedTask">关联</span>
    </div>
    <div v-if="processTaskRelationList && processTaskRelationList.length >0">
      <div v-for="(item,index) in processTaskRelationList" :key="index" class="relation-list border-color">
        <div class="relation-detail">
          <div v-if="item.isDeletable !=1" class="tranferReport-tip bg-warning">转</div>
          <div class="item-box overflow">
            <span class="text-grey fz10">工单标题</span>
            <span class="text-href overflow" :title="item.title" @click="toTaskdetail(item.processTaskId)">{{ item.title }}</span>
          </div>
          <div class="item-box overflow">
            <span class="text-grey fz10">
              工单号
            </span>
            <span class="item-serialNumber overflow">
              <span class="text-href" @click="toTaskdetail(item.processTaskId)">{{ item.serialNumber }}</span> 
              <i v-clipboard="item.serialNumber" v-clipboard:success="clipboardSuc" class="tsfont-copy text-action"></i>
            </span>
          </div>
          <div class="item-box overflow">
            <span class="text-grey fz10">
              关系类型
            </span>
            <span class="overflow" :title="item.channelTypeRelationName">{{ item.channelTypeRelationName }}</span>
          </div>
          <div class="item-box overflow">
            <span class="text-grey fz10">
              状态
            </span>
            <span>{{ item.statusVo.text }}</span>
          </div>
          <div
            class="del-relation tsfont-unbind bg-block"
            :class="item.isDeletable !=1?'text-disabled':'text-action'"
            :title="item.isDeletable !=1?'转报自动关联无法解除':''"
            @click="delTaskRelation(item)"
          >解除关联</div>
        </div>
      </div>
    </div>
    <SelectRelationDialog
      v-if="relatedTaskModal"
      :isShow="relatedTaskModal"
      :processTaskId="processTaskId"
      :channelUuid="channelUuid"
      @close="closeRelation"
      @updateRelation="getTaskRelationList"
    ></SelectRelationDialog>
  </div>
</template>
<script>
import SelectRelationDialog from './select-relation-dialog';
import clipboard from '@/resources/directives/clipboard.js';
export default {
  name: '',
  components: {
    SelectRelationDialog
  },
  directives: {clipboard},
  filters: {},
  props: {
    processTaskConfig: Object,
    relationAuth: {
      type: String,
      default: null
    },
    contentHeight: [Number, String]
  },
  data() {
    return {
      relatedTaskModal: false,
      channelUuid: null,
      processTaskRelationList: [],
      isShowTip: true
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.processTaskId = this.$route.query.processTaskId || null;
    this.getTaskRelationList();
    if (this.processTaskConfig) {
      this.channelUuid = this.processTaskConfig.channelUuid;
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getTaskRelationList() {
      //工单关联关系
      if (this.processTaskId) {
        let data = {
          needPage: false,
          processTaskId: this.processTaskId
        };
        this.$api.process.relation.getTaskRelationList(data).then(res => {
          if (res.Status == 'OK') {
            this.processTaskRelationList = res.Return.processTaskRelationList || [];
            this.$emit('relationNumber', this.processTaskRelationList.length);
          }
        });
      }
    },

    relatedTask() {
      this.relatedTaskModal = true;
    },
    delTaskRelation(obj) {
      let _this = this;
      if (obj.isDeletable != 1) {
        return;
      }
      this.$createDialog({
        title: '警告',
        content: '确定解除与该工单的关联？',
        btnType: 'error',
        'on-ok': function(vnode) {
          let data = {
            processTaskRelationId: obj.id
          };
          _this.$api.process.relation.delTaskRelation(data).then(res => {
            _this.$Message.success(this.$t('message.content.executesuccess'));
            vnode.isShow = false;
            _this.getTaskRelationList();
            _this.$emit('upActivityList');
          });
        }
      });
    },
    closeRelation() {
      this.relatedTaskModal = false;
    },
    toTaskdetail(id) {
      window.open(HOME + '/process.html#/task-detail?processTaskId=' + id, '_blank');
    },
    clipboardSuc: function() {
      this.$Message.success(this.$t('message.content.executesuccess'));
    }
  },
  computed: {
    setContentHeight() {
      return () => {
        return { 'max-height': typeof this.contentHeight == 'number' ? this.contentHeight + 'px' : this.contentHeight };
      };
    }
  },
  watch: {
    relationAuth: {
      handler(val) {
        if (val) {
          this.isShowTip = false;
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
.task-relation {
  padding-bottom: 16px;
  overflow-y: auto;
  .add-top{
    padding: 16px 16px 0 36px;
  }
  .tip-block {
    padding: 16px 16px 0 16px;
  }
  .relation-list {
    position: relative;
    padding: 16px 16px 16px 36px;
    &:not(:last-of-type){
      border-bottom:1px solid;
    }
    &:hover {
      .del-relation {
        display: block;
      }
    }
    .del-relation {
      position: absolute;
      right: 16px;
      top: 16px;
      display: none;
    }
    .relation-detail{
      display: flex;
      align-items: center;
      .item-box{
        width: 25%;
        padding-right: 10px;
        display: flex;
        align-items: center;
        >.text-grey{
          padding-right: 10px;
        }
        .item-serialNumber{
          position: relative;
          padding-right: 20px;
          i{
            position: absolute;
            right: -2px;
            top: 0;
          }
        }
      }
    }
  }
  .tranferReport-tip {
    position: absolute;
    top: 16px;
    left: 0px;
    padding: 2px 6px;
    font-size: 12px;
    border-radius: 2px;
  }
}
</style>
