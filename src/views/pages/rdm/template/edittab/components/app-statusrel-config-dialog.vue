<template>
  <TsDialog v-bind="dialogConfig" @on-ok="save" @on-close="close">
    <template v-slot>
      <div>
        <!--模板中和用户相关的配置不能设置，因为用户依赖项目id才能获取-->
        <!--<TsFormItem :label="$t('page.auth')" labelPosition="top" :tooltip="$t('term.rdm.nosetnolimit')">
          <UserSelect
            :value="authIdList"
            :multiple="true"
            :transfer="true"
            :extendCondition="{ projectId: projectId }"
            :groupList="['user']"
            @on-change="
              (val, item) => {
                $set(config, 'authList', item);
              }
            "
          ></UserSelect>
        </TsFormItem>
        <TsFormItem :label="$t('term.process.dealwithuser')" labelPosition="top" :tooltip="$t('term.rdm.statusreluser')">
          <UserSelect
            :value="userIdList"
            :multiple="true"
            :transfer="true"
            :extendCondition="{ projectId: projectId }"
            :groupList="['user']"
            @on-change="
              (val, item) => {
                $set(config, 'userList', item);
              }
            "
          ></UserSelect>
        </TsFormItem>-->
        <TsFormItem :label="$t('term.rdm.attributesetting')" labelPosition="top">
          <div>
            <div>
              <span class="cursor tsfont-plus text-href" @click="addRequiredAttr()">{{ $t('term.rdm.requiredattribute') }}</span>
            </div>
            <div>
              <TsTable v-if="config.requiredAttrList && config.requiredAttrList.length > 0" :theadList="theadList" :tbodyList="config.requiredAttrList">
                <template v-slot:attr="{ row }">
                  <TsFormSelect
                    v-model="row.attrId"
                    :dataList="filtedAttrList(row)"
                    transfer
                    valueName="id"
                    textName="label"
                    border="border"
                    @on-change="
                      val => {
                        setAttrId(row, val);
                      }
                    "
                  ></TsFormSelect>
                </template>
                <template v-slot:defaultvalue="{ row }">
                  <div>
                    <AttrHandler
                      v-if="getAttrById(row.attrId)"
                      :value="row.defaultValue"
                      :attrConfig="getAttrById(row.attrId)"
                      @setValue="
                        val => {
                          setAttrValue(row, val);
                        }
                      "
                    ></AttrHandler>
                    <span v-else class="text-grey">{{ $t('form.placeholder.pleaseselect', { target: $t('page.attribute') }) }}</span>
                  </div>
                </template>
                <template v-slot:action="{ row, index }">
                  <div class="tstable-action">
                    <ul class="tstable-action-ul">
                      <li class="tsfont-trash-o" @click="deleteRequiredAttr(row, index)">{{ $t('page.delete') }}</li>
                    </ul>
                  </div>
                </template>
              </TsTable>
            </div>
          </div>
        </TsFormItem>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    AttrHandler: resolve => require(['@/views/pages/rdm/project/attr-handler/attr-handler.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    //UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {
    statusrel: { type: Object },
    appType: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      attrList: [],
      config: {
        authList: [],
        requiredAttrList: []
      },
      dialogConfig: {
        title: this.statusrel.fromStatusLabel + ' -> ' + this.statusrel.toStatusLabel,
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      theadList: [
        {
          key: 'attr',
          title: this.$t('page.attribute'),
          width: 300
        },
        {
          key: 'defaultvalue',
          title: this.$t('page.defaultvalue')
        },
        {
          key: 'action'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    if (this.statusrel.config) {
      this.config = this.statusrel.config;
    }
    this.getPrivateAttrList();
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
    setAttrId(row, attrId) {
      if (attrId) {
        const attr = this.getAttrById(attrId);
        if (attr) {
          this.$set(row, 'attrLabel', attr.label);
          this.$set(row, 'attrName', attr.name);
        } else {
          this.$delete(row, 'attrLabel');
          this.$delete(row, 'attrName');
        }
      } else {
        this.$delete(row, 'attrLabel');
        this.$delete(row, 'attrName');
      }
    },
    deleteRequiredAttr(row, index) {
      this.config.requiredAttrList.splice(index, 1);
    },
    setAttrValue(row, val) {
      this.$set(row, 'defaultValue', val);
    },
    filtedAttrList(row) {
      const other = this.config.requiredAttrList.filter(d => d !== row);
      return this.attrList.filter(d => !other.find(dd => dd.attrId === d.id));
    },
    getPrivateAttrList() {
      if (this.appType?.appType) {
        let {appType = '', config = {}} = this.appType || {};
        let {attrList = []} = config || {};
        this.attrList = this.$utils.deepClone(attrList || []);
        this.$api.rdm.attr.getPrivateAttrList({ appType: appType }).then(res => {
          const privateAttrList = res.Return || [];
          privateAttrList.forEach(attr => {
            if (this.appType.config.attrList && !this.appType.config.attrList.find(d => d.type === attr.type)) {
              this.attrList.push({ ...attr, isPrivate: 1 });
            }
          });
        });
      }
    },
    getAttrById(attrId) {
      return this.attrList.find(d => d.id === attrId);
    },
    addRequiredAttr() {
      this.config.requiredAttrList.push({ attrId: null, defaultValue: null });
    },
    save() {
      this.$set(this.statusrel, 'config', this.config);
      this.$api.rdm.status.saveStatusRelConfig(this.statusrel).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        }
      });
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {
    authIdList() {
      const authIdList = [];
      if (this.config && this.config.authList) {
        this.config.authList.forEach(auth => {
          if (auth.value) {
            authIdList.push(auth.value);
          }
        });
      }
      return authIdList;
    },
    userIdList() {
      const userList = [];
      if (this.config && this.config.userList) {
        this.config.userList.forEach(user => {
          if (user.value) {
            userList.push(user.value);
          }
        });
      }
      return userList;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
