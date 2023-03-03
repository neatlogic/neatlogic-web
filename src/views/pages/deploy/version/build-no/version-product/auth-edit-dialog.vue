<template>
  <div>
    <TsDialog
      title="授权"
      type="modal"
      :isShow="true"
      ok-text="保存"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm
            ref="form"
            v-model="formValue"
            :item-list="formItemList"
          >
            <template v-slot:fileName>
              <span>{{ params.name }}</span>
            </template>
          </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '', // 版本制品
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    id: {
      type: Number,
      default: null
    },
    params: {
      type: Object,
      default: () => {}
    },
    path: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      formValue: {},
      formItemList: [
        {
          name: 'fileName',
          type: 'slot',
          maxlength: 50,
          label: '文件'
        },
        {
          name: 'aUserAuth',
          type: 'checkbox',
          maxlength: 50,
          label: '所属用户',
          multiple: true,
          dataList: [
            {
              text: '读',
              value: 'r'
            },
            {
              text: '写',
              value: 'w'
            },
            {
              text: '执行',
              value: 'x'
            }
          ]
        },
        {
          name: 'bUserGroupAuth',
          type: 'checkbox',
          maxlength: 50,
          label: '同组用户',
          multiple: true,
          dataList: [
            {
              text: '读',
              value: 'r'
            },
            {
              text: '写',
              value: 'w'
            },
            {
              text: '执行',
              value: 'x'
            }
          ]
        },
        {
          name: 'cOtherUserAuth',
          type: 'checkbox',
          maxlength: 50,
          label: '其他用户',
          multiple: true,
          dataList: [
            {
              text: '读',
              value: 'r'
            },
            {
              text: '写',
              value: 'w'
            },
            {
              text: '执行',
              value: 'x'
            }
          ]
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    let {permission} = this.params;
    if (permission) {
      this.formValue = {
        aUserAuth: this.handlePermission(permission, 0, 3),
        bUserGroupAuth: this.handlePermission(permission, 3, 6),
        cOtherUserAuth: this.handlePermission(permission, 6, 9)
      };
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
    okDialog() {
      let form = this.$refs.form;
      if (form && !form.valid()) {
        return false;
      }
      let {id, buildNo, path, name, resourceType, appSystemId, appModuleId, envId} = this.params;
      if (path && name) {
        let params = {
          id,
          buildNo,
          resourceType,
          appSystemId,
          appModuleId,
          envId,
          path: path == '/' ? `/${name}` : `${path}/${name}`,
          mode: this.handleUserAuth()
        };
        this.$api.deploy.version.updateFileChmod(params).then((res) => {
          if (res.Status == 'OK') {
            this.$Message.success('修改权限成功');
            this.closeDialog(true);
          }
        });
      }
    },
    closeDialog(needRefersh = false) {
      this.$emit('close', needRefersh);
    },
    handleUserAuth() {
      let mode = '';
      let condition1 = {
        'r': 'r--',
        'w': '-w-',
        'x': '--x'
      };
      let condition2 = {
        'rw': 'rw-',
        'wx': '-wx',
        'rx': 'r-x'
      };
      let condition3 = {
        'rwx': 'rwx'
      };
      if (this.formValue) {
        for (let key in this.formValue) {
          if (key != 'fileName') {
            mode += this.formValue[key].join('').length == 1 ? condition1[this.formValue[key].join('')] : (this.formValue[key].join('').length == 2 ? condition2[this.formValue[key].join('')] : this.formValue[key].join('').length == 3 ? condition3[this.formValue[key].join('')] : '---');
          }
        }
      }
      return mode;
    },
    handlePermission(permission, start, end) {
      let permissionList = [];
      if (permission) {
        permissionList = (permission.substring(start, end)).split('').filter((item) => {
          return item != '-';
        });
      }
      return permissionList;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
