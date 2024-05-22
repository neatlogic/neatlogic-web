<template>
  <div>
    <TsDialog
      type="modal"
      :isShow="isShow"
      :title="$t('term.autoexec.timingjob')"
      @on-ok="okSetting"
      @on-close="closeSetting"
    >
      <TsForm ref="settingForm" :item-list="settingForm" type="type">
        <template v-slot:time>
          <div>
            <div v-for="(item, index) in timeList" :key="index" class="setting-list">
              <TsRow :gutter="0">
                <Col span="18" class="edit-select">
                  <div>
                    <TsQuartz v-model="item.value"></TsQuartz>
                  </div>
                </Col>
                <Col span="6" class="edit-select">
                  <div class="action-btn">
                    <span class="text-action tsfont-plus" @click="addTime"></span>
                    <span v-if="timeList.length>1" class="text-action tsfont-minus" @click="delTime(index)"></span>
                  </div>
                </Col>
              </TsRow>
            </div>
          </div>
        </template>
      </TsForm>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsQuartz: () => import('@/resources/plugins/TsQuartz/TsQuartz.vue')
  },
  filters: {},
  props: {
    id: {type: [Number, String]}
  },
  data() {
    return {
      isShow: true,
      settingForm: {
        dispatch: {
          name: 'dispatch',
          type: 'select',
          label: this.$t('term.autoexec.timingscheduling'),
          dataList: [],
          validateList: ['required']
        },
        time: {
          type: 'slot',
          label: this.$t('term.autoexec.timesetting'),
          validateList: ['required']
        }
      },
      timeList: [
        {value: ''}
      ]
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
    closeSetting() {
      this.$emit('close');
    },
    okSetting() {
      console.log(this.timeList);
      this.closeSetting();
    },
    addTime() {
      let data = {
        value: ''
      };
      this.timeList.unshift(data);
    },
    delTime(index) {
      this.timeList.splice(index, 1);
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
.setting-list{
  padding-bottom: 16px;
}
</style>
