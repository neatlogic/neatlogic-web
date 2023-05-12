<template>
  <div class="change-treeview findUuid">
    <div
      v-for="(cd,index) in childrenList"
      :key="cd.uuid"
      :uuid="cd.uuid"
      :parentUuid="cd.parentUuid"
      :index="index"
      class="card-list"
    >
      <span class="sub-line"></span>
      <div class="card-item block-container bg-op" :style="{ 'margin-bottom':cd.isShow?'0px':'8px' }">
        <div class="title-block">
          <span class="text-title overflow" :title="cd.name+'_--'+cd.code" @click.stop.prevent="lookContent(cd)">{{ cd.name }}_--{{ cd.code }}</span>
        </div>
        <div class="content-block" :style="{'width':width +'px'}" @click.stop.prevent="lookContent(cd)">
          <div class="work-block">
            <UserSelect :value="cd.worker" :multiple="false" :readonly="true"></UserSelect>
          </div>
          <div class="data-block">
            <div class="text-grey">{{ $t('term.process.actualstarttime') }}</div>
            <div v-if="cd.planStartDate">
              <TsFormDatePicker
                :value="cd.planStartDate"
                width="100%"
                type="date"
                :readonly="true"
              ></TsFormDatePicker>
            </div>
            <div v-else>-</div>
          </div>
          <div class="time-block">
            <div>
              <div class="text-grey">{{ $t('term.process.actualendtime') }}</div>
              <div v-if="cd.planEndDate">
                <TsFormDatePicker
                  :value="cd.planEndDate"
                  width="100%"
                  type="date"
                  :readonly="true"
                ></TsFormDatePicker>
              </div>
              <div v-else>-</div>
            </div>
          </div>
          <div class="files-block">
            <div class="text-grey">{{ $t('page.accessory') }}</div>
            <span v-if="cd.fileIdList && cd.fileIdList.length"> {{ cd.fileIdList.length }}</span>
            <span v-else>-</span>
          </div>
          <div class="btn-list">
            <ul class="action-group">
              <li
                v-for="(action,cindex) in cd.actionList"
                :key="cindex"
                class="action-item"
                @click.stop="stepFunction(action.value,cd)"
              >{{ action.text }}</li>
            </ul>
          </div>
        </div>
      </div>
      <div v-if="cd.isShow" class="content-box dividing-color">
        <div class="text-grey content-top dividing-color">
          <div class="order-tabs-title step-tabs-title">
            <span
              v-for="(item, tindex) of changeTitle"
              :key="tindex"
              :class="{ active: cd.cur == tindex }"
              @click="cd.cur = tindex"
            >
              <span class="title-box">
                {{ item.title }}
                <span v-show="item.isCount != false">({{ item.count }})</span>
              </span>
            </span>
          </div>
        </div>
        <div v-show="cd.cur == 0">
          <div v-if="(cd.fileList && cd.fileList.length) || cd.content" class="content-text">
            <div>
              {{ cd.content }}
            </div>
            <div v-if="cd.fileList && cd.fileList.length">
              <div v-for="f in cd.fileList" :key="f.id">
                <span class="tsfont-attachment">{{ f.name }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-grey content-text">{{ $t('page.notarget',{target:$t('page.description')}) }}</div>
        </div>
        <div v-show="cd.cur == 1">
          <div class="content-text">
            <div v-show="!cd.editContent" class="comment-content">
              <div class="order-list">
                <TsCkeditor width="100%" :showIconToggle="true"></TsCkeditor>
              </div>
              <TsUpLoad
                ref="uploadFile"
                styleType="button"
                :defaultList="[]"
                className="smallUpload"
                data-type="itsm"
                :multiple="uploadMultiple"
                @getFileList="res => handleSuccess(res, pindex)"
              ></TsUpLoad>
              <div class="comment-btn">
                <Button size="small">{{ $t('page.reply') }}</Button>
                <Button size="small">{{ $t('page.cancel') }}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template v-if="cd.children">
        <ChangeTreeview :children="cd.children" class="item-sub" :width="width"></ChangeTreeview>
      </template>
    </div>
  </div>
</template>
<script>
import ChangeTreeview from './change-treeview';
// import StepDialog from './step-dialog.vue';
import UserSelect from '@/resources/components/UserSelect/UserSelect';
import TsCkeditor from '@/resources/plugins/TsCkeditor/TsCkeditor.vue';
import TsUpLoad from '@/resources/components/UpLoad/UpLoad.vue';
var ADDPARENTUUID = '';
export default {
  name: 'ChangeTreeview',
  components: {
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve),
    ChangeTreeview,
    UserSelect,
    TsUpLoad,
    TsCkeditor
  },
  props: {
    children: {
      type: Array,
      default: () => []
    },
    width: {
      type: Number,
      default: 800
    }
  },
  data() {
    return {
      stepDialog: false,
      dialogStepTitle: '',
      // dragOptions: {
      //   animation: 150
      //   // fallbackOnBody: true,
      //   // fallbackClass: 'select-style',
      //   // swapThreshold: 0.1,
      //   // ghostClass: 'select-style',
      //   // selector: 'sortable-chosen'
      // },
      childrenList: [],
      parentUuid: '',
      moveUuid: '',
      moveParentUuid: '',
      addParentUuid: '',
      stepConfig: null, //步骤信息
      dialogParentUuid: null,
      stepIndex: null,
      changeTitle: [
        //工单处理标题
        {
          title: this.$t('page.description'),
          isCount: false
        },
        {
          title: this.$t('page.comment'),
          isCount: true,
          count: 0
        }
      ],
      cur: 0,
      uploadMultiple: true
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
    lookContent(obj) {
      this.$set(obj, 'cur', 0);
      if (obj.isShow) {
        this.$set(obj, 'isShow', false);
      } else {
        this.$set(obj, 'isShow', true);
      }
    },
    stepFunction(methods, obj) {
      this[methods](obj);
    },
    startchangestep(obj) {
      //开始
      let data = {
        changeStepId: obj.id
      };
      this.$api.process.processtask.changeStepStart(data).then(res => {
        if (res.Status == 'OK') {
          // alert(res);
        }
      });
    },
    completechangestep(obj) {
      //完成
      let data = {
        changeStepId: obj.id
      };
      this.$api.process.processtask.changeStepComplete(data).then(res => {
        if (res.Status == 'OK') {
          // alert(res);
        }
      });
    },
    abortchangestep(obj) {
      //取消
      let data = {
        changeStepId: obj.id
      };
      this.$api.process.processtask.changeStepAbort(data).then(res => {
        if (res.Status == 'OK') {
          // alert(res);
        }
      });
    },
    commentchangestep(obj) {
      this.$set(obj, 'cur', 1);
      this.$set(obj, 'isShow', true);
      //评论
      let data = {
        changeStepId: obj.id
      };
      this.$api.process.processtask.changeStepComment(data).then(res => {
        if (res.Status == 'OK') {
          // alert(res);
        }
      });
    },
    handleSuccess(res, index) {
      this.processTaskStepConfig.commentList[index].fileList = res;
    }
  },
  filter: {},
  computed: {},
  watch: {
    children: {
      handler(newVal) {
        // debugger;
        this.childrenList = newVal;
        //this.$emit('updata');
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang='less'>
@import '~@/resources/assets/css/variable.less';

.change-treeview {
  .item-sub {
    padding-left: 18px;
  }

  .text-title {
    display: inline-block;
    padding: 0 16px;
    max-width: 160px;
  }
  .dataSource-ul {
    //拖拽排序
    position: relative;
    min-height: 1px;
    .block-container {
      position: relative;
    }

    .sub-line {
      display: none;
    }

    .item-sub {
      position: relative;

      &::before {
        content: '';
        display: block;
        width: 0;
        position: absolute;
        top: -7px;
        bottom: 0;
        left: 0;
        margin-bottom: 26px;
        border-left: 1px dotted @default-border;
      }

      .sub-line {
        position: absolute;
        display: inline-block;
        // width: 18px;
        // top: 28px;
        // left: -18px;
        // border-top: 1px dotted @default-border;

        &::before {
          content: '';
          display: block;
          width: 28px;
          height: 0;
          border-top: 1px dotted @default-border;
          position: absolute;
          top: 29px;
          left: -18px;
        }
      }
    }
  }
  .card-list {
    position: relative;
    .card-top {
      position: relative;
      padding: 0 8px 0;
      .action {
        text-align: center;
      }
    }
    .card-item {
      height: 56px;
      // line-height: 56px;
      padding: 0 18px;
      margin-bottom: 8px;
      &:hover {
        .action {
          display: block;
        }
      }
      .action {
        display: none;
        cursor: pointer;
      }
      .cuont {
        > span {
          margin-left: 5px;
        }
      }
    }
    .title-block {
      padding-right: 800px;
      padding-top: 18px;
      .move {
        cursor: move;
      }
    }
    .content-block {
      position: absolute;
      top: 0;
      right: 0;
      width: 70%;
      height: 100%;
      min-width: 800px;
    }
    .btn-list {
      min-width: 130px;
      padding-top: 18px;
      position: absolute;
      top: 0;
      right: 0;
      .action-group > .action-item:after {
        top: 0;
        bottom: 0;
      }
    }
  }
  .work-block {
    display: inline-block;
    min-width: 50px;
    padding-top: 10px;
    width: 20%;
  }
  .data-block {
    display: inline-block;
    min-width: 270px;
    padding-top: 8px;
    width: 35%;
  }
  .time-block {
    display: inline-block;
    min-width: 150px;
    padding-top: 8px;
    width: 15%;
  }
  .files-block {
    display: inline-block;
    min-width: 80px;
    padding-top: 8px;
    width: 10%;
  }
  .content-box {
    width: 100%;
    min-height: 100px;
    max-height: 260px;
    border: 1px solid;
    .content-top {
      line-height: 40px;
      font-size: 14px;
      border-bottom: 1px solid;
      padding: 0 16px;
      .title-box {
        margin: 0;
        margin-right: 16px;
      }
      .active {
        .title-box {
          border-bottom: 2px solid;
          display: inline-block;
          cursor: pointer;
        }
      }
    }
    .content-text {
      padding: 8px 16px;
      max-height: 200px;
      overflow: auto;
      line-height: 24px;
    }
  }
}
</style>
