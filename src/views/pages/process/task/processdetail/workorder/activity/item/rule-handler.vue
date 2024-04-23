<template>
  <div>
    <span class="left-label-text text-grey">{{ config.typeName }}</span>
    <div style="padding-top: 8px">
      <div class="condition-box">
        <div
          v-for="(item, index) in ruleList"
          :key="index"
          class="condition-list radius-lg"
          :class="item.result == true ? 'bg-success-grey' : 'bg-grey'"
        >
          <TsRow className="flew-box">
            <Col span="20">
              <div class="condition-text">
                <div class="text-tip condition-tip">
                  <span>{{ $t('term.process.meetcondition') }}</span>
                </div>
                <div v-if="!item.type || item.type == 'optional'" class="text-overflow">
                  <div v-if="item.conditionGroupList">
                    <Tooltip max-width="800" transfer theme="light">
                      <span v-for="(groupitem, groupindex) in item.conditionGroupList" :key="groupindex">
                        <span>(</span>
                        <span
                          v-for="(conitem, conindex) in groupitem.conditionList"
                          :key="conindex"
                          :class="!item.result && !conitem.result ? 'text-danger' : ''"
                          style="display: inline-block"
                        >
                          <span v-if="conitem.type != 'custom'">{{ conitem.name }}</span>
                          <span v-if="conitem.type != 'custom'" style="padding: 0 8px">{{ conitem.expression }}</span>
                          <span v-if="conitem.type != 'custom'">{{ conitem.valueList || '-' }}</span>
                          <span v-if="conitem.type == 'custom'"><TsCodemirror
                                                                  :value="conitem.expression"
                                                                  codeMode="javascript"
                                                                  :isReadOnly="true"
                                                                  height="100px"
                                                                ></TsCodemirror>
                            <div v-if="conitem.type == 'custom' && conitem.error" class="text-error">{{ conitem.error }}</div>
                          </span>
                          <span v-if="groupitem.conditionRelList && groupitem.conditionRelList[conindex]" class="text-primary" style="margin: 0 6px">{{ groupitem.conditionRelList[conindex].joinType === 'or' ? $t('term.framework.or') : $t('term.framework.and') }}</span>
                        </span>
                        <span style="margin-left: 0px">)</span>
                        <span v-if="item.conditionGroupRelList && item.conditionGroupRelList[groupindex]" class="text-primary" style="margin: 0 6px">{{ item.conditionGroupRelList[groupindex].joinType === 'or' ? $t('term.framework.or') : $t('term.framework.and') }}</span>
                      </span>
                      <div slot="content">
                        <span v-for="(groupitem, groupindex) in item.conditionGroupList" :key="groupindex">
                          <span>(</span>
                          <span v-for="(conitem, conindex) in groupitem.conditionList" :key="conindex" :class="!item.result && !conitem.result ? 'text-danger' : ''">
                            <span v-if="conitem.type != 'custom'">{{ conitem.name }}</span>
                            <span v-if="conitem.type != 'custom'" style="padding: 0 8px">{{ conitem.expression }}</span>
                            <span v-if="conitem.type != 'custom'">{{ conitem.valueList || '-' }}</span>
                            <span v-if="conitem.type == 'custom'">{{ conitem.expression }}</span>
                            <span v-if="groupitem.conditionRelList && groupitem.conditionRelList[conindex]" class="text-primary" style="margin: 0 6px">{{ groupitem.conditionRelList[conindex].joinType === 'or' ? $t('term.framework.or') : $t('term.framework.and') }}</span>
                          </span>
                          <span style="margin-left: 0px">)</span>
                          <span v-if="item.conditionGroupRelList && item.conditionGroupRelList[groupindex]" class="text-primary" style="margin: 0 6px">{{ item.conditionGroupRelList[groupindex].joinType === 'or' ? $t('term.framework.or') : $t('term.framework.and') }}</span>
                        </span>
                      </div>
                    </Tooltip>
                  </div>
                </div>
                <div v-if="item.type == 'always'" class="text-overflow">
                  <span>{{ $t('term.process.alwaystransfer') }}</span>
                </div>
                <div v-if="item.type == 'negative'" class="text-overflow">
                  <span>{{ $t('term.process.nottransfer') }}</span>
                </div>
              </div>
              <div class="condition-text">
                <div class="text-tip condition-tip">
                  <span>{{ textType(item.type) }}</span>
                </div>
                <div class="text-overflow">
                  <span>{{ targetStepListText(item.targetStepList) }}</span>
                </div>
              </div>
            </Col>
            <Col span="4">
              <div class="status dividing-color">
                <span v-if="item.result == true" class="text-success">{{ $t('term.process.matched') }}</span>
                <span v-else class="text-title">{{ $t('term.process.notmatch') }}</span>
              </div>
            </Col>
          </TsRow>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  name: '',
  components: {
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror'], resolve)
  },
  filters: {},
  props: {
    config: Object
  },
  data() {
    return {
      ruleList: []
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
    targetStepListText(list) {
      let text = '';
      if (list instanceof Array) {
        text = list.join('、');
      } else {
        text = list;
      }

      return text;
    }
  },
  computed: {
    textType() {
      return function(type) {
        let text = this.$t('term.rdm.goto');
        if (type == 'negative') {
          text = this.$t('term.rdm.notgoto');
        }
        return text;
      };
    }
  },
  watch: {
    config: {
      handler(val) {
        if (val) {
          let ruleList = JSON.parse(val.newContent);
          this.ruleList = ruleList;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.condition-box {
  span {
    vertical-align: top;
  }
  .condition-list {
    padding: 8px 12px;
    &:not(:last-of-type) {
      margin-bottom: 8px;
    }
    .status {
      text-align: center;
      border-left: 1px solid;
    }
    .condition-text {
      position: relative;
      line-height: 24px;
      &:not(:last-of-type) {
        margin-bottom: 4px;
      }
      .text-overflow {
        padding-left: 60px;
        display: -webkit-box;
        text-overflow: -o-ellipsis-lastline;
        overflow: hidden;
        text-overflow: ellipsis;
        line-clamp: 2;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
    .condition-tip {
      position: absolute;
      left: 0;
      top: 0;
    }
  }
  /deep/ .flew-box {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  /deep/ .ivu-tooltip-rel {
    display: -webkit-box;
    text-overflow: -o-ellipsis-lastline;
    overflow: hidden;
    text-overflow: ellipsis;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style>
