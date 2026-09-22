<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <div class="flex-between align-center mb-sm">
        <div>
          <span class="text-title mr-md">{{ $t('term.cmdb.selectedmodelcount', { count: selectedCiList.length }) }}</span>
          <span class="text-primary mr-sm">{{ $t('term.cmdb.appendmodelcount', { count: appendCount }) }}</span>
          <span class="text-warning">{{ $t('term.cmdb.covermodelcount', { count: replaceCount }) }}</span>
        </div>
        <InputSearcher v-model="keyword" :width="240"></InputSearcher>
      </div>
      <div class="action-group mb-sm">
        <div class="action-item tsfont-plus" @click="setAllStrategy('append')">{{ $t('term.cmdb.setallappend') }}</div>
        <div class="action-item tsfont-refresh" @click="setAllStrategy('replace')">{{ $t('term.cmdb.setallcover') }}</div>
      </div>
      <div class="batch-auth-tag-list border-color radius-md pt-sm pr-sm pb-sm pl-sm mb-md">
        <Tag
          v-for="ci in filteredCiList"
          :key="ci.id"
          :color="strategyMap[ci.id] === 'replace' ? 'orange' : 'primary'"
          class="batch-auth-tag"
        >
          <span class="batch-auth-model-name" :title="getCiText(ci)">{{ getCiText(ci) }}</span>
          <Dropdown
            trigger="click"
            transfer
            class="ml-xs"
            @on-click="setStrategy(ci.id, $event)"
          >
            <span class="cursor">
              {{ strategyMap[ci.id] === 'replace' ? $t('page.cover') : $t('page.append') }}
              <Icon type="ios-arrow-down"></Icon>
            </span>
            <DropdownMenu slot="list">
              <DropdownItem name="append">{{ $t('page.append') }}</DropdownItem>
              <DropdownItem name="replace">{{ $t('page.cover') }}</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Tag>
        <NoData v-if="filteredCiList.length === 0" :text="$t('page.nodata')"></NoData>
      </div>
      <Alert v-if="isMixedScope" show-icon type="warning">{{ $t('term.cmdb.virtualmodelauthscopetip') }}</Alert>
      <AuthSettingForm v-model="authList" :scope="authScope"></AuthSettingForm>
    </template>
    <template v-slot:footer>
      <Button :disabled="isSaving" @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" :loading="isSaving" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: 'CiBatchAuthEdit',
  components: {
    AuthSettingForm: () => import('./auth-setting-form.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  props: {
    selectedCiList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      authList: [],
      strategyMap: {},
      keyword: '',
      isSaving: false,
      dialogConfig: {
        type: 'modal',
        title: this.$t('term.cmdb.batcheditmodelauth'),
        maskClose: false,
        isShow: true,
        showCloseIcon: true,
        width: 'large'
      }
    };
  },
  created() {
    this.selectedCiList.forEach(ci => {
      this.$set(this.strategyMap, ci.id, 'append');
    });
  },
  methods: {
    getCiText(ci) {
      if (ci.label && ci.name) {
        return ci.label + ' (' + ci.name + ')';
      } else {
        return ci.label || ci.name || '';
      }
    },
    setStrategy(ciId, strategy) {
      this.$set(this.strategyMap, ciId, strategy);
    },
    setAllStrategy(strategy) {
      this.selectedCiList.forEach(ci => {
        this.$set(this.strategyMap, ci.id, strategy);
      });
    },
    save() {
      if (this.isSaving) {
        return;
      }
      const appendCiIdList = [];
      const replaceCiIdList = [];
      this.selectedCiList.forEach(ci => {
        if (this.strategyMap[ci.id] === 'replace') {
          replaceCiIdList.push(ci.id);
        } else {
          appendCiIdList.push(ci.id);
        }
      });
      this.isSaving = true;
      this.dialogConfig.showCloseIcon = false;
      this.$api.cmdb.ci.saveCiAuth({
        appendCiIdList: appendCiIdList,
        replaceCiIdList: replaceCiIdList,
        authList: this.authList
      }).then(res => {
        if (res.Status === 'OK') {
          this.isSaving = false;
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        }
      }).finally(() => {
        this.isSaving = false;
        this.dialogConfig.showCloseIcon = true;
      });
    },
    close(needRefresh) {
      if (this.isSaving) {
        return;
      }
      this.$emit('close', needRefresh === true);
    }
  },
  computed: {
    filteredCiList() {
      const keyword = this.keyword.trim().toLowerCase();
      if (!keyword) {
        return this.selectedCiList;
      }
      return this.selectedCiList.filter(ci => {
        return this.getCiText(ci).toLowerCase().includes(keyword);
      });
    },
    appendCount() {
      return this.selectedCiList.filter(ci => this.strategyMap[ci.id] !== 'replace').length;
    },
    replaceCount() {
      return this.selectedCiList.length - this.appendCount;
    },
    hasVirtualCi() {
      return this.selectedCiList.some(ci => !!ci.isVirtual);
    },
    hasNormalCi() {
      return this.selectedCiList.some(ci => !ci.isVirtual);
    },
    isMixedScope() {
      return this.hasVirtualCi && this.hasNormalCi;
    },
    authScope() {
      if (this.hasVirtualCi && !this.hasNormalCi) {
        return 'vci';
      } else {
        return 'ci';
      }
    }
  }
};
</script>
<style lang="less" scoped>
.batch-auth-tag-list {
  max-height: 180px;
  min-height: 48px;
  overflow-y: auto;
  border-width: 1px;
  border-style: solid;
}
.batch-auth-tag {
  max-width: 320px;
  ::v-deep .ivu-tag-text {
    display: inline-flex;
    align-items: center;
    max-width: 300px;
  }
}
.batch-auth-model-name {
  display: inline-block;
  max-width: 210px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
