<template>
  <div class="team-treeview">
    <div
      v-for="(cd, index) in childrenList"
      v-show="show"
      :key="cd.uuid"
      :index="index"
      class="dataSource-ul"
    >
      <span class="sub-line"></span>
      <p class="team-check bg-check">
        <Checkbox v-if="cd.userCount > 0" v-model="cd.isCheck" @on-change="checkbox(cd)"></Checkbox>
      </p>
      <div class="card-item bg-op block-container">
        <span class="name">
          <span class="text-title overflow">{{ cd.name }}</span>
          <i
            v-if="cd.childCount && cd.childCount > 0"
            class="text-action"
            :class="cd.isShow ? 'ts-angle-up' : 'ts-angle-down'"
            @click="isOpen(cd)"
          ></i>
        </span>
        <span class="num">
          {{ cd.userCount }}
        </span>
      </div>
      <template v-if="search">
        <TeamTreeView
          v-if="cd.children"
          :search="true"
          :children="cd.children"
          class="item-sub"
          :show="cd.isShow"
          @getSelect="getSelect"
        ></TeamTreeView>
        <template v-if="cd.children && cd.children.length > 0"></template>
        <template v-else>
          <Loading v-if="cd.childCount && cd.childCount > 0" :loadingShow="childrenLoading[cd.uuid]"></Loading>
        </template>
      </template>
      <template v-else>
        <TeamTreeView
          v-if="cd.children"
          :search="false"
          :children="cd.children"
          class="item-sub"
          :show="cd.isShow"
          @getSelect="getSelect"
        ></TeamTreeView>
        <template v-if="cd.children && cd.children.length > 0"></template>
        <template v-else>
          <Loading v-if="cd.childCount && cd.childCount > 0" :loadingShow="childrenLoading[cd.uuid]"></Loading>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import TeamTreeView from './team-treeview';
export default {
  inject: ['setIsCheck'],
  name: 'TeamTreeView',
  components: { TeamTreeView },
  props: {
    children: {
      required: true,
      type: Array,
      default: () => []
    },
    search: {
      type: Boolean,
      default: false
    },
    show: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      childrenList: [],
      isShow: true,
      childrenLoading: [],
      selectList: []
    };
  },

  beforeCreate() {},

  created() {
    if (!this.search) {
      this.childrenList.forEach(item => {
        if (item.childCount > 0) {
          this.$set(item, 'isShow', false);
          this.$set(item, 'isRequest', false);
        }
      });
    }
  },

  beforeMount() {},

  mounted() {},

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    isOpen(cd) {
      this.$set(cd, 'isShow', !cd.isShow);
      if (!cd.isRequest) {
        this.$set(cd, 'isRequest', true);
        this.getChildrenTeamList(cd);
      }
    },
    //获取子集分组
    getChildrenTeamList(cd) {
      let uuid = cd.uuid;
      let load = {};
      this.childrenLoading[uuid] = true;
      let data = {
        needPage: false,
        parentUuid: uuid,
        isActive: 1
      };
      setTimeout(() => {
        this.$api.framework.team
          .getTeamTreeList(data)
          .then(res => {
            if (res.Status == 'OK') {
              this.$set(cd, 'children', res.Return.tbodyList);
              cd.children.forEach(t => {
                if (!t.children) {
                  t.children = [];
                }
              });
              this.setIsCheck(cd.children);
              this.childrenLoading[uuid] = false;
            }
          })
          .catch(error => {
            this.$Notice.error({
              title: error.data.Message
            });
          });
      }, 200);
    },
    setItem(item) {
      this.$set(item, 'isShow', true);
      this.$set(item, 'isRequest', true);
      this.$set(item, 'isCheck', item.isCheck);
      if (item.children && item.children.length > 0) {
        item.children.forEach(citem => {
          this.$set(citem, 'isShow', true);
          this.$set(citem, 'isRequest', true);
          this.setItem(citem);
        });
      } else {
        this.$set(item, 'isShow', false);
        this.$set(item, 'isRequest', false);
      }
    },
    checkbox(item) {
      this.$emit('getSelect', item);
    },
    getSelect(item) {
      this.$emit('getSelect', item);
    }
  },

  filter: {},

  computed: {},

  watch: {
    children: {
      handler(newVal) {
        this.childrenList = JSON.parse(JSON.stringify(newVal));
      },
      deep: true,
      immediate: true
    },
    childrenList(newVal) {
      if (this.search) {
        newVal.forEach(item => {
          if (item.childCount > 0) {
            this.setItem(item);
          }
        });
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.team-treeview {
  .item-sub {
    margin-left: 50px;
  }

  .text-title {
    display: inline-block;
    padding: 0 16px;
    max-width: 160px;
  }
  .dataSource-ul {
    position: relative;
    min-height: 1px;
    .card-item {
      position: relative;
      height: 56px;
      line-height: 56px;
      padding: 0 20px;
      margin-bottom: 8px;
      .name {
        padding-right: 200px;
      }
      .num {
        position: absolute;
        right: 200px;
      }
    }
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
        left: -33px;
        margin-bottom: 26px;
        border-left: 1px dotted @default-border;
      }

      .sub-line {
        position: absolute;
        display: inline-block;

        &::before {
          content: '';
          display: block;
          width: 28px;
          height: 0;
          border-top: 1px dotted @default-border;
          position: absolute;
          top: 29px;
          left: -30px;
        }
      }
    }
  }
  .team-check {
    position: absolute;
    left: -22px;
    top: 18px;
  }
}
</style>
