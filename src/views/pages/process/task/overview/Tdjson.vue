<template>
  <div class="tdTemp">
    <div v-if="header.key === 'owner'">
      <span v-if="isShowUserCard">
        <UserCard v-bind="config" :isInterface="false"></UserCard>
      </span>
      <span v-else class="m-process-user">
        <Avatar icon="ios-person" :size="24" /> {{ config.name }}
      </span>
    </div>
    <div v-if="header.key === 'reporter' && row.reporter && Object.keys(row.reporter).length > 0">
      <span v-if="isShowUserCard">
        <UserCard v-bind="row.reporter" :isInterface="false"></UserCard>
      </span>
      <span v-else class="m-process-user">
        <Avatar icon="ios-person" :size="24" /> {{ row.reporter.name }}
      </span>
    </div>
    <div
      v-if="header.key === 'currentstep'"
      :style="getCurrentType(row) === 'scored' && row.score ? 'width:260px' : 'width:220px'"
      class="current-step"
      :class="{ 'will-or-is-expired': ['will-be-expired', 'is-expired'].includes(row.expireStatus) }"
    >
      <tditem :is="getCurrentType(row)" :row="row" type="table"></tditem>
    </div>
    <div v-if="header.key === 'channeltype'" :style="{ color: row.channeltype.color }">
      {{ row.channeltype.text }}
    </div>
    <div v-if="header.key === 'priority'" :style="{ color: row.priority.color }">
      {{ row.priority.text }}
    </div>
    <div v-if="header.key === 'status'" :style="{ color: row.status.color }">
      {{ row.status.text }}
    </div>
    <div v-if="header.key === 'expiretime' && row.expireStatus !== 'no-expired-time'">
      <span v-if="row.expireStatus === 'not-expired' || row.expireStatus === 'will-be-expired'">
        {{ row.expireConfig.timeLeftMin | formatTimeCost({ unitNumber: 2, language: 'zh', unit: 'minute' }) }}
      </span>
      <span v-else-if="row.expireStatus==='is-expired'">
        <span class="text-grey">{{ row.expireConfig.expiredSlaName }}</span>
        <span>{{ $t('term.process.timedout') }}</span>
        <span class="h3">
          {{ row.expireConfig.timeLeftMin | formatTimeCost({language:'en',unitNumber:1, unit: 'minute'}) }}
        </span>
      </span>
    </div>
    <div v-if="header.key === 'focususers' && row.rowClassName != 'hide-task' && row.status.value != 'draft'" :style="{ cursor: 'pointer' }" @click.stop="updateFocus(row)">
      <i v-if="row.focususers && row.focususers.isCurrentUserFocus" :class="['text-danger', 'ts-heart-s']" :title="$t('term.process.notfocustask')"></i>
      <i v-else :class="['text-danger', 'ts-heart', 'not-focus']" :title="$t('term.process.focustask')"></i>
    </div>
    <div v-if="header.key === 'currentstepworker' && row.currentstepworker && row.currentstepworker.length > 0">
      <span v-for="(item, index) in sliceFn(row.currentstepworker, true)" :key="index" class="currentstepworkerUser">
        <span v-if="isShowUserCard">
          <UserCard
            v-bind="item.workerVo"
            :isInterface="false"
            :name="item.workTypename && (item.workerVo.initType == 'user' || item.workerVo.initType == 'team') ? `${item.workerVo.name}(${item.workTypename})` : item.workerVo.name"
          ></UserCard>
        </span>
        <span v-else class="m-process-user">
          <Avatar icon="ios-person" :size="24" /> {{ item.workerVo.name }}
        </span>

      </span>
      <span v-if="row.currentstepworker.length > 2">
        <Poptip
          transfer
          trigger="hover"
          placement="bottom-start"
          popper-class="workcenterpoper"
          offset="-16"
        >
          <span class="tsfont-option-horizontal text-tip"></span>
          <div slot="content">
            <div v-for="(item, index) in sliceFn(row.currentstepworker, false)" :key="index">
              <span v-if="isShowUserCard">
                <UserCard
                  style="padding-top: 6px;"
                  v-bind="item.workerVo"
                  :isInterface="false"
                  :name="item.workTypename && (item.workerVo.initType == 'user' || item.workerVo.initType == 'team' ) ? `${item.workerVo.name}(${item.workTypename})` : item.workerVo.name"
                ></UserCard>
              </span>
              <span v-else class="m-process-user">
                <Avatar icon="ios-person" :size="24" /> {{ item.workerVo.name }}
              </span>
            </div>
          </div>
        </Poptip>
      </span>
    </div>
    <div v-if="header.key === 'currentstepname' && row.currentstepname && row.currentstepname.length > 0">
      <span v-for="(item, index) in sliceFn(row.currentstepname, true)" :key="index" style="margin-right:10px">{{ item }}</span>
      <span v-if="row.currentstepname.length > 2">
        <Poptip
          transfer
          placement="bottom-start"
          popper-class="workcenterpoper"
          offset="-16"
          style="position: relative;top: 3px;"
        >
          <span class="tsfont-option-horizontal text-tip"></span>
          <div slot="content">
            <div v-for="(item, index) in sliceFn(row.currentstepname, false)" :key="index" @click.stop>{{ item }}</div>
          </div>
        </Poptip>
      </span>
    </div>
  </div>
</template>

<script>
import UserCard from '@/resources/components/UserCard/UserCard.vue';
import tditem from './tditem';
export default {
  name: 'Tdjson',
  components: {
    UserCard,
    ...tditem
  },
  props: ['config', 'header', 'row'],
  data() {
    return {
      isShowUserCard: false
    };
  },
  mounted() {
    let _this = this;
    setTimeout(() => {
      // 优化用户信息加载时间
      _this.isShowUserCard = true;
    }, 0);
  },
  methods: {
    updateFocus(row) {
      // 工单关注
      row.focususers.isCurrentUserFocus = row.focususers.isCurrentUserFocus ? 0 : 1;
      const params = {
        processTaskId: row.id,
        isFocus: row.focususers.isCurrentUserFocus
      };
      this.$api.process.processtask
        .updateFocus(params)
        .then(res => {
          if (res.Status === 'OK') {
            row.focususers.isCurrentUserFocus = res.Return.isFocus;
            this.$Message.success(this.$t('message.executesuccess'));
            this.$emit('updateMenu');
          }
        })
        .catch(error => {
          row.focususers.isCurrentUserFocus = row.focususers.isCurrentUserFocus ? 0 : 1;
        });
    },
    sliceFn(list, key) {
      if (key) {
        return list.slice(0, 2);
      } else {
        return list.slice(2, list.length);
      }
    }
  },
  computed: {
    now() {
      return this.$store.state.now;
    },
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
  }
};
</script>
<style lang="less">
.tdTemp {
  .Avatar {
    margin-right: 6px;
    vertical-align: middle;
  }
  .ivu-carousel-dots {
    text-align: left;
  }
}
.tstable-tr {
  .not-focus {
    visibility: hidden;
  }
  &:hover {
    .not-focus {
      visibility: visible;
    }
  }
}
</style>

<style lang="less" scoped>
.item {
  height: 30px;
}
.m-process-user{
  height:22px;
  line-height: 22px;
  visibility: visible;
  min-width: 80px;
}
.name {
  margin-right: 6px;
}

</style>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.currentstepworkerUser{
  padding-right:10px;
  // max-width: 108px; 
  // overflow: hidden;
  display: inline-block;
}
.current-step {
  height: 47px;
  overflow: hidden;
  position: relative;
  &.will-or-is-expired {
    .carouse-user-list {
      position: absolute;
      top: -60px;
      left: 0;
    }
  }
  .expired {
    padding-left: 20px;
    height: 47px;
    display: flex;
    align-items: center;
    &-status {
      // vertical-align: -4px;
      font-size: 12px;
      // height: 17px;
      // line-height: 17px;
      margin-right: 5px;
    }
    &-duration {
      font-size: 30px;
      height: 42px;
      line-height: 42px;
    }
  }
}

.theme(@tip-color, @title-color) {
  .expired-slaname {
    color: @tip-color;
  }
  .expired {
    padding-left: 20px;
    height: 47px;
    &-status {
      color: @tip-color;
    }
    &-duration {
      color: @title-color;
    }
  }
}

html {
  .theme(@default-tip, @default-title);
  &.theme-dark {
    .theme(@white, @white);
  }
}

tr.trtype-is-expired, tr.trtype-will-be-expired{
  &:hover {
    &.will-be-expired,
    &.is-expired,
    &.will-or-is-expired {
      .carouse-user-list {
        top: 0;
      }
      .expired {
        display: none;
      }
    }
  }
}
</style>
