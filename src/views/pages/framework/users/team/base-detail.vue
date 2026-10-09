<template>
  <div class="team-detail">
    <TsForm ref="teamForm" :itemList="formData">
      <template v-slot:teamUserTitleList>
        <div class="title-list">
          <div class="text-href tsfont-plus addBtn" @click="editUserTitle()">
            {{ $t('dialog.title.addtarget', { target: $t('page.user') }) }}</div>
          <div ref="titleTable">
            <TsTable
              :theadList="titleTheadList"
              :tbodyList="teamUserTitleList"
              :height="titleTableHeight"
              :showPager="false"
            >
              <template v-slot:userList="{ row }">
                <div class="title-users">
                  <UserSelect
                    v-for="(item, index) in row.userList || []"
                    :key="index"
                    :value="item && item.includes('user#') ? item : `user#${item}`"
                    :readonly="true"
                  ></UserSelect>
                </div>
              </template>
              <template v-slot:action="{ row }">
                <div class="tstable-action">
                  <ul class="tstable-action-ul">
                    <li class="tsfont-edit text-action" @click="editUserTitle(row, teamUserTitleList.indexOf(row))">{{ $t('page.edit') }}</li>
                    <li class="tsfont-trash-o text-action" @click="removeUserTitle(teamUserTitleList.indexOf(row))">{{ $t('page.delete') }}</li>
                  </ul>
                </div>
              </template>
            </TsTable>
          </div>
        </div>
      </template>
    </TsForm>
    <TsDialog
      v-if="isShowEditUserDialog"
      :title="addConfig.title"
      :isShow="isShowEditUserDialog"
      @on-close="onClose"
      @on-ok="onClose(true)"
    >
      <TsForm ref="leaderForm" v-model="addConfig.dataConfig" :itemList="addConfig.itemList"></TsForm>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue')
  },
  filters: {},
  props: {
    uuid: [String, Number],
    isEdit: [String, Number],
    isAdd: [Boolean, String]
  },
  data() {
    return {
      formData: {
        pathNameList: {
          label: this.$t('term.framework.parentpath'),
          type: 'textspan',
          value: ''
        },
        name: {
          value: '',
          label: this.$t('page.name'),
          type: 'text',
          maxlength: 50,
          validateList: [
            {
              name: 'required',
              message: this.$t('form.placeholder.pleaseinput', { target: this.$t('term.framework.teamname') })
            },
            {
              name: 'non-special'
            }
          ]
        },
        email: {
          value: '',
          label: this.$t('page.email'),
          type: 'text',
          maxlength: 100,
          validateList: [{ name: 'mail', message: this.$t('message.pleaseentertruetarget', { target: this.$t('page.email') }) }]
        },
        phone: {
          label: this.$t('page.phonenumber'),
          type: 'text',
          maxlength: 11,
          validateList: [{ name: 'phone', message: this.$t('message.pleaseentertruetarget', { target: this.$t('page.phonenumber') }) }]
        },
        level: {
          type: 'select',
          label: this.$t('page.hierarchy'),
          placeholder: this.$t('form.placeholder.pleaseselect', { target: this.$t('page.hierarchy') }),
          search: true,
          multiple: false,
          url: '/api/rest/team/level/list',
          transfer: true
        },
        teamUserTitleList: {
          type: 'slot',
          label: this.$t('term.framework.groupleader')
        }
      },
      teamUserTitleList: [],
      titleTableHeight: 240,
      titleTheadList: [
        { title: this.$t('term.framework.position'), key: 'title', width: 160 },
        { title: this.$t('page.user'), key: 'userList' },
        { title: ' ', key: 'action', type: 'action', width: 160 }
      ],
      isShowEditUserDialog: false,
      addConfig: {
        title: '',
        dataConfig: { title: '', userList: [] },
        itemList: {
          title: {
            type: 'select',
            label: this.$t('term.framework.position'),
            allowCreate: true,
            search: true,
            transfer: true,
            url: '/api/rest/user/title/search',
            rootName: 'tbodyList',
            valueName: 'name',
            textName: 'name',
            validateList: ['required'],
            desc: this.$t('term.framework.positionoptiondesc')
          },
          userList: {
            type: 'userselect',
            label: this.$t('page.user'),
            groupList: ['user'],
            multiple: true,
            transfer: true,
            validateList: ['required']
          }
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getteamForm();
    this.$nextTick(this.updateTitleTableHeight);
    window.addEventListener('resize', this.updateTitleTableHeight);
    if (window.ResizeObserver) {
      this.titleTableObserver = new ResizeObserver(() => this.$nextTick(this.updateTitleTableHeight));
      this.titleTableObserver.observe(this.$el);
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.updateTitleTableHeight);
    if (this.titleTableObserver) {
      this.titleTableObserver.disconnect();
    }
  },
  destroyed() {},
  methods: {
    updateTitleTableHeight() {
      const table = this.$refs.titleTable;
      if (!table || !table.getBoundingClientRect().width) return;
      const form = this.$el.closest('.detail-form');
      const footer = form && form.querySelector('.detail-footer');
      const content = this.$el.closest('.tscontain-body');
      if (!content) return;
      const bottom = footer ? footer.getBoundingClientRect().top : content.getBoundingClientRect().bottom - 56;
      this.titleTableHeight = Math.max(120, Math.floor(bottom - table.getBoundingClientRect().top - 16));
    },
    getteamForm() {
      let _this = this;
      if (this.uuid && !this.isAdd) {
        let data = {
          uuid: this.uuid,
          isEdit: this.isEdit
        };
        this.$api.framework.team.getTeamConfig(data).then(res => {
          if (res.Status == 'OK') {
            let teamConfig = res.Return;
            for (let key in _this.formData) {
              let item = _this.formData[key];
              item.value = teamConfig[key];
            }
            this.teamUserTitleList = teamConfig.teamUserTitleList || [];
            this.$nextTick(this.updateTitleTableHeight);
            _this.formData.pathNameList.value = _this.formData.pathNameList.value.join(' / ');
            //向页面提供同一次查询的完整分组路径，标题无需重复请求详情。
            this.$emit('loaded', teamConfig);
          }
        });
      }
    },
    editUserTitle(item, index) {
      //添加职务  编辑职务
      this.isShowEditUserDialog = true;
      this.addConfig.dataConfig = { userList: [], title: '' };
      if (item) {
        this.addConfig.title = this.$t('dialog.title.edittarget', {'target': this.$t('page.user')});
        this.addConfig.index = index;
        this.addConfig.dataConfig.title = item.title;
        this.addConfig.dataConfig.userList = this.addUserPrefix(item.userList);
      } else {
        this.addConfig.title = this.$t('dialog.title.addtarget', {'target': this.$t('page.user')});
      }
    },
    removeUserTitle(index, item) {
      this.teamUserTitleList.splice(index, 1);
    },
    addUserPrefix(list) {
      if (list) {
        for (let i = 0; i <= list.length; i++) {
          if (list[i] && !list[i].includes('user#')) {
            list[i] = `user#${list[i]}`;
          }
        }
      }
      return list;
    },
    onClose(type) {
      if (type) {
        if (!this.$refs.leaderForm.valid()) {
          return;
        }
        let json = { userList: this.addConfig.dataConfig.userList, title: this.addConfig.dataConfig.title };
        if (this.$utils.isEmpty(this.addConfig.index)) {
          this.teamUserTitleList.push(json);
        } else {
          Object.assign(this.teamUserTitleList[this.addConfig.index], json);
        }
      }
      this.isShowEditUserDialog = false;
      this.userList = null;
      this.addConfig.index = null;
    },
    getFormValue() {
      let data = this.$refs.teamForm.getFormValue();
      data.teamUserTitleList = this.teamUserTitleList.map(item => {
        let cc = { title: item.title };
        cc.userList = this.handleUserPrefix(item.userList);
        return cc;
      });
      delete data.pathNameList;
      return data;
    },
    handleUserPrefix(list) {
      // 处理用户前缀user#
      if (list) {
        for (let i = 0; i <= list.length; i++) {
          if (list[i] && list[i].includes('user#')) {
            list[i] = list[i].substring(5, list[i].length);
          }
        }
      }
      return list;
    },
    valid() {
      return this.$refs.teamForm.valid();
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.addBtn {
  margin-left: 0px !important;
  margin-bottom: @space-sm;
}
.title-users {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
