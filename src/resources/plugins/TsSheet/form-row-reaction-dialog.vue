<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close" @on-ok="save">
      <template v-slot>
        <Tabs v-if="reactionLocal">
          <TabPane
            v-for="(r, key) in reactionLocal"
            :key="key"
            :label="getReactionLabel(key)"
            :name="key"
          >
            <div v-for="(rect, index) in r" :key="index">
              <Divider plain orientation="center"><span class="tsfont-minus text-href" @click="removeReaction(r,index)">#{{ $t('page.rule') }}{{ index+1 }}</span></Divider>
              <ConditionGroup
                :ref="'condition_' + key"
                :value="rect"
                :formItemList="formItemList"
                @input="
                  rule => {
                    setReaction(r, index, rule);
                  }
                "
              ></ConditionGroup>
              <div class="mt-sm mb-sm text-grey">{{ $t('term.framework.impactrow') }}</div>
              <TsFormSelect
                :dataList="rowList"
                :value="rect.rows"
                multiple
                transfer
                border="border"
                @change="val=>{
                  $set(rect,'rows',val);
                }"
              ></TsFormSelect>
            </div>
            <Divider plain orientation="center"><span class="tsfont-plus text-href" @click="addReaction(r)">{{ $t('dialog.title.addtarget',{'target':$t('page.rule')}) }}</span></Divider>
          </TabPane>
        </Tabs>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    ConditionGroup: () => import('./form/config/common/condition-group.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    rowcount: { type: Number }, //总行数
    reaction: { type: Object }, //当前表单组件
    formItemList: { type: Array } //所有表单组件
  },
  data() {
    return {
      reactionLocal: null, //复制一份数据，确实才修改外部数据
      reactionName: { hiderow: this.$t('term.framework.hiderow'), displayrow: this.$t('term.framework.displayrow') },
      dialogConfig: {
        title: this.$t('term.framework.reactionsetting'),
        width: 'medium',
        type: 'modal',
        isShow: true,
        maskClose: false
      },
      error: {} //异常信息
    };
  },
  beforeCreate() {},
  created() {
    this.reactionLocal = this.$utils.deepClone(this.reaction);
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
    addReaction(reactionList) {
      reactionList.push({});
    },
    removeReaction(reactionList, index) {
      reactionList.splice(index, 1);
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
        return h('div', returnList);
      };
    },
    setReaction(reactionList, index, rule) {
      this.$set(reactionList, index, rule);
    },
    close() {
      this.$emit('close');
    },
    save() {
      let isValid = true;
      if (this.$refs && !this.$utils.isEmpty(this.$refs)) {
        for (let key in this.$refs) {
          if (key.startsWith('condition_')) {
            const condition = this.$refs[key][0];
            if (condition && condition.valid && !condition.valid()) {
              isValid = false;
              this.$set(this.error, key.replace('condition_', ''), true);
            }
          }
        }
      }
      if (isValid) {
        this.$emit('close', this.reactionLocal);
      }
    }
  },
  filter: {},
  computed: {
    rowList() {
      const dataList = [];
      if (this.rowcount) {
        for (let i = 0; i < this.rowcount; i++) {
          dataList.push({ value: i, text: this.$t('term.framework.targetline', {target: (i + 1)}) });
        }
      }
      return dataList;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
