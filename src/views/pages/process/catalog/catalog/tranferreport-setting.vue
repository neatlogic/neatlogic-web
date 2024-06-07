<template>
  <div v-if="channelRelationList && channelRelationList.length" class="tranferreport-setting">
    <div v-for="(item, index) in channelRelationList" :key="index" class="setting-list">
      <div class="flex-wrap">
        <div class="edit-select">
          <TsFormSelect
            ref="validSelect"
            v-model="item.channelTypeRelationId"
            :placeholder="$t('form.placeholder.pleaseselect', {target:$t('page.relation')})"
            :dataList="relarelationSelectList"
            :validateList="validConfig.validRelatioTnId"
            @on-change="changeRelationId(item)"
          ></TsFormSelect>
        </div>
        <div class="edit-select">
          <template v-if="item.channelTypeRelationId">
            <TsFormTree
              ref="validSelect"
              v-model="item.targetList"
              :placeholder="$t('form.placeholder.pleaseselect', {target:$t('term.process.serallowforwarding')})"
              :url="treeUrl"
              :params="{ channelTypeRelationId: item.channelTypeRelationId }"
              :multiple="true"
              valueName="typeAndUuid"
              textName="name"
              :validateList="validConfig.validTarget"
            ></TsFormTree>
          </template>
          <template v-else>
            <TsFormSelect ref="validSelect" :placeholder="$t('form.placeholder.pleaseselect', {target:$t('term.process.serallowforwarding')})" :validateList="validConfig.validTarget"></TsFormSelect>
          </template>
        </div>
        <div class="edit-select">
          <UserSelect
            ref="validSelect"
            v-model="item.authorityList"
            :placeholder="$t('form.placeholder.pleaseselect', {target:$t('term.process.authorizeduser')})"
            :validateList="validConfig.validAuthority"
          ></UserSelect>
        </div>
        <div class="flex-start edit-select flex-1">
          <span>{{ $t('term.process.useoriginalreporter') }}</span>
          <TsFormSwitch
            v-model="item.isUsePreOwner"
            class="switch-width"
            :true-value="1"
            :false-value="0"
          ></TsFormSwitch>
        </div>
      </div>
      <div class="action-btn">
        <span class="text-action tsfont-plus" @click="addRelation"></span>
        <span v-if="channelRelationList.length>1" class="text-action tsfont-minus" @click="delRelation(index)"></span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormTree: () => import('@/resources/plugins/TsForm/TsFormTree'),
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch.vue')
  },
  filters: {},
  props: {
    channelTypeUuid: {
      //选择服务类型
      type: [String, Number],
      default: null
    },
    configChannelRelationList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      channelRelationList: [
        {
          channelTypeRelationId: '',
          targetList: [],
          authorityList: '',
          isUsePreOwner: 0 // 使用原上报人, 1表示高亮选中，0表示未选中
        }
      ],
      relarelationSelectList: [],
      validConfig: {
        validRelatioTnId: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.relation')}) }],
        validTarget: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('term.process.serallowforwarding')}) }],
        validAuthority: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('term.process.authorizeduser')}) }]
      },
      treeUrl: '/api/rest/process/catalog/channel/tree'
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
    getRelarelationList(isRefresh) {
      let data = {
        sourceChannelTypeUuid: this.channelTypeUuid,
        isActive: 1
      };
      this.$api.process.relation.relarelationSelect(data).then(res => {
        if (res.Status == 'OK') {
          this.relarelationSelectList = res.Return.list;
          this.disabledSelectRelationId();
          isRefresh && this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    addRelation() {
      let o = {
        channelTypeRelationId: '',
        targetList: [],
        authorityList: '',
        isUsePreOwner: 0 // 使用原上报人
      };
      this.channelRelationList.push(o);
    },
    delRelation(index) {
      this.channelRelationList.splice(index, 1);
      this.disabledSelectRelationId();
    },
    valid() {
      let list = this.$refs.validSelect;
      let isValid = true;
      list.forEach(e => {
        if (!e.valid()) {
          isValid = false;
        }
      });
      return isValid;
    },
    saveRelationList() {
      return this.channelRelationList;
    },
    changeRelationId(obj) {
      if (obj.channelTypeRelationId) {
        this.$set(obj, 'targetList', []);
      }
      this.disabledSelectRelationId();
    },
    disabledSelectRelationId() {
      this.relarelationSelectList.forEach(e => {
        let find = this.channelRelationList.find(d => d.channelTypeRelationId == e.value);
        if (find) {
          this.$set(e, '_disabled', true);
        } else {
          this.$set(e, '_disabled', false);
        }
      });
    },
    toRotationManage() {
      window.open(HOME + '/process.html#/relations-manage', '_blank');
    }
  },
  computed: {},
  watch: {
    channelTypeUuid: {
      handler(val) {
        if (val) {
          this.getRelarelationList();
        }
      },
      immediate: true
    },
    configChannelRelationList: {
      handler(val) {
        if (val && val.length > 0) {
          this.channelRelationList = this.$utils.deepClone(val);
        } else {
          this.channelRelationList = [
            {
              channelTypeRelationId: '',
              targetList: [],
              authorityList: '',
              isUsePreOwner: 0 // 使用原上报人
            }
          ];
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.tranferreport-setting {
  .switch-width {
    width: 40px !important;
    margin-left: 7px;
  }
  .setting-list {
    .flex-wrap {
      display: flex;
      .flex-1 {
        min-width: 129px !important;
        max-width: 150px !important;
        width: 8% !important;
        flex-wrap: nowrap;
        align-items: flex-start;
        justify-content: center;
        flex: 1;
      }
    }
    position: relative;
    &:not(:last-of-type) {
      margin-bottom: 16px;
    }
    .edit-select {
      box-sizing: border-box;
      min-width: 100px;
      width: 25%;
      padding: 0 2px;
      &:first-child {
        padding-left: 0;
      }
      &:last-child {
        padding-right: 0;
      }
    }
    .action-btn {
      position: absolute;
      right: 0px;
      top: 0;
      width: 60px;
      > span {
        padding-right: 8px;
      }
    }
  }
}
</style>
