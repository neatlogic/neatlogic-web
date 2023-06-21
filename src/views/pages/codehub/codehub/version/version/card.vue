<template>
  <TsCard
    v-bind="cardData"
    headerPosition="right"
    @updatePage="updatePage"
    @updateSize="updateSize"
  >
    <template slot="header" slot-scope="{ row }">
      <div v-if="row.canEdit || canDelete" class="action-group">
        <div v-if="row.canEdit" class="action-item text-action tsfont-plus" @click="addMr(row.id,row.versionTypeStrategyRelationVo?row.versionTypeStrategyRelationVo.versionStrategyType:null)">{{ $t('term.codehub.createmergerequest') }}</div>
        <div v-if="canDelete" class="action-item text-action tsfont-trash-o" @click="deleteVersion(row.id)">{{ $t('page.delete') }}</div>
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
            <div>{{ setAbbrNameAndName(row) }}</div>
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
            <span class="text-grey pl-sm">{{ row.fcd | formatDate }}</span>
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
    canDelete: {
      type: Boolean
    }
  },
  data() {
    return {
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
    addMr(id, type) {
      this.$emit('addMr', id, type);
    },
    deleteVersion(id) {
      this.$emit('deleteVersion', id);
    }
  },
  filter: {},
  computed: {
    setAbbrNameAndName() {
      // 获取应用模块【简称和名称】
      return function(config) {
        let text = '';
        let appSystemVo = config ? config.appSystemVo : '';
        let appModuleVo = config ? config.appModuleVo : '';
        if (appSystemVo) {
          if (appModuleVo) {
            text = `${this.$utils.getAbbrNameAndName(appSystemVo)}/${this.$utils.getAbbrNameAndName(appModuleVo)}`;
          } else {
            text = this.$utils.getAbbrNameAndName(appSystemVo);
          }
        } else if (appModuleVo) {
          text = this.$utils.getAbbrNameAndName(appModuleVo);
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
