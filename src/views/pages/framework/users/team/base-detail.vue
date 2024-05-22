
<template>
  <div>
    <TsForm ref="teamForm" :itemList="formData">
      <template v-slot:teamUserTitleList>
        <div>
          <div class="text-href tsfont-plus addBtn" @click="editUserTitle()">{{ $t('dialog.title.addtarget', {target: $t('term.framework.position')}) }}</div>
          <ul v-if="teamUserTitleList && teamUserTitleList.length " class="leader-ul">
            <li v-for="(data ,index) in teamUserTitleList" :key="index" class="bg-op radius-sm">
              <div class="div-header">
                <span class="text-tip">{{ data.title }}</span>
                <div class="div-btn">
                  <span class="tsfont-edit text-tip-active ml-md" :title="$t('page.edit')" @click="editUserTitle(data,index)"></span>
                  <span class="tsfont-trash-o text-tip-active ml-md" :title="$t('page.delete')" @click="removeUserTitle(index,data)"></span>
                </div>
              </div>
              <div v-if="data.userList && data.userList.length > 0" class="div-content">
                <div v-for="item in data.userList" :key="item">
                  <UserSelect :value="item && item.includes('user#') ? item : `user#${item}`" :readonly="true"></UserSelect>
                </div>
              </div>
            </li>
          </ul>
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
      <TsForm ref="leaderForm" v-model="addConfig.dataConfig" :itemList="addConfig.itemList">
      </TsForm>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue')
  },
  filters: {
  },
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
              message: this.$t('form.placeholder.pleaseinput', {target: this.$t('term.framework.teamname')})
            },
            {
              name: 'non-special'
            }
          ]
        },
        level: {
          type: 'select',
          label: this.$t('page.hierarchy'),
          placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.hierarchy')}),
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
      isShowEditUserDialog: false,
      addConfig: {
        title: '',
        dataConfig: {title: '', userList: []},
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
            validateList: ['required']
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
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
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
            this.teamUserTitleList = teamConfig.teamUserTitleList;
            _this.formData.pathNameList.value = _this.formData.pathNameList.value.join('>');
          }
        });
      }
    },
    editUserTitle(item, index) { //添加职务  编辑职务
      this.isShowEditUserDialog = true;
      this.addConfig.dataConfig = {userList: [], title: ''};
      if (item) {
        this.addConfig.title = this.$t('page.edit');
        this.addConfig.index = index;
        this.addConfig.dataConfig.title = item.title;
        this.addConfig.dataConfig.userList = this.addUserPrefix(item.userList);
      } else {
        this.addConfig.title = this.$t('page.new');
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
        let json = { userList: this.addConfig.dataConfig.userList, title: this.addConfig.dataConfig.title};
        if (this.$utils.isEmpty(this.addConfig.index)) {
          this.teamUserTitleList.unshift(json);
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
        let cc = {title: item.title};
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
.addBtn{
  margin-left:0px !important;
  margin-bottom: @space-sm;
}
.leader-ul{
  >li{
    margin-bottom: @space-sm;
    padding:@space-sm @space-normal;
    .div-header{
      position: relative;
      padding-right: 50px;
      >.div-btn{
        position:absolute;
        top:0px;
        right: 0px;
        visibility: hidden;
      }
    }
    .div-content{
      padding:0px @space-normal;
      .desc{
        padding-left: 6px;
        vertical-align: baseline;
      }
    }
    &:hover{
       .div-btn{
          visibility:visible;
       }
    }
  }
}
</style>
