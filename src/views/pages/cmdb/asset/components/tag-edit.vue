/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <TsDialog v-bind="showDialog" @on-close="close" @on-ok="save">
    <div>
      <div class="action-icon text-right">
        <span class="tsfont-rotate-right text-tip-active" @click="refreshTagList"></span>
        <span class="tsfont-edit text-tip-active pl-md" @click="editTag"></span>
      </div>
      <TsForm
        v-if="operateType =='addTag' || operateType =='tagEdit'"
        ref="form"
        v-model="settingConfig"
        :item-list="settingForm"
        type="type"
        label-position="right"
      >
        <template v-slot:tagList>
          <TsFormSelect
            v-model="settingConfig.tagList"
            v-bind="settingForm.tagList"
            @on-change="change"
          >
          </TsFormSelect>
        </template>
      </TsForm>
      <TsForm
        v-if=" operateType =='delTag'"
        ref="form"
        v-model="settingConfig"
        :item-list="delSettingForm"
        type="type"
        label-position="right"
      >
        <template v-slot:tagList>
          <TsFormSelect v-model="settingConfig.tagList" v-bind="delSettingForm.tagList" @on-change="change">
          </TsFormSelect>
        </template>
      </TsForm>
    </div>
  </TsDialog>
</template>
<script>
export default {
  name: 'AddTag',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {
    operateType: String,
    title: String,
    resourceIdList: Array,
    settingForm: Object,
    settingConfig: Object
  },
  data() {
    let _this = this;
    return {
      showDialog: {
        type: 'modal',
        title: _this.title,
        maskClose: false,
        isShow: true
      },
      delSettingForm: {
        id: {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        tagList: {
          type: 'slot',
          name: 'tagList',
          label: '标签',
          transfer: true,
          multiple: true,
          tagList: [],
          search: true,
          allowCreate: true,
          dynamicUrl: 'api/rest/resourcecenter/tag/list/forselect',
          rootName: 'tbodyList',
          // datalist: [],
          textName: 'name',
          valueName: 'id',
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.tag')}) }, 'name-special']
        }
      }
    };
  },
  beforeCreate() {},
  created() {
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
    change(val) {
      val = val.map(item => {
        return item;
      });
    },
    close() {
      this.showDialog.isShow = false;
      this.$emit('close');
    },
    save() {
      let form = this.$refs.form;
      if (form.valid()) {
        let newResourceIdList = this.$utils.deepClone(this.resourceIdList);
        if (newResourceIdList.length > 0) {
          newResourceIdList = newResourceIdList.map(item => {
            return item.id;
          });
        }
        let batchData = {
          resourceIdList: newResourceIdList,
          tagList: this.settingConfig.tagList
        };
        let _this = this;
        if (this.operateType == 'tagEdit') {
          if (this.resourceIdList && this.resourceIdList.length > 0) {
            let data = {
              // 主要是编辑某一个标签的时候才需要
              resourceId: this.resourceIdList[0],
              tagList: this.settingConfig.tagList
            };
            this.$api.cmdb.asset.saveSingleTag(data).then(res => {
              if (res.Status == 'OK') {
                _this.$parent.success(this.$t('message.savesuccess'));
              }
            });
          } else {
            // 提示
            this.$Message.warning('请重新选择');
          }
        } else if (this.operateType == 'addTag') {
          this.$api.cmdb.asset.batchAddTag(batchData).then(res => {
            if (res.Status == 'OK') {
              _this.$parent.success('标签添加成功');
            }
          });
        } else if (this.operateType == 'delTag') {
          this.$api.cmdb.asset.batchDelTag(batchData).then(res => {
            if (res.Status == 'OK') {
              _this.$parent.success(this.$t('message.deletesuccess'));
            }
          });
        }
        this.showDialog.isShow = false;
      }
    },    
    refreshTagList() {
      this.$emit('refreshTagList');
    },
    editTag() {
      window.open(HOME + '/cmdb.html#/tag-manage', '_blank');
    }
  },
  computed: {},
  watch: {}
};
</script>
