<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="closeDialog"
    @on-ok="save"
  >
    <template v-slot>
      <div>
        <label>{{ $t('page.basicatr') }}</label>
        <div class="padding bg-op radius-md mt-md mb-md">
          <Tag
            v-for="(condition, index) in conditionList"
            :key="index"
            checkable
            :checked="isTagActived(condition)"
            color="primary"
            class="border-color tag"
            size="large"
            @on-change="(isActive)=>{toggleTag(condition,isActive)}"
          >
            {{ condition.handlerName }}
          </Tag>
        </div>
        <label>{{ $t('page.formattr') }}</label>
        <div class="form-grid padding bg-op radius-md mt-md">
          <div class="text-grey"><span>{{ $t('term.process.catalog') }}</span></div>
          <div>
            <TsFormSelect
              :value="channelUuidList"
              transfer
              border="border"
              rootName="list"
              valueName="value"
              textName="text"
              dynamicUrl="api/rest/process/channel/search/forselect"
              @on-change="changeChannel"
            ></TsFormSelect>
          </div>
          <div v-if="formConditionList.length>0" class="text-grey"><span>{{ $t('page.attribute') }}</span></div>
          <div v-if="formConditionList.length>0">
            <Tag
              v-for="(condition, index) in formConditionList"
              :key="index"
              checkable
              :checked="isTagActived(condition)"
              color="primary"
              size="large"
              class="border-color tag"
              @on-change="(isActive)=>{toggleTag(condition,isActive)}"
            >
              {{ condition.handlerName }}
            </Tag>
          </div>
        </div>
        <Divider v-if="selectedAttributeList.length > 0" orientation="left" style="font-size:14px">{{ $t('term.process.attrdragtip') }}</Divider>
        <div v-if="selectedAttributeList.length > 0" class="padding bg-op">
          <draggable
            :animation="150"
            handle=".handler"
            :list="selectedAttributeList"
          ><Tag
            v-for="(condition, index) in selectedAttributeList"
            :key="index"
            closable
            size="large"
            @on-close="removeSelectedAttribute(condition)"
          >
            <i class="handler tsfont-drag" style="cursor:move"></i>{{ condition.handlerName }}
          </Tag></draggable>
        </div>
      </div>
    </template>
  </TsDialog>
</template>
<script>
import draggable from 'vuedraggable';

export default {
  name: '',
  components: {
    draggable,
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {
    conditionList: { type: Array },
    conditionGroupUuid: {type: String}, //编辑的条件分组uuid，为空代表添加分组
    selectedConditionList: {type: Array}, //编辑时传入的条件分组数据，为空代表添加分组
    selectedChannelUuidList: {type: Array}//编辑时存入的服务uuid列表，为空代表添加分组
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('dialog.title.addtarget', {target: this.$t('page.condition')}),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      channelUuidList: [],
      selectedAttributeList: [],
      formConditionList: [] //表单属性列表
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
    //console.log(JSON.stringify(this.selectedAttributeList, null, 2));
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      this.selectedAttributeList = this.selectedConditionList || [];
      this.channelUuidList = this.selectedChannelUuidList || [];
    },
    closeDialog() {
      this.$emit('close');
    },
    save() {
      this.$emit('save', this.conditionGroupUuid, this.channelUuidList, this.selectedAttributeList);
    },
    isTagActived(condition) {
      return !!this.selectedAttributeList.find(d => d == condition || d.handler == condition.handler);
    },
    toggleTag(condition, isActive) {
      if (isActive) {
        this.selectedAttributeList.push(condition);
      } else {
        this.removeSelectedAttribute(condition);
      }
    },
    removeSelectedAttribute(condition) {
      const index = this.selectedAttributeList.findIndex(d => d == condition || d.handler == condition.handler);
      if (index >= 0) {
        this.selectedAttributeList.splice(index, 1);
      }
    },
    changeChannel(val) {
      if (val) {
        this.channelUuidList = [val];
      } else {
        this.channelUuidList = [];
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    channelUuidList: {
      handler: function(val) {
        if (val && val.length > 0) {
          this.$api.process.process.channelForm({ channelUuidList: val, conditionModel: 'simple' }).then(res => {
            this.formConditionList.forEach(element => {
              this.removeSelectedAttribute(element);
            });
            this.formConditionList = [];
            //把数据转换成和工单中心条件的格式一致
            if (res.Return && res.Return.length > 0) {
              res.Return.forEach(d => {
                const newD = {};
                newD['handler'] = d.label; //属性中文名
                newD['handlerName'] = d.label; //属性中文名
                newD['handlerType'] = d.handlerType; //ex:select
                newD['formHandler'] = d.handler; //ex:formselect
                newD['type'] = 'form';
                newD['expressionList'] = d.expressionList;
                try {
                  newD['config'] = d.config;
                } catch (e) {
                  console.error(e);
                }
                this.formConditionList.push(newD);
              });
            }
          });
        } else {
          this.formConditionList.forEach(element => {
            this.removeSelectedAttribute(element);
          });
          this.formConditionList = [];
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.tag {
  border-width: 1px !important;
  border-style: solid !important;
  cursor: pointer;
}
.form-grid {
  display: grid;
  width: 100%;
  grid-row-gap: 12px;
  grid-template-columns: 50px auto;
}
</style>
