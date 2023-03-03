<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <Tabs v-if="formItemLocal.reaction">
          <TabPane
            v-for="(r, key) in formItemLocal.reaction"
            :key="key"
            :label="getReactionLabel(key)"
            :name="key"
          >
            <ConditionGroup
              v-if="key !== 'filter'"
              :ref="'condition_' + key"
              :value="r"
              :formItemList="formItemList"
              @input="
                rule => {
                  setReaction(key, rule);
                }
              "
            ></ConditionGroup>
            <div v-if="key === 'setvalue'">
              <div v-if="!$utils.isEmpty(r)" class="mt-sm mb-sm text-grey">赋值</div>
              <FormItem
                v-if="!$utils.isEmpty(r)"
                :formItem="formItemLocal"
                :value="r.value"
                mode="condition"
                @change="
                  val => {
                    $set(r, 'value', val);
                  }
                "
              ></FormItem>
              <!--<div class="mt-sm mb-sm text-grey">初始化时执行</div>
              <TsFormSwitch
                :trueValue="true"
                :falseValue="false"
                :value="r.isFirstLoad"
                @on-change="val => {
                  $set(r, 'isFirstLoad', val);
                }"
              ></TsFormSwitch>-->
            </div>
            <div v-else-if="key === 'filter'">
              <ReactionFilter
                :ref="'condition_' + key"
                :value="r"
                :martixAttrList="martixAttrList"
                :formItem="formItemLocal"
                :formItemList="formItemList"
                @input="
                  rule => {
                    setReaction(key, rule);
                  }
                "
              ></ReactionFilter>
            </div>
            <div v-else-if="key === 'emit'">
              <div class="mt-sm mb-sm text-grey">触发事件</div>
              <TsFormRadio
                :value="r.event"
                :validateList="[{ name: 'required', message: '请选择触发事件' }]"
                :dataList="emitTypeList"
                :isClearSameValue="true"
                @change="
                  val => {
                    if(val) {
                      $set(r, 'event', val);
                    }else {
                      $delete(r, 'event');
                    }
                    
                  }
                "
              ></TsFormRadio>
            </div>
          </TabPane>
        </Tabs>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button type="primary" @click="save()">确定</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import { default as emitTypeList } from './form/define/common/emittype.json';
export default {
  name: '',
  components: {
    ConditionGroup: resolve => require(['@/resources/plugins/TsSheet/form/config/common/condition-group.vue'], resolve),
    ReactionFilter: resolve => require(['@/resources/plugins/TsSheet/form/config/common/reaction-filter.vue'], resolve),
    FormItem: resolve => require(['./form-item.vue'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve)
    //TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  props: {
    formItem: { type: Object }, //当前表单组件
    formItemList: { type: Array } //所有表单组件
  },
  data() {
    return {
      formItemLocal: null, //复制一份数据，确认保存后才修改外部数据
      reactionName: {
        mask: '不可见',
        hide: '隐藏',
        display: '显示',
        readonly: '只读',
        disable: '禁用',
        setvalue: '赋值',
        filter: '过滤',
        hiderow: '隐藏行',
        displayrow: '显示行',
        emit: '触发'
      },
      emitTypeList: emitTypeList,
      dialogConfig: {
        title: '联动设置',
        width: 'medium',
        type: 'modal',
        isShow: true,
        maskClose: false
      },
      martixAttrList: [],
      error: {}, //异常信息
      formItemMatrixAttrMap: {}
    };
  },
  beforeCreate() {},
  created() {
    this.formItemLocal = this.$utils.deepClone(this.formItem);
    this.init();
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
    init() {
      //如果数据源是矩阵，先获取矩阵属性
      const config = this.formItemLocal.config;
      if (config && config.dataSource === 'matrix' && config.matrixUuid) {
        this.$api.framework.matrix.getMatrixAttributeByUuid({ matrixUuid: config.matrixUuid }).then(res => {
          if (res.Status == 'OK') {
            this.martixAttrList = res.Return.tbodyList;
          }
        });
      } else {
        //如果数据源不是矩阵，则去掉过滤这个联动
        this.$delete(this.formItemLocal.reaction, 'filter');
      }
    },
    getReactionLabel(key) {
      return h => {
        const returnList = [h('span', this.reactionName[key])];
        if (this.error[key]) {
          returnList.push(
            h('span', {
              class: ['tsfont-info-s', 'text-error']
            })
          );
        }
        if (this.formItemLocal.reaction[key] && !this.$utils.isEmpty(this.formItemLocal.reaction[key])) {
          returnList.push(
            h('span', {
              class: ['tsfont-lightning', 'text-warning']
            })
          );
        }
        return h('div', returnList);
      };
    },
    setReaction(key, rule) {
      this.$set(this.formItemLocal.reaction, key, rule);
    },
    close() {
      this.$emit('close');
    },
    save() {
      let isValid = true;
      if (this.$refs && !this.$utils.isEmpty(this.$refs)) {
        for (let key in this.$refs) {
          if (key.startsWith('condition_')) {
            this.$refs[key].forEach(condition => {
              if (condition && condition.valid && !condition.valid()) {
                isValid = false;
                this.$set(this.error, key.replace('condition_', ''), true);
              }
            });
          }
        }
      }
      if (isValid) {
        this.$emit('close', this.formItemLocal.reaction);
      }
    }
  },
  filter: {},
  computed: {
  },
  watch: {}
};
</script>
<style lang="less"></style>
