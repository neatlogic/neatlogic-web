<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TimelineItem v-for="(item, index) in recordList" :key="index">
            <div :is="getHandler(item.type)" :config="item"></div>
          </TimelineItem>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import items from './record/index.js';
export default {
  name: '',
  components: {
    ...items
  },
  props: {
    id: {
      type: Number
    }
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('page.actionaudit'),
        isShow: true,
        type: 'slider',
        width: 'large',
        maskClose: true,
        hasFooter: false
      },
      recordList: [
        {
          type: 'pause',
          user: 'admin',
          time: '2021-01-01 00:00:00',
          source: '页面操作'
        },
        {
          type: 'reexecute',
          user: 'admin',
          time: '2021-02-01 00:00:00'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getRecordList();
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
    getRecordList() {
      //获取作业操作记录
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
    getHandler() {
      return (type) => {
        if (!items[type + '-handler']) {
          return 'defaultHandler'; 
        }
        return items[type + '-handler']; 
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
