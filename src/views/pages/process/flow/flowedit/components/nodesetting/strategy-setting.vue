<template>
  <div>
    <div v-if="isShow" class="settingList">
      <div class="control-box">
        <div class="control-setting">
          <span class="label">
            <span>{{ $t('term.process.createsubtask') }}</span>
          </span>
          <span class="control-btn">
            <TsFormSwitch
              v-model="isStrategy.isStrategy"
              :true-value="1"
              :false-value="0"
              @on-change="isWwitch"
            ></TsFormSwitch>
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
              <span>{{ $t('term.process.subtaskpolicy') }}
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
          <div class="text-title text">{{ $t('term.process.userfilter') }}</div>
          <UserSelect
            ref="defaultWorker"
            v-model="strategySetting.taskConfig.rangeList"
            :multiple="true"
            :groupList="['user', 'role', 'team']"
            border="border"
          ></UserSelect>
          <div class="text">{{ $t('term.process.emptynotlimitusertip') }}</div>
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
    TsForm: () => import('@/resources/plugins/TsForm/TsForm.vue'),
    TsFormSelect,
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
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
          label: this.$t('term.process.subtaskpolicy'),
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
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('term.process.subtaskpolicy')}) }],
          border: 'border',
          firstText: this.$t('dialog.title.addtarget', {target: this.$t('term.process.subtaskpolicy')}),
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
      this.$Message.success(this.$t('message.executesuccess'));
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
