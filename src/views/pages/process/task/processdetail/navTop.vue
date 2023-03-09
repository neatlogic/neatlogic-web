<template>
  <div>
    <!-- 返回功能的公共组件
    功能如下：
    1、任务列表 的显示和隐藏功能
    2、优先级
    3、工单中心标题 -->
    <div v-if="processTaskConfig">
      <span class="text-action tsfont-bar mr-md" @click="isTslayout"></span>
      <span v-if="processTaskConfig.priority && isNeedPriority" class="channel-type fz10" :style="typeTip(processTaskConfig.priority.color)">{{ processTaskConfig.priority.name }}</span>
      <span v-if="!isEdit">
        <span class="task-title overflow" :title="title" style="max-width:200px;">{{ title }}</span>
        <i v-if="actionConfig && actionConfig.update" class="tsfont-edit text-action" @click="editTitle(title)"></i>
      </span>
      <span v-if="isEdit" class="edit-title">
        <TsFormInput
          ref="titleInput"
          v-model="title"
          maxlength="50"
          border="bottom"
          @on-blur="changeTitle(title)"
        ></TsFormInput>
      </span>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  provide() {
    return {
    };
  },
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    taskTitle: String,
    prevPath: Object,
    actionConfig: Object,
    isEditTitle: Boolean,
    processTaskConfig: Object
  },
  data() {
    return {
      title: '',
      isEdit: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeTitle(title) {
      if (title) {
        this.isEdit = false;
        this.$emit('changeTitle', title);
      } else {
        this.$Notice.error({
          title: this.$t('message.content.required', {target: this.$t('page.title')})
        });
        this.$nextTick(() => {
          this.$refs.titleInput.focus();
        });
      }
    },
    editTitle(title) {
      this.$emit('editTitle', title);
      this.title = title;
      this.isEdit = true;
      this.$nextTick(() => {
        this.$refs.titleInput && this.$refs.titleInput.focus();
      });
    },
    toPrevpath() {
      let uuid = sessionStorage.getItem('processTaskUuid');
      let url = '';
      if (uuid) {
        url = '/task-overview-' + uuid; 
      } else {
        let allClassifyData = this.$store.state.leftMenu.workcenterList;
        if (allClassifyData && allClassifyData.length) {
          url = '/task-overview-' + allClassifyData[0].uuid;
        }
      }
      this.$backTo(url);
    },
    isTslayout() {
      this.$emit('isTslayout');
    }
  },
  filter: {},
  computed: {
    typeTip() {
      return function(color) {
        return {
          'background-color': color + '23',
          color: color,
          'border-color': color
        };
      };
    },
    isNeedPriority() {
      return this.processTaskConfig.hasOwnProperty('isNeedPriority') ? this.processTaskConfig.isNeedPriority : 1;
    }
  },
  watch: {
    taskTitle: {
      handler(val) {
        this.title = val;
      },
      immediate: true 
    },
    isEditTitle: {
      handler(val) {
        this.isEdit = !!val;
      },
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
.channel-type{
  margin-right: 6px;
  border-radius: 16px;
  padding: 0 6px;
  line-height: 16px;
}
</style>
