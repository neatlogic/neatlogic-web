<template>
  <div>
    <TsForm
      ref="form"
      v-model="projectData"
      :item-list="formConfig"
      labelPosition="top"
    >
      <template v-slot:templateId>
        <div v-if="!id && appType && appType.cardList && appType.cardList.length > 0">
          <div
            v-for="(row, index) in appType.cardList"
            :key="index"
            class="project-item padding radius-md mb-md cursor"
            :class="projectData.templateId === row.id ? 'bg-selected border-primary' : 'border-primary-grey bg-op'"
            @click="selectTemplate(row.id)"
          >
            <div>
              <h3>{{ row.name }}</h3>
            </div>
            <div>
              <Tag v-for="(at, aindex) in row.appTypeList" :key="aindex">
                {{ at.appTypeName }}
              </Tag>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="project-item bg-op padding radius-md border-primary-grey">
            <div>
              <h3>{{ projectData.type }}</h3>
            </div>
            <div>
              <Tag v-for="(object, index) in projectData.appList" :key="index">
                {{ object.name }}
              </Tag>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:userList>
        <div class="bg-op radius-md padding">
          <div v-for="(user, index) in projectData.userList" :key="index" class="mr-md user-item">
            <div class="user-item-edit tsfont-close text-info cursor" @click.stop="removeUser(user)"></div>
            <div><UserCard
              alignMode="vertical"
              :uuid="user.userId"
              :hideAvatar="false"
              :iconSize="32"
            ></UserCard></div>
            <div v-if="user.userTypeList && user.userTypeList.length > 0" class="text-grey">
              <span>{{ user.userTypeList[0].userTypeName }}</span>
              <span v-if="user.isNew" class="text-success">·{{ $t('term.rdm.new') }}</span>
            </div>
          </div>
          <div style="display: inline-block; text-align: center; font-size: 25px" class="padding-sm" @click="addUser">
            <span class="tsfont-plus text-info cursor"></span>
          </div>
        </div>
      </template>
      <template v-slot:color>
        <ColorPicker
          v-model="projectData.color"
          recommend
          transfer
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
        />
      </template>
    </TsForm>
    <div style="text-align: right" class="mt-md">
      <Button v-if="mode === 'window'" type="primary" @click="save">{{ $t('page.save') }}</Button>
    </div>
    <UserAdd
      v-if="isUserAddShow"
      mode="emit"
      :projectId="id"
      @save="setProjectUser"
      @close="closeAddUser"
    ></UserAdd>
    <UserDelete
      v-if="isUserDeleteShow"
      :projectUser="currentProjectUser"
      @close="closeDelUser"
    >
    </UserDelete>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    UserAdd: resolve => require(['@/views/pages/rdm/project/edittab/project/user-add.vue'], resolve),
    UserDelete: resolve => require(['@/views/pages/rdm/project/edittab/project/user-delete.vue'], resolve)
  },
  props: {
    id: { type: Number },
    mode: { type: String, default: 'window' }
  },
  data() {
    return {
      isUserAddShow: false,
      isUserDeleteShow: false,
      currentProjectUser: null,
      formConfig: [
        {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', { target: this.$t('term.rdm.projectname') }) }]
        },
        {
          type: 'slot',
          name: 'templateId',
          validateList: ['required'],
          label: this.$t('term.rdm.projecttype')
        },
        {
          type: 'slot',
          name: 'userList',
          label: this.$t('term.rdm.projectmember')
        },
        {
          type: 'daterange',
          format: 'yyyy-MM-dd',
          name: 'dateRange',
          transfer: true,
          label: this.$t('term.rdm.startenddate')
        },
        {
          type: 'slot',
          name: 'color',
          label: this.$t('page.color')
        },
        {
          type: 'textarea',
          name: 'description',
          label: this.$t('term.rdm.peojectdesc'),
          maxlength: 500
        }
      ],
      appType: { cardList: [] },
      projectData: {}
    };
  },
  beforeCreate() {},
  created() {
    this.searchProjectTemplate();
    if (this.id) {
      this.getProjectById();
    }
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    removeUser(user) {
      if (user.isNew) {
        const index = this.projectData.userList.findIndex(d => d === user);
        if (index > -1) {
          console.log(index);
          this.projectData.userList.splice(index, 1);
        }
      } else {
        this.currentProjectUser = user;
        this.isUserDeleteShow = true;
      }
    },
    setProjectUser(userType, userTypeName, userIdList) {
      if (this.projectData) {
        if (this.projectData.userList) {
          userIdList.forEach(uid => {
            uid = uid.replace('user#', '');
            let isExists = false;
            this.projectData.userList.forEach(user => {
              if (user.userId === uid && user.userTypeList.find(ut => ut.userType === userType)) {
                isExists = true;
              }
              if (isExists) {
                return false;
              }
            });
            if (!isExists) {
              this.projectData.userList.push({
                isNew: true,
                userId: uid,
                userTypeList: [
                  {
                    userType: userType,
                    userTypeName: userTypeName
                  }
                ]
              });
            }
          });
        } else {
          this.$set(this.projectData, 'userList', []);
          userIdList.forEach(uid => {
            this.projectData.userList.push({
              isNew: true,
              userId: uid,
              userTypeList: [
                {
                  userType: userType,
                  userTypeName: userTypeName
                }
              ]
            });
          });
        }
      }
    },
    addUser() {
      this.isUserAddShow = true;
    },
    closeAddUser(needRefresh) {
      if (needRefresh) {
        this.getProjectById();
      }
      this.isUserAddShow = false;
    },
    closeDelUser(userTypeList) {
      this.isUserDeleteShow = false;
      if (userTypeList && userTypeList.length > 0) {
        for (let i = this.currentProjectUser.userTypeList.length - 1; i >= 0; i--) {
          const userType = this.currentProjectUser.userTypeList[i];
          if (userTypeList.includes(userType.userType)) {
            this.currentProjectUser.userTypeList.splice(i, 1);
          }
        }
        if (this.currentProjectUser.userTypeList.length == 0) {
          const index = this.projectData.userList.findIndex(d => d === this.currentProjectUser);
          if (index > -1) {
            this.projectData.userList.splice(index, 1);
          }
        }
      }
    },
    getProjectById() {
      if (this.id) {
        this.$api.rdm.project.getProjectById(this.id).then(res => {
          this.projectData = res.Return;
        });
      }
    },
    save(callback) {
      const form = this.$refs['form'];
      if (form.valid()) {
        this.$api.rdm.project.saveProject(this.projectData).then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.$store.commit('leftMenu/setRdmProjectCount', 'add');
            if (callback && typeof callback === 'function') {
              callback();
            }
            this.getProjectById();
          }
        });
      }
    },
    selectTemplate(id) {
      this.$set(this.projectData, 'templateId', id);
    },
    searchProjectTemplate() {
      this.$api.rdm.projecttemplate.searchProjectTemplate({}).then(res => {
        this.appType.cardList = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.project-item {
  border-width: 1px;
  border-style: solid;
}
.user-item {
  display: inline-block;
  text-align: center;
  position: relative;
}
.user-item:hover {
  .user-item-edit {
    display: inline-block;
  }
}
.user-item-edit {
  display: none;
  position: absolute;
  right: 0px;
  top: -10px;
  z-index: 99;
}
</style>
