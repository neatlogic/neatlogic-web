<template>
  <div>    
    <div v-if="isShow" class="settingList">
      <div class="control-box">
        <div class="control-setting">
          <span class="label">
            <span>创建子任务
            </span>
          </span>
          <span class="control-btn">
            <i-switch
              v-model="isStrategy.isStrategy"
              :true-value="1"
              :false-value="0"
              @on-change="isWwitch"
            ></i-switch>
          </span>
        </div>
      </div>
      <div v-if="isStrategy.isStrategy" class="permission-list">
        <div class="bg-block">
          <TsForm
            ref="tsForms"
            :itemList="relationDialogForm"
            :label-width="100"
            labelPosition="top"
            class="FormBox"
          >
            <template v-slot:num-label>
              <span>子任务策略
                <span class="tsfont-edit icon text-tip-active" :title="$t('page.edit')" @click="edit"></span>
                <span class="tsfont-rotate-right reply-icon text-tip-active" :title="$t('page.refresh')" @click="refresh() "></span>
              </span>
            </template>
            <template v-slot:num>
              <TsFormSelect
                v-model="relationDialogForm.num.value"
                v-bind="relationDialogForm.num"
                :selectItemList.sync="selectItemList"
                @first="link"
              >
              </TsFormSelect>
            </template>
          </TsForm>          
          <div class="text-title text">处理人过滤</div>
          <UserSelect
            ref="defaultWorker"
            v-model="strategySetting.taskConfig.rangeList"
            :multiple="true"
            :groupList="['user', 'role', 'team']"
            border="border"
          ></UserSelect>
          <div class="text">不填写时，不限制处理人范围</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsFormSelect,
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect'], resolve)
  },
  props: ['strategySetting', 'isStrategy'],
  data() {
    let _this = this;
    return {
      replyList: [],
      isShow: true,
      selectItemList: false,
      relationDialogForm: {
        num: {
          type: 'slot',
          label: '子任务策略',
          width: '100%',
          transfer: true,
          url: '/api/rest/task/search',
          params: {keyword: '',
            pageSize: 20,
            isActive: '1',
            needPage: false,
            currentPage: 1},
          multiple: true,
          rootName: 'tbodyList',
          valueName: 'id',
          textName: 'name',
          value: [],
          dataList: [],
          validateList: [{ name: 'required', message: '请选择子任务策略' }],
          border: 'border',
          firstText: '添加子任务策略',
          firstLi: true,
          onChange: function(val) {
            _this.strategySetting.taskConfig.idList = val;
          }
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    if (this.strategySetting.taskConfig) {
      this.relationDialogForm.num.value = this.strategySetting.taskConfig.idList;
    } else {
      this.strategySetting.taskConfig = {};
      this.strategySetting.taskConfig.rangeList = [];
      this.strategySetting.taskConfig.idList = [];
    }
  },

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
    isWwitch(status) {
      if (status == 0) {
        this.relationDialogForm.num.value = [];
        this.strategySetting.taskConfig.rangeList = [];
        this.strategySetting.taskConfig.idList = [];
      }
    },
    link() {
      window.open(HOME + '/process.html#/subtasktype-manage?atrixFormDialogShow=true', '_blank');
    },
    edit() {
      window.open(HOME + '/process.html#/subtasktype-manage', '_blank');
    },
    refresh() {
      this.relationDialogForm.num.dynamicUrl = '/api/rest/task/search?uuid=' + this.$utils.setUuid();
      this.selectItemList = true;
      this.$Message.success(this.$t('message.content.executesuccess'));
    },
    getInit(data) {
      if (this.isStrategy.isStrategy == 1) {
        this.isShow = false;
        this.$nextTick(() => {
          this.isShow = true;
          this.relationDialogForm.num.value = data.idList;
        });
      }
    }
  },

  filter: {},

  computed: {}
};
</script>
<style lang='less' scoped>
.text{
  margin:8px 0 0px 0;
  padding-left: 5px;
}
.FormBox{
  position: relative;
  .text-tip-active{
    position: absolute;
    right: 0;
  }
  .tsfont-edit{
    position: absolute;
    right: 30px;
  }
}
</style>
