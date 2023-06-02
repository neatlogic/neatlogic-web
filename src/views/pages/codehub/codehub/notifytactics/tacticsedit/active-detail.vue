<template>
  <div v-if="config">
    <div class="condition-text dividing-color">
      <div v-if="config.actionList && config.actionList.length > 0" class="condition-block">
        <div class="text-title condition-title">{{ $t('page.actions') }}</div>
        <div class="condition-content">
          <div v-for="(action, acindex) in config.actionList" :key="acindex" class="active-li">
            <span class="name">{{ action.notifyHandlerName }}：</span>
            <span v-for="(user, uindex) in action.receiverObjList" :key="uindex">
              <UserCard
                class="user-name"
                :initViaNet="true"
                :userName="user.name"
                :vipLevel="user.vipLevel"
                :userUuid="user.uuid"
                :type="user.type"
              ></UserCard>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  filters: {},
  props: {
    config: {
      type: Object,
      default: null
    },
    conditionList: Array
  },
  data() {
    return {};
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
  methods: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.active-li {
  position: relative;
  padding-left: 80px;
  word-break: break-all;
  white-space: pre-wrap;
  line-height: 28px;
  .name{
    position: absolute;
    top: 0;
    left: 10px;
  }
}
</style>
