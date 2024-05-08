<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <span class="text-action tsfont-plus pl-sm" @click="teamTagTypeManage">{{ $t('page.tag') }}</span>
      </template>
      <template slot="topRight">
        <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="searchData(1)"></CombineSearcher>
      </template>
      <template v-slot:sider>
        <div class="pt-md pr-md pl-md">
          <TsFormInput
            v-model="keyword"
            border="bottom"
            :search="true"
            :placeholder="$t('form.placeholder.pleaseinput', { target: $t('page.keyword') })"
          ></TsFormInput>
        </div>
        <div class="pl-md pr-md">
          <div style="overflow-y: auto" :style="{ height: catalogHeight }" class="titlelistBox">
            <ul class="navlist-ul">
              <li
                v-for="tag in tagListConfig.tbodyList"
                :id="tag.id"
                :key="tag.id"
                class="text-default overflow treeList radius-sm pl-sm pr-xs navlist-text navlist-li"
                :class="{ active: isActive(tag.id)}"
                :title="tag.matrixAttrValue + '(' + tag.id + ')'"
                @click="
                  if (tagId === tag.id) {
                    if (toggleable) {
                      click(null);
                    }
                  } else {
                    click(tag.id);
                  }
                "
              >
                <span>{{ tag.matrixAttrValue }}</span>
                <!-- <span style="padding-left: 2px" class="text-grey">({{ tag.id }})</span> -->
                <span class="navlist-action">
                  <Dropdown trigger="click" :transfer="true">
                    <span class="tsfont-option-horizontal text-action"></span>
                    <DropdownMenu slot="list" class="overdown">
                      <DropdownItem @click.native="editRename(childrenItem)">
                        <div>{{ $t('page.edit') }}</div>
                      </DropdownItem>
                      <DropdownItem @click.native="delName(childrenItem.name, childrenItem.uuid, index)">
                        <div>{{ $t('page.delete') }}</div>
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </template>
      <template slot="content">
        <TeamTagTeam :tagIdList="tagIdList"></TeamTagTeam>
      </template>
    </TsContain>
    <TeamTagTypeDialog v-if="isDialogShow" @close="closeDialog"></TeamTagTypeDialog>
  </div>
</template>
<script>
export default {
  name: 'CatalogManage',
  components: {
    TeamTagTypeDialog: resolve => require(['./team-tag-type'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TeamTagTeam: resolve => require(['./team-tag-team'], resolve)
  },
  directives: {},
  props: [''],
  data() {
    return {
      tagId: null,
      tagIdList: [],
      catalogHeight: `calc(100vh - 80px - 64px - 50px - 20px )`, // 默认值高度：160菜单栏+导航栏+底部间隙，64搜索框高度，40tab高度，16底部间距
      isDialogShow: false,
      searchVal: {}, //搜索下拉插件的值
      searchConfig: {
        placeholder: '分组' + this.$t('page.name'),
        searchList: [
          {
            type: 'select',
            name: 'typeId',
            value: '',
            dataList: [],
            label: '标签',
            search: true,
            dynamicUrl: '/api/rest/autoexec/type/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getToolClassificationList,
            transfer: true,
            labelPosition: 'top'
          }
        ]
      },
      keyword: null,
      searchParams: {},
      theadList: [
        { key: 'id', title: '#' },
        { key: 'matrixAttrValue', title: '标签名' },
        { key: 'matrixName', title: '矩阵' },
        { key: 'matrixAttr', title: '矩阵列唯一标识' },
        { key: 'checkedChildren', title: '分组穿透' },
        { key: 'action' }
      ],
      tagListConfig: {
        tbodyList: [],
        currentPage: 1,
        pageSize: 20
      }
    };
  },
  created() {
    this.searchTableData();
  },
  beforeMount() {},
  mounted() {
  },
  methods: {
    searchTableData(currentPage) {
      let data = {
        keyword: this.keyword
      };
      if (currentPage) {
        this.searchParams.currentPage = currentPage;
      }
      Object.assign(data, this.searchParams);
      this.$api.framework.teamtag.searchTeamTag(data).then(res => {
        if (res.Status == 'OK') {
          this.tagListConfig = res.Return || {};
        }
      });
    },
    changePageSize(pageSize) {
      this.searchParams.pageSize = pageSize;
      this.searchTableData(1);
    },
    changeCurrent(currentPage) {
      this.searchParams.currentPage = currentPage;
      this.searchTableData();
    },
    teamTagTypeManage() {
      this.isDialogShow = true;
    },
    closeDialog() {
      this.isDialogShow = false;
    },
    click(tagId) {
      if (this.tagIdList.some(t => t == tagId)) {
        this.tagIdList = this.tagIdList.filter(function(t) { return t != tagId; });
      } else {
        this.tagIdList.push(tagId);
      }
    },
    isActive(tagId) {
      return this.tagIdList.some(t => t == tagId);
    }
  },
  computed: {
    
  },
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
@import (reference) '~@/resources/assets/css/theme.less';
.titlelistBox {
  margin-bottom: 14px;
}
.treeTitle {
  padding-left: 16px;
  font-size: 12px;
  margin-bottom: 4px;
}
.treeList {
  font-size: 13px;
  font-weight: 400;
  min-width: 130px;
  height: 32px;
  line-height: 32px;
  cursor: pointer;
}

.navlist-ul {
  position: relative;
  &:hover {
    .navlist-text {
      a:before {
        opacity: 0;
      }
    }
  }
  .navlist-li {
    &:hover{
      .navlist-action {
        display: block;
      }
      .navlist-amount {
        display: none;
      }
    }
  }
  .active {
    background: var(--primary-grey, #e7f0ff);
  }

  .navlist-text {
    cursor: pointer;
    position: relative;
    display: inline-block;
    max-width: 100%;
    line-height: 36px;
    height: 36px;
    text-align: left;
    width: 100%;
    &:before {
      margin-right: 10px;
      margin-left: 2px;
    }
    a {
      position: relative;
    }
  }

  .navlist-amount {
    position: absolute;
    top: 0;
    right: 8px;
    line-height: 36px;
    height: 36px;
    font-style: normal;
    font-size: 12px;
    color: @icon-color;
    text-align: right;
    &.already {
      right: 20px;
    }
  }

  .navlist-action {
    position: absolute;
    top: 0;
    right: 6px;
    line-height: 36px;
    height: 36px;
    width: 18px;
    cursor: pointer;
    display: none;
    text-align: center;
    font-size: 10px;
  }
  .btn-isdone {
    // position: absolute;
    // right: 16px;
    font-size: 10px;
    padding: 0 4px;
    line-height: 16px;
    height: 16px;
    min-width: 18px;
    border-radius: 8px;
    /deep/span {
      display: block;
    }
  }
}
</style>
