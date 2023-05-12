<template>
  <div class="workcenterCard">
    <TsCard
      v-bind="cardData"
      :sm="12"
      :lg="8"
      :xl="6"
      :xxl="6"
      headerPosition="right"
      :boxShadow="false"
      :padding="false"
      alwaysShowHeader
      :isBigDataPage="true"
      classname="workcenter-card-item"
      :classKey="['expireStatus', 'rowClassName']"
      @updatePage="updatePage"
      @changePageSize="changePageSize"
    >
      <div
        v-if="row.rowClassName != 'hide-task' && row.status.value !='draft'"
        slot="header"
        slot-scope="{row}"
        :style="{cursor: 'pointer'}"
        @click.stop="updateFocus(row)"
      >
        <i v-if="row.focususers && row.focususers.isCurrentUserFocus" :class="['text-danger', 'ts-heart-s']" :title="$t('term.process.notfocustask')"></i>
        <i v-else :class="['text-danger', 'ts-heart', 'not-focus']" :title="$t('term.process.focustask')"></i>
      </div>
      <div
        slot-scope="{ row }"
        class="pl-md pr-md cursor-pointer"
        @click="cardclick(row, $event)"
      >
        <div class="colorbar" :style="{ backgroundColor: row.status && row.status.color}"></div>
        <div class="name flexw">
          <span class="pr-md shrink" :style="{ color: row.channeltype.color }">{{ row.channeltype.text }}</span>
          <span :title="row.title" class="mr-md overflow">{{ row.title }}</span>
          <span class="colorgray shrink">
            <!-- <span style="font-weight: bold; font-size: 16px;display: inline-block;margin-top: -10px;">.</span> -->
            {{ row.serialnumber }}
          </span>
        </div>
        
        <div class="report mb-xs">
          <Row>
            <Col span="12">
              <span class="mr-md colorgray displayInbl">{{ $t('page.status') }}</span>
              <span class="mr-md">{{ row.status && row.status.text }}</span>
            </Col>
            <Col v-if="row.priority && row.priority.text" span="12" class="overflow">
              <span class="mr-md displayInbl colorgray">{{ $t('page.priority') }}</span>
              <span :style="{ color: row.priority.color }" :title="row.priority.text" class="colorgrey priority">{{ row.priority.text }}</span>
            </Col>
          </Row>
        </div>
        <div class="report mb-xs flexw">
          <span class="mr-md colorgray displayInbl shrink">{{ $t('term.process.report') }}</span>
          <UserCard
            class="mr-md overflow"
            style="fontSize:0;"
            v-bind="row.owner"
            :isInterface="false"
            hideAvatar
          ></UserCard>
          <span class="mr-md nowrap">{{ row.starttime |formatDate('yyyy-mm-dd') }}</span>
          <span class="colorgray nowrap">{{ row.starttime |formatDate('hh:mm:ss') }}</span>
        </div>
        <div class="report mb-xs flexw">
          <span class="mr-md colorgray displayInbl shrink">{{ $t('term.process.reportcatalog') }}</span>
          <span class="mr-md nowrap overflow" :title="row.catalog + '/' + row.channel">{{ row.catalog }} / {{ row.channel }}</span>
        </div>

        <div class="borderBottom dividing-color"></div>
        <div class="card-body-bottom">
          <tditem :is="getCurrentType(row)" :row="row" type="card"></tditem>
        </div>
        <div v-if="!(row.action && (row.action.firstActionList.length>0 ||row.action.secondActionList.length > 0))" class="emptyaction-div"></div>
      </div>
      
      <div v-if="row.action && (row.action.firstActionList.length>0 ||row.action.secondActionList.length > 0)" slot="footer" slot-scope="{ row }">
        <ControllerBtn
          :row="row"
          class="isBtn"
          :taskTypeUuid="taskTypeUuid"
          v-on="$listeners"
        ></ControllerBtn>
      </div>
      <!-- <div v-else ></div> -->
    </TsCard>
  </div>
</template>

<script>
import TsCard from '@/resources/components/TsCard/TsCard.vue';
import ControllerBtn from './ControllerBtn.vue';
import UserCard from '@/resources/components/UserCard/UserCard.vue';
import tditem from './tditem';
export default {
  name: 'CardVue',
  components: {
    TsCard,
    ControllerBtn,
    UserCard,
    CarouseUserList: resolve => require(['./CarouseUserList.vue'], resolve),
    ...tditem
  },
  props: ['cardInfo', 'taskTypeUuid'],
  data() {
    return {
      cardData: {
        classname: 'card-item',
        pageCount: 16,
        rowNum: 0, // 无效
        pageSize: 24,
        currentPage: 2,
        cardList: []
      },
      statusLog: {
        succeed: require('@/resources/assets/images/itsm/succeed.png'),
        aborted: require('@/resources/assets/images/itsm/aborted.png'),
        draft: require('@/resources/assets/images/itsm/draft.png'),
        failed: require('@/resources/assets/images/itsm/failed.png'),
        hidden: require('@/resources/assets/images/itsm/hidden.png')
      }
    };
  },
  mounted() {
    this.cardData.pageCount = this.cardInfo.pageCount;
    this.cardData.rowNum = this.cardInfo.rowNum;
    this.cardData.pageSize = this.cardInfo.pageSize;
    this.cardData.currentPage = this.cardInfo.currentPage;
    this.cardData.cardList = this.cardInfo.tbodyList;
    // 大数据分页
    this.cardData.endPage = this.cardInfo.endPage; //结束页
    this.cardData.processingOfMineCount = this.cardInfo.processingOfMineCount;
    this.cardData.startPage = this.cardInfo.startPage; //起始页    
    this.cardData.pageSizeOpts = this.cardInfo.pageSizeOpts;
  },
  methods: {
    cardclick(item, event) {
      if (event) {
        let path = event.path || (event.composedPath && event.composedPath());
        let is = path[0].tagName === 'BUTTON';
        // let is1 = event.path.some(d => {
        //     return d && d.nodeType === 1 && d.classList.contains && d.classList.contains('ivu-carousel-dots')
        // });
        if (is) {
          return;
        }
      }
      if (typeof item.route === 'object') {
        let route = item.route;
        sessionStorage.setItem('processTaskUuid', this.taskTypeUuid);
        if (item.status.value === 'draft') {
          this.$router.push({
            path: '/task-dispatch',
            query: {
              processTaskId: route.taskid
            }
          });
        } else {
          //sessionStorage.removeItem('processConditionConfig');
          //sessionStorage.setItem('processConditionConfig', JSON.stringify(this.searchConfig));
          this.$router.push({
            path: '/task-detail',
            query: {
              processTaskId: route.taskid
            }
          });
        }
      }
    },
    getUserList(da, item) {
      let data = JSON.parse(JSON.stringify(da));
      let userlist = [];
      //unit
      if (data && data.workerList && data.workerList.length) {
        userlist = data.workerList.map(w => {
          return Object.assign(w.workerVo, {
            unit: w.workTypename ? `(${w.workTypename})` : null
          });
        });
      }
      return {
        userlist: userlist
      };
    },
    cardbtnclick(data, row) {
      if (!data.isEnable) return;
      if (data.name === 'handle') {
        if (data.handleList.length === 1) {
          this.handlerStep(data.handleList[0], row);
        }
      } else if (data.name === 'abort') {
        // 取消
        this.$createDialog({
          title: this.$t('dialog.title.updateconfirm'),
          content: this.$t('dialog.content.tipconfirm', {target: data.text, name: this.$t('term.process.task')}),
          btnType: 'error',
          'on-ok': vnode => {
            this.$api.process.processtask
              .cancelTaskDetail({
                processTaskId: data.config.taskid
              })
              .then(res => {
                if (res.Status === 'OK') {
                  this.$Message.success(this.$t('message.executesuccess'));
                  this.tbodyList.splice(bindex, 1);
                }
              });
          }
        });
      }
    },
    handlerStep(data, item) {
      sessionStorage.setItem('processTaskUuid', this.taskTypeUuid);
      if (item.status.value === 'draft') {
        //task-dispatch?processTaskId=180
        this.$router.push({
          path: '/task-dispatch',
          query: {
            processTaskId: data.config.taskid
          }
        });
      } else {
        this.$router.push({
          path: '/task-detail',
          query: {
            processTaskId: data.config.taskid,
            processTaskStepId: data.config.stepid
          }
        });
      }
    },
    updatePage(page) {
      this.cardData.currentPage = page;
      this.$emit('changeCurrent', page);
    },
    changePageSize(page) {
      this.cardData.pageSize = page;
      this.$emit('changePageSize', page);
    },
    updateFocus(row) {
      // 工单关注
      let isFocus = 0;
      if (row.focususers.isCurrentUserFocus === 1) {
        isFocus = 0;
      } else {
        isFocus = 1;
      }
      const params = {
        processTaskId: row.id,
        isFocus: isFocus
      };
      this.$api.process.processtask
        .updateFocus(params)
        .then(res => {
          if (res.Status === 'OK') {
            row.focususers.isCurrentUserFocus = isFocus;
            this.$Message.success(this.$t('message.executesuccess'));
            this.$emit('updateMenu');
          }
        })
        .catch(error => {
          // row.focususers.isCurrentUserFocus = row.focususers.isCurrentUserFocus ? 0 : 1;
        });
    }
  },
  computed: {
    getCurrentType() {
      return function(item) {
        let type = '';
        if (item && item.status && item.status.value) {
          if (Object.keys(tditem).indexOf(item.status.value) > -1) {
            type = item.status.value;
          } else {
            type = 'common';
          }
        } else {
          type = 'common';
        }
        return type;
      };
    }
  },
  watch: {
    cardInfo: {
      handler() {
        this.cardData.pageCount = this.cardInfo.pageCount;
        this.cardData.rowNum = this.cardInfo.rowNum;
        this.cardData.pageSize = this.cardInfo.pageSize;
        this.cardData.currentPage = this.cardInfo.currentPage;
        this.cardData.cardList = this.cardInfo.tbodyList;
        // 大数据分页
        this.cardData.endPage = this.cardInfo.endPage; //结束页
        this.cardData.processingOfMineCount = this.cardInfo.processingOfMineCount;
        this.cardData.startPage = this.cardInfo.startPage; //起始页    
        this.cardData.pageSizeOpts = this.cardInfo.pageSizeOpts;
      },
      deep: true
    }
  }
};
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.workcenterpoper {
  .ivu-poptip-arrow {
    display: none;
  }
}
.workcenterCard {
  .workcenter-card-item {
    height: 250px;
    overflow: hidden;
  }
  .card-item {
    overflow: hidden;
  }
  .block-container {
    border: none;
  }
  .ivu-carousel-item {
    padding: 0 1px;
  }
  .ivu-carousel-dots {
    bottom: 0px;
    position: relative;
    li {
      margin: 0 6px;
      padding: 0px;
      button {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
    }
  }
}
.workcenterCard {
  .card-item {
    overflow: hidden;
  }
  .action-group {
    display: flex;
    .action-item {
      flex: 1;
      &.disable {
        color: @default-disable;
        cursor: not-allowed;
        :before {
          color: @default-disable;
        }
      }
    }
  }

  .statusLogImg {
    width: 100px;
  }
  .flexw {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .flex1 {
    flex: 1;
  }
  .width0 {
    width: 0;
  }
  .alignItem {
    align-items: center;
  }
  .shrink {
    flex-shrink: 0;
  }
  .nowrap {
    white-space: nowrap;
  }

  .workItem {
    width: calc(33.333333% - 16px);
    float: left;
    margin: 8px;
    box-shadow: 0px 1px 4px 0px rgba(45, 52, 59, 0.2);
    background: @white;
    overflow: hidden;
    border-radius: 5px;
  }
  .colorText {
    color: @default-text;
  }
  .marginleft {
    margin-left: 20px;
  }
  .widthFix {
    width: 55px;
  }

  // .content {
  //   padding: 0 12px;
  //   /*overflow: hidden;*/
  // }
  .Carousel {
    width: 100%;
    height: 78px;
  }
  .colorbar {
    height: 3px;
    position: absolute;
    left: 4px;
    right: 4px;
    top: 1px;
    border-top-right-radius: @block-border-radius;
    border-top-left-radius: @block-border-radius;
    background-color: @success-color;
  }
  .name {
    line-height: 38px;
  }

  .displayInbl {
    display: inline-block;
  }
  .borderBottom {
    margin: 10px 0px;
    border-bottom: 1px solid;
  }

  .status {
    text-align: center;
    border-radius: @block-radius;
    color: @info-color;
    height: 24px;
    line-height: 24px;
    border-radius: 12px;
    &.running {
      border: 1px solid @info-color;
    }
  }
  .colorgray {
    color: @default-icon;
  }
  .Avatar {
    margin-right: 6px;
    vertical-align: middle;
  }
  // .userType {
  //   margin-top: 10px;
  // }
  // .marginright {
  //   margin-right: 10px;
  // }
  // .marginbottom {
  //   margin-bottom: 6px;
  // }
  // .paddingright {
  //   padding-right: 10px;
  // }
  .not-focus {
    display: none;
  }
  .tscard-li:hover {
    .not-focus {
      display: inline-block;
    }
  }
}
.workcenterCard {
  .emptyaction-div{
    height: 34px;
  }
  .card-body-bottom {
    height: 84px;
    position: relative;
    overflow: hidden;
    .carouse-user-list {
      position: absolute;
    }
  }
  .li-will-be-expired:not(:hover),
  .li-is-expired:not(:hover) {
    .workcenter-card-item {
      .tscard-body {
        .card-body-bottom {
          height: 78px + 34px;
          .carouse-user-list {
            top: -82px;
          }
          .expired {
            &-slaname {
              height: 22px;
              line-height: 22px;
              font-size: 12px;
            }
            &-status {
              float: left;
              margin-top: 45px;
              font-size: 12px;
            }
            &-duration {
              float: left;
              margin-left: 4%;
              margin-top: 8px;
              font-size: 48px;
            }
          }
        }
        .emptyaction-div{
          height: 0;
        }
      }
      .tscard-footer {
        display: none;
      }
    }
  }
  .li-will-be-expired:hover,
  .li-is-expired:hover {
    .card-body-bottom {
      .expired {
        display: none;
      }
    }
  }
}
</style>

<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.theme(@text-color, @title-color, @tip-color, @error-bg-color, @warning-bg-color, @gray-color, @icon-color, @bg-op) {
  .li-will-be-expired:not(:hover),
  .li-is-expired:not(:hover) {
    .workcenter-card-item {
      color: @text-color;
      .tscard-body {
        .colorgray {
          color: @tip-color;
        }
        .card-body-bottom {
          .expired {
            &-slaname {
              color: @tip-color;
            }
            &-status {
              color: @title-color;
            }
            &-duration {
              color: @title-color;
            }
          }
        }
      }
    }
  }
  .li-will-be-expired:not(:hover) {
    .workcenter-card-item {
      background-color: @warning-bg-color;
      .tscard-body {
        background-color: @warning-bg-color;
        .colorbar {
          background-color: @warning-bg-color !important;
        }
      }
    }
  }
  .li-is-expired:not(:hover) {
    .workcenter-card-item {
      background-color: @error-bg-color;
      .tscard-body {
        background-color: @error-bg-color;
        .colorbar {
          background-color: @error-bg-color !important;
        }
      }
    }
  }
  // 工单中心卡片页隐藏工单样式
  .li-hide-task {
    .tscard-body,
    .tscard-footer{
      opacity: 0.2;
      background: transparent !important;
    }
    .workcenter-card-item {
      background-color: @gray-color !important;
      background-image: repeating-linear-gradient(45deg, transparent, transparent 12px, @tip-color 12px, @tip-color 13px);
    }
    &:hover{
      .tscard-footer{
        background:  @bg-op !important;
        opacity: 1;
      }
    }
  }
}
html {
  .theme(@default-text, @default-title, @default-tip, @default-error-bg-color, @default-warning-bg-color, @default-gray, @default-icon, @default-op);
  &.theme-dark {
    .theme(@dark-text, @white, @dark-icon, @dark-error-bg-color, @dark-warning-bg-color, @dark-gray, @dark-icon, @dark-op);
  }
}
</style>
<style lang="less" scoped>
/deep/.tscard-footer {
  background-color: transparent!important;
}
.workcenter-card-item{
  .isBtn{
    visibility: hidden;
  }
}

.workcenter-card-item:hover{
  .isBtn{
    visibility:visible;
  }
}
/deep/.userWidth{
  max-width: inherit!important;
}
/deep/ .score-container {
  text-align: left;
  margin-top: -6px;
  .score-content {
    max-height: 60px;
  }
  .ivu-rate-star {
    font-size: 34px;
    line-height: 1.24;
  }
  .ivu-rate-text {
    font-size: 16px;
  }
}
</style>
