<template>
  <div class="workcenterCardUserList" @click="cardclick(row, $event, type)">
    <div v-if="type === 'table'" :style="{height:'100%'}">
      <div v-if="!row.currentstep.length || !row.currentstep" class="no-current-step">        
        <span class="mr-sx" :class="getTsStatus(row.status.value)" :style="{ color: row.status.color }"></span>
        <slot><span :style="{color: row.status.color}">{{ row.status.text }}</span></slot>
      </div>
      <div v-else class="Carousel table-Carousel">
        <Carousel
          trigger="hover"
          :arrow="row.currentstep && row.currentstep.length < 2 ? 'never' : 'hover'"
          dots="none"
          class=""
        >
          <CarouselItem v-for="(item,iindex) in row.currentstep" :key="row.id+'_'+item.id+'_'+iindex" class="mb-xs">
            <div class="title-top ">
              <span class="colorText">{{ item.name }}</span>
            </div>
            <Row>
              <Col span="24">
                <span :style="{ color: item.status.color }" class="block-status">{{ item.status.text }}</span>
                <span v-if="item && item.workerList && item.workerList.length > 0">
                  <UserList
                    v-if="row"
                    :item="getUserList(item)"
                    :style-class="type"
                  ></UserList>
                </span>
              </Col>
            </Row>
          </CarouselItem>
        </Carousel>
      </div>
    </div>
    <div v-else>
      <Carousel
        trigger="hover"
        arrow="never"
        :dots="row.currentstep && row.currentstep.length < 2 ? 'none' : 'inside'"
        class="Carousel"
      >
        <div v-if="!row.currentstep.length || !row.currentstep">
          <CarouselItem class="text-center">
            <slot>
              <div class="status-container">
                <img class="statusLogImg" :src="getStatusLog(row.status.value)" alt />
                <span :style="{color: row.status.color}" class="mr-md">{{ row.status.text }}</span>
              </div>
            </slot>
          </CarouselItem>
        </div>
        <div v-else>
          <CarouselItem v-for="(item,iindex) in row.currentstep" :key="item.id+'_'+iindex" class="mb-xs">
            <CommonStatus
              v-if="item.status"
              :statusName="item.status.text"
              :statusValue="item.status.name"
              type="block"
              class="fz10 mr-xs"
            ></CommonStatus>
            <span>{{ item.name }}</span>
            <Row v-if="item && item.workerList && item.workerList.length > 0">
              <Col span="24">
                <UserList :item="getUserList(item)"></UserList>
              </Col>
            </Row>
          </CarouselItem>
        </div>
        
      </Carousel>
    </div>
    
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    CommonStatus: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    UserList: resolve => require(['./UserList.vue'], resolve)
  },
  props: ['row', 'type'],
  data() {
    return {
      statusLog: {
        succeed: require('@/resources/assets/images/itsm/succeed.png'),
        aborted: require('@/resources/assets/images/itsm/aborted.png'),
        draft: require('@/resources/assets/images/itsm/draft.png'),
        failed: require('@/resources/assets/images/itsm/failed.png'),
        hidden: require('@/resources/assets/images/itsm/hidden.png')
      },
      tsStatus: {
        succeed: 'tsfont-check-o',
        aborted: 'tsfont-forbid',
        draft: 'tsfont-unsend',
        failed: 'tsfont-close-o',
        hidden: 'tsfont-eye-off'
      }
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
    getStatusLog(status) {
      return this.statusLog[status] || this.statusLog['succeed'];
    },
    getTsStatus(status) {
      return this.tsStatus[status] || this.tsStatus['succeed'];
    },
    cardclick(item, event, type) {
      if (event) {
        let is = false;
        if (type && event.target.tagName === 'I') {
          is = true;
        } else if (event.target.tagName === 'BUTTON') {
          is = true;
        }
        if (is) {
          event.stopPropagation();
        }
      }
    },
    getUserList(item) {
      let data = this.$utils.deepClone(item);
      const userList = data.workerList.map(w => {
        return Object.assign(w.workerVo, {
          unit: w.workTypename ? `(${w.workTypename})` : null
        });
      });
      return {
        userlist: userList
      };
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>

<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.workcenterCardUserList {
  height: 100%;
  width: 100%;
  .no-current-step {
    margin-left: 20px;
    height: 100%;
    display: flex;
    align-items: center;
  }
  .status-container {
    height: 78px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .statusLogImg {
    width: 56px;
  }
  .item-img {
    text-align: center;
  }
}
.Carousel {
  width: 100%;
  height: 82px;

  .status {
    text-align: center;
    border-radius: @block-radius;
    color: @info-color;
    width: 55px;
    height: 24px;
    line-height: 22px;
    border-radius: 12px;
    margin-right: 10px;
    display: inline-block;

    &.running {
      border: 1px solid @info-color;
    }
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
  &.table-Carousel {
    width: 216px;
    height: 56px;
    padding: 0 20px;
    .title-top {
      // margin-bottom: 3px;
      font-size: 12px;
    }

    .block-status {
      float: left;
      font-size: 12px;
      margin-right: 10px;
      padding-top: 4px;
    }
    .status {
      text-align: left;
      width: auto;
    }
    .ivu-carousel-arrow {
      width: auto;
      height: 100%;
      border-radius: inherit;
      margin-top: 1px;
      &.left {
        left: -20px;
      }
      &.right {
        right: -20px;
      }
    }
  }
}
</style>
