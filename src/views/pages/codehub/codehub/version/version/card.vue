<template>
  <TsCard
    v-bind="cardData"
    headerPosition="right"
    @updatePage="updatePage"
    @updateSize="updateSize"
  >
    <template slot="header" slot-scope="{ row }">
      <div v-if="row.canEdit || canDelete" class="action-group">
        <div v-if="row.canEdit" class="action-item text-action ts-plus-o" @click="addMr(row.uuid,row.versionTypeStrategyRelationVo?row.versionTypeStrategyRelationVo.versionStrategyType:null)">{{ $t('term.codehub.createmergerequest') }}</div>
        <div v-if="canDelete" class="action-item text-action ts-trash" @click="deleteVersion(row.uuid)">{{ $t('page.delete') }}</div>
      </div>
    </template>
    <template slot-scope="{ row }">
      <div class="padding-sm">
        <TsRow class="mb-sm">
          <Col span="24">
            <span class="text-success h3">{{ row.version }}</span>
            <Tag v-if="row.versionTypeVo" color="default" class="tag-label">{{ row.versionTypeVo.description }}</Tag>
            <Tag :color="typeColor[row.versionTypeStrategyRelationVo.versionStrategyType]" class="ml-sm">
              {{ typeTxt[row.versionTypeStrategyRelationVo.versionStrategyType] }}
            </Tag>
          </Col>
        </TsRow>
        <TsRow>
          <Col span="8">
            <Tooltip v-if="showtips(row)" theme="light" max-width="300">
              <div>{{ setTxt(row,'text') }}</div>
              <div slot="content">
                <div>{{ setTxt(row,'tips') }}</div>
              </div>
            </Tooltip>
            <div v-else>{{ setTxt(row,'text') }}</div>
          </Col>
          <Col span="8">
            <div v-if="row.versionTypeStrategyRelationVo">
              <span class="ts-branch text-tip h3 text-icon mr-sm"></span>
              {{ row.versionTypeStrategyRelationVo.srcBranch }}
              <span class="ts-long-arrow-right text-tip h2 branch-sep mr-sm"></span>
              <span class="ts-branch text-tip h3 text-icon mr-sm"></span>
              {{ row.versionTypeStrategyRelationVo.targetBranch }}
            </div>
          </Col>
          <Col span="8">
            <UserCard
              v-if="row.fcu"
              :uuid="row.fcu"
              :hideAvatar="true"
            ></UserCard>
            <span class="text-tip pl-sm">{{ row.fcd | formatDate }}</span>
          </Col>
        </TsRow>
      </div>
    </template>
  </TsCard>
</template>

<script>
export default {
  name: '',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  props: {
    versionData: {
      type: Object
    },
    statusList: {
      type: Object
    },
    canDelete: {
      type: Boolean
    }
  },
  data() {
    return {
      openval: {
        true: 1,
        false: 0
      },
      isInit: false,
      cardData: {
        classname: 'version-card',
        classKey: 'isOpen',
        span: 24,
        sm: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        padding: false,
        pageType: 'number',
        cardList: []
      },
      typeTxt: {
        branch: this.$t('term.codehub.branchmerge'),
        issue: this.$t('term.codehub.issuemerge')
      },
      typeColor: {
        branch: 'primary',
        issue: 'warning'        
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.versionData) {
      Object.assign(this.cardData, {
        pageCount: this.versionData.pageCount,
        rowNum: this.versionData.rowNum,
        pageSize: this.versionData.pageSize,
        currentPage: this.versionData.currentPage,
        cardList: this.versionData.tbodyList
      });
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    updatePage(page) {
      this.$emit('updatePage', page);
    },
    updateSize(size) {
      this.$emit('updateSize', size);
    },
    addMr(uuid) {
      this.$emit('addMr', uuid);
    },
    changeOpen(val, list) {
      let listdata = {};
      Object.assign(listdata, {
        uuid: list.uuid,
        isOpen: val
      });
      this.$api.codehub.version.updateOpen(listdata).then(res => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
        } else {
          this.$set(list, 'isOpen', val ? 0 : 1);
        }
      }).catch(error => {
        this.$set(list, 'isOpen', val ? 0 : 1);
      });
    },
    deleteVersion(uuid) {
      this.$emit('deleteVersion', uuid);
    }
  },
  filter: {},
  computed: { 
    showtips() {
      return function(config) {
        let isshow = false;
        if ((config.appSystemVo && config.appSystemVo.abbrName) || (config.appModuleVo && config.appModuleVo.abbrName)) {
          isshow = true;
        }
        return isshow;
      };
    },
    setTxt() {
      return function(config, type) {
        let text = '';
        let prev = config.appSystemVo || '';
        let next = config.appModuleVo || '';
        if (prev) {
          text = prev.abbrName + (prev.name ? ('(' + prev.name + ')') : '');
          if (next) {
            text += ' / ' + (next.abbrName ? next.abbrName : '') + (next.name ? ('(' + next.name + ')') : '');
          }
        }
        return text;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.tag-label{
  margin-left: 10px;
  transform: scale(0.9);
}
</style>
