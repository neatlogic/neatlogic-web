<template>
  <div class="workeruserlist nowrap alignItem flexw" :class="!styleClass ? 'marginbottom userType' : ''">
    <div
      ref="userCon"
      class="flex1 shrink"
      style="position: relative; overflow: hidden;"
      @click.stop
    >
      <div
        v-for="(userNameItem, uIndex) in userList"
        ref="userDiv"
        :key="userNameItem.unit ? (userNameItem.uuid + '_'+userNameItem.unit +'_'+uIndex) : (userNameItem.uuid+'_'+uIndex)"
        class="userItem displayInbl alignItem"
        :style="{ visibility: userNameItem.hide ? 'hidden' : 'visible' }"
        :class="{ 'pr-xs': uIndex < userList.length - 1, visibility: userNameItem.hide }"
      >
        <span v-if="isShowUserCard">
          <UserCard
            v-if="uIndex == 0"
            v-bind="userNameItem"
            :isInterface="false"
            :name="userNameItem.unit?(userNameItem.name+userNameItem.unit):userNameItem.name"
            class="userWidth"
          ></UserCard>
        </span>
        <span v-else class="m-process-user">
          <Avatar icon="ios-person" :size="24" /> {{ userNameItem.name }}
        </span>
      </div>
      <Poptip
        transfer
        trigger="hover"
        placement="bottom-start"
        popper-class="workcenterpoper"
        offset="-16"
      >
        <span v-if="userList.length > 1" class="tsfont-option-horizontal text-tip"></span>
        <div v-if="userList.length > 1" slot="content">
          <div v-for="(hideuser,hindex) in userList" :key="hideuser.uuid+'_'+hindex" style="paddingTop: 6px; cursor: pointer;">
            <span v-if="isShowUserCard">
              <UserCard
                v-if="hindex > 0"
                style="cursor: pointer;"
                v-bind="hideuser"
                :isInterface="false"
                :name="hideuser.unit?(hideuser.name+hideuser.unit):hideuser.name"
              ></UserCard>
            </span>
            <span v-else class="m-process-user">
              <Avatar icon="ios-person" :size="24" /> {{ hideuser.name }}
            </span>
          </div>
        </div>
      </Poptip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserList',
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  props: ['item', 'styleClass'],

  data() {
    return {
      userList: this.item.userlist,
      isShowUserCard: true
    };
  },
  mounted() {
    if (this.styleClass === 'table') {
      // 注释，头像会有抖动，放大问题
      // setTimeout(() => {
      //   this.isShowUserCard = true;
      // }, 0);
    } else {
      this.isShowUserCard = true;
    }
  },
  methods: {

  },
  computed: {
  },

  destory() {
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.m-process-user{
  height:24px;
  line-height: 24px;
  visibility: visible;
  min-width: 80px;
}
.userWidth{
  position: relative;
  max-width: 108px;
  overflow: hidden;
}
.card-item {
  overflow: hidden;
}

.scale {
  transform: scale(0.5);
}

.flexw {
  display: flex;
  flex-direction: row;
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

.btnicon {
  margin-right: 3px;
}
.marginleft {
  margin-left: 20px;
}

.widthFix {
  width: 55px;
}

.content {
  padding: 0 12px;
  /*overflow: hidden;*/
}

.Carousel {
  width: 100%;
  height: 82px;
  /*margin-right: 2px;*/
  background-color: #fff;
  border-bottom: 1px solid @default-dividing;
  margin-bottom: 16px;
}

.colorbar {
  height: 3px;
  margin-top: -8px;
  margin-right: -20px;
  margin-left: -20px;
  background-color: @success-color;
}

.name {
  line-height: 46px;
}

.displayInbl {
  display: inline-block;
}

.status {
  text-align: center;
  border-radius: @block-radius;
  color: @info-color;
  &.running {
    border: 1px solid @info-color;
  }
}

.Avatar {
  margin-right: 6px;
  vertical-align: middle;
  width: 24px;
}

.userType {
  margin-top: 10px;
}

.marginright {
  margin-right: 10px;
}

.marginbottom {
  margin-bottom: 10px;
}
.workeruserlist {
  .none {
    display: none;
  }
}
.vip-icon {
  width: 12px;
  position: absolute;
  left: 13px;
  bottom: -2px;
}
</style>
