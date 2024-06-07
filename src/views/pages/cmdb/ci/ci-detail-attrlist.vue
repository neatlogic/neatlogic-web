<template>
  <div>
    <TsTable
      v-if="attrDataList"
      v-bind="attrDataList"
      :showSizer="false"
      :hideAction="false"
      :showTotal="false"
      :fixedHeader="false"
    >
      <template slot="typeText" slot-scope="{ row }">
        {{ row.typeText }}
      </template>
      <template slot="ciId" slot-scope="{ row }">
        <span v-if="row.isExtended == 1">
          <a href="javascript:void(0)" @click="goToParentCi(row.ciId)">{{ row.ciLabel }}</a>
        </span>
        <span v-else></span>
      </template>
      <template slot="name" slot-scope="{row}">
        <a
          v-if="!row.isExtended"
          href="javascript:void(0)"
          @click="editAttr(row)"
        >{{ row.name }}</a>
        <span v-else>{{ row.name }}</span>
        <Poptip
          v-if="row.description"
          :transfer="true"
          placement="right"
          trigger="hover"
          :title="$t('page.explain')"
        >
          <div slot="content">
            {{ row.description }}
          </div>
          <i class="tsfont-info-o" style="cursor:pointer"></i>
        </Poptip>
      </template>
      <template slot="isUnique" slot-scope="{ row }">
        <div v-if="row.isUnique" class="text-success">{{ $t('page.yes') }}</div>
        <div v-else class="text-grey">{{ $t('page.no') }}</div>
      </template>
      <template slot="isRequired" slot-scope="{ row }">
        <div v-if="row.isRequired" class="text-success">{{ $t('page.yes') }}</div>
        <div v-else class="text-grey">{{ $t('page.no') }}</div>
      </template>
      <template v-slot:isSearchAble="{ row }">
        <div v-if="row.isSearchAble" class="text-success">{{ $t('page.yes') }}</div>
        <div v-else class="text-grey">{{ $t('page.no') }}</div>
      </template>
      <template slot="inputType" slot-scope="{ row }">
        <div v-if="row.inputType=='at'" class="text-success">{{ $t('page.yes') }}</div>
        <div v-else class="text-grey">{{ $t('page.no') }}</div>
      </template>
      <template slot="typeText" slot-scope="{ row }">
        {{ row.typeText }}
      </template>
      <template slot="action" slot-scope="{ row }">
        <div class="tstable-action">
          <ul v-if="!row.isExtended" class="tstable-action-ul">
            <li v-if="!row.isPrivate" class="tsfont-trash-o" @click="deleteAttr(row)">{{ $t('page.delete') }}</li>
          </ul>
        </div>
      </template>
    </TsTable>
  </div>
</template>
<script>
import TsTable from '@/resources/components/TsTable/TsTable.vue';

export default {
  name: '',
  components: {
    TsTable
  },
  props: {
    attrData: {type: Object}
  },
  data() {
    return {};
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
    goToParentCi: function(ciId) {
      this.$emit('toParentCi', ciId);
    },
    editAttr: function(attr) {
      this.$emit('edit', attr);
    },
    deleteAttr: function(attr) {
      this.$emit('delete', attr);
    }
  },
  filter: {},
  computed: {
    attrDataList() {
      let tmp = this.attrData;
      tmp.theadList = [{
        title: this.$t('page.uniquekey'),
        key: 'name'
      },
      {
        title: this.$t('page.name'),
        key: 'label'
      },
      {
        title: this.$t('page.alias'),
        key: 'alias'
      },
      {
        title: this.$t('page.type'),
        key: 'typeText'
      },
      {
        title: this.$t('term.cmdb.extendto'),
        key: 'ciId'
      },
      {
        title: this.$t('page.isrequired'),
        key: 'isRequired'
      },
      {
        title: this.$t('page.isunique'),
        key: 'isUnique'
      },
      {
        title: this.$t('term.cmdb.searchable'),
        key: 'isSearchAble'
      },
      {
        title: this.$t('page.autocollect'),
        key: 'inputType'
      },
      {
        title: this.$t('page.validate'),
        key: 'validatorName'
      },
      {
        title: this.$t('page.group'),
        key: 'groupName'
      },
      {
        title: '',
        key: 'action',
        align: 'right'
      }
      ];
      return tmp;
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
