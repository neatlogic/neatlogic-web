<template>
  <div v-if="config">
    <div class="condition-text dividing-color">
      <div v-if="config.conditionConfig && config.conditionConfig.conditionGroupList && config.conditionConfig.conditionGroupList.length > 0" class="condition-block">
        <div class="text-title condition-title">{{ $t('page.condition') }}</div>
        <div class="condition-content">
          <div v-for="(groupitem, groupindex) in config.conditionConfig.conditionGroupList" :key="groupindex">
            <div>
              <span>(</span>
              <div v-for="(conitem, conindex) in groupitem.conditionList" :key="conindex" style="display: inline-block;">
                <span>{{ conitem.name }}</span>
                <span style="padding:0 4px;">{{ conditionText(conitem.name, conitem.expression, 'expression') }}</span>
                <span v-if="conitem.expression != 'is-null'">
                  <span
                    :is="handlerType(conitem.name)"
                    v-model="conitem.valueList"
                    :config="getselectConfig(conitem.name)"
                    :readonly="true"
                    style="display: inline-block;"
                  ></span>
                </span>
                <span v-if="groupitem.conditionRelList && groupitem.conditionRelList[conindex]" class="text-primary" style="margin:0 6px;">{{ groupitem.conditionRelList[conindex].joinType === 'or' ? $t('page.or') : $t('page.and') }}</span>
              </div>
              <span style="margin-left: 0px;">)</span>
            </div>
            <div v-if="config.conditionConfig.conditionGroupRelList && config.conditionConfig.conditionGroupRelList[groupindex]" class="text-primary" style="margin:0 6px;">{{ config.conditionConfig.conditionGroupRelList[groupindex].joinType === 'or' ? $t('page.or') : $t('page.and') }}</div>
          </div>
        </div>
      </div>
      <div v-if="config.actionList && config.actionList.length > 0" class="condition-block">
        <div class="text-title condition-title">{{ $t('page.actions') }}</div>
        <div class="condition-content">
          <div v-for="(action, acindex) in config.actionList" :key="acindex" class="active-li">
            <span class="name">{{ action.notifyHandlerName }}：</span>
            <span v-for="(user, uindex) in action.receiverObjList" :key="uindex">
              <UserCard class="user-name" v-bind="user"></UserCard>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Items from '@/resources/components/FormItems';
export default {
  name: '',
  components: {
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    ...Items
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
  methods: {
    conditionText(name, value, type) {
      //条件回显
      let text = '';
      let selectConfig = this.conditionList.find(p => p.name == name);
      if (selectConfig) {
        text = selectConfig.expressionList.find(e => e.expression === value).expressionName;
      }
      return text;
    },
    handlerType(uuid) {
      let type = 'forminput';
      let selectConfig = this.conditionList.find(p => p.name == uuid);
      if (selectConfig) {
        type = selectConfig.handler;
      }
      return type;
    },
    getselectConfig(uuid) {
      let config = {};
      let selectConfig = this.conditionList.find(p => p.name == uuid);
      if (selectConfig) {
        if (selectConfig.config) {
          this.$set(selectConfig.config, 'readonlyClass', 'text-default tsform-readonly');
          this.$set(selectConfig.config, 'sperateText', '、');
        }
        config = selectConfig;
      }
      return config;
    }
  },
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
