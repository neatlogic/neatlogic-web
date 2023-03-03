<template>
  <div>
    <TsDialog
      v-if="ciData"
      v-bind="ciDialogConfig"
      @on-close="close"
    >
      <template v-slot:header>
        <div v-if="ciData.id">编辑模型</div>
        <div v-if="!ciData.id">添加模型</div>
      </template>
      <template v-slot>
        <TsForm ref="ciForm" :item-list="ciFormConfig">
          <template v-slot:file>
            <div>
              <TsUpLoad
                styleType="button"
                dataType="ci"
                className="smallUpload"
                type="drag"
                :multiple="false"
                :defaultList="fileList"
                :format="['xml']"
                @remove="setFile"
                @getFileList="setFile"
              ></TsUpLoad>
              <div class="text-tip tips desc-text-mt"> 配置文件为XML文件，通过SQL语句抽取系统内部任意数据表的数据生成配置项模型，虚拟模型中的数据不能修改和删除，但可以被其他模型关联或直接查询。
                <Poptip
                  trigger="hover"
                  placement="right"
                  width="450"
                  :transfer="true"
                >
                  <a href="javascript:void(0)">查看范例</a>
                  <div slot="content" class="api">
                    <pre>
&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;ci&gt;
   &lt;!--模型属性定义，需要SQL语句返回对应列--&gt;
  &lt;attrs&gt;
    &lt;attr name="user_id" label="用户id"/&gt;
    &lt;attr name="user_name" label="用户名"/&gt;
    &lt;attr name="teamName" label="分组"/&gt;
  &lt;/attrs&gt;
  &lt;sql&gt;
    SELECT
    &lt;!--必须包含id字段，作为配置项主键--&gt;
    `u`.`id` AS id,
    &lt;!--必须包含uuid字段，数据类型是char(32)，作为配置项全局主键--&gt;
    md5(`u`.`id`) AS uuid,
    &lt;!--必须包含name字段，作为配置项名称--&gt;
    `u`.`user_name` AS name,
    &lt;!--属性列需要在上面attrs中定义才生效--&gt;
    `u`.`user_id` as user_id,
    `u`.`user_name` as user_name,
    group_concat( `t`.`name`) AS teamName
    FROM
    `user` `u`
    LEFT JOIN `user_team` `ut` 
    ON `u`.`uuid` = `ut`.`user_uuid`
    LEFT JOIN `team` `t` 
    ON `t`.`uuid` = `ut`.`team_uuid`
    GROUP BY u.uuid
  &lt;/sql&gt;
&lt;/ci&gt;
                    </pre>
                  </div>
                </Poptip>
              </div>
              <div v-if="showFileError" class="form-error-tip">请上传配置文件</div>
            </div>
          </template>
          <template v-slot:icon>
            <div class="logo bg-block border-color text-primary radius-sm" @click="isIconDialogShow = true">
              <i class="logo-icon" :class="currentIcon"></i>
            </div>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button type="primary" @click="saveCi()">确定</Button>
      </template>
    </TsDialog>
    <IconDialog
      v-if="isIconDialogShow"
      :currentIcon="currentIcon"
      @cancel="(isIconDialogShow = false), (ciData.icon = 'tsfont-ci-o')"
      @confirm="selectIcon"
    ></IconDialog>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';
import menuMinix from '../mixins/index';
export default {
  name: '',
  components: {
    TsForm,
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve),
    IconDialog: resolve => require(['../common/icon-dialog.vue'], resolve)
  },
  mixins: [menuMinix],
  props: {
    id: {
      type: Number
    },
    ciTypeId: {
      type: Number
    }
  },
  data() {
    const _this = this;
    return {
      needCheckParentCi: false,
      selectedFiles: null,
      showFileError: false,
      currentIcon: 'tsfont-ci',
      isIconDialogShow: false,
      iconList: [],
      ciDialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      ciData: { icon: 'tsfont-ci' },
      ciFormConfig: [
        {
          name: 'icon',
          type: 'slot',
          label: '模型图标'
        },
        {
          name: 'id',
          type: 'text',
          isHidden: true
        },
        {
          name: 'typeId',
          type: 'select',
          label: '类型',
          width: '100%',
          maxlength: 50,
          url: '/api/rest/cmdb/ci/citype/search',
          validateList: ['required'],
          valueName: 'id',
          textName: 'name',
          onChange: (name) => {
            this.$set(_this.ciData, 'typeId', name);
          }
        },
        {
          name: 'name',
          type: 'text',
          label: '唯一标识',
          width: '100%',
          desc: '保存后不能修改',
          maxlength: 25,
          validateList: ['required', 'key-special'],
          onChange: (name) => {
            this.$set(_this.ciData, 'name', name);
          }
        },
        {
          name: 'label',
          type: 'text',
          width: '100%',
          label: '名称',
          maxlength: 50,
          validateList: ['required'],
          onChange: (name) => {
            this.$set(_this.ciData, 'label', name);
          }
        },
        {
          name: 'isVirtual',
          type: 'switch',
          label: '虚拟模型',
          value: 0,
          onChange: function(name) {
            _this.$set(_this.ciData, 'isVirtual', name);
          }
        },
        {
          _belong: 'virtualci',
          name: 'file',
          type: 'slot',
          label: '配置文件'
        },
        {
          name: 'parentCiId',
          _belong: 'realci',
          type: 'tree',
          label: '继承',
          width: '100%',
          url: 'api/rest/cmdb/ci/listtree',
          params: { ciId: _this.id },
          valueName: 'id',
          textName: 'label',
          transfer: true,
          showPath: true,
          onChange: (name) => {
            if (name) {
              this.$set(_this.ciData, 'parentCiId', name);
            } else {
              this.$set(_this.ciData, 'parentCiId', null);
            }
          }
        },
        {
          _belong: 'realci',
          name: 'isAbstract',
          type: 'switch',
          label: '抽象模型',
          desc: '抽象模型可以被继承，但不能添加配置项',
          value: 0,
          onChange: function(name) {
            _this.$set(_this.ciData, 'isAbstract', name);
          }
        },
        {
          name: 'isMenu',
          type: 'switch',
          label: '关键模型',
          desc: '关键模型会显示在最左侧菜单中',
          value: 0,
          onChange: function(name) {
            _this.$set(_this.ciData, 'isMenu', name);
          }
        },
        {
          name: 'expiredDay',
          type: 'number',
          label: '有效日期',
          suffix: '天',
          min: 0,
          desc: '单位是天，有效日期为零代表永不过期',
          onChange: function(name) {
            _this.$set(_this.ciData, 'expiredDay', name);
          }
        },
        {
          name: 'description',
          type: 'textarea',
          label: '描述',
          width: '100%',
          onChange: function(name) {
            _this.$set(_this.ciData, 'description', name);
          }
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getCiById();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setFile: function(fileList) {
      this.ciData.fileId = null;
      fileList.forEach(file => {
        this.ciData.fileId = file.id;
      });
    },
    saveCi: function() {
      const form = this.$refs['ciForm'];
      if (form.valid()) {
        if (this.ciData.isVirtual == 1 && !this.ciData.fileId) {
          this.showFileError = true;
          return false;
        }
        if (this.needCheckParentCi && !this.ciData.parentCiId) {
          this.$createDialog({
            title: '警告',
            content: '清空继承关系后，系统会删除所有父模型中属于当前模型的配置项数据，是否确认继续？',
            btnType: 'error',
            'on-ok': vnode => {
              vnode.isShow = false;
              this.doSave();
            }
          });
        } else {
          this.doSave();
        }
      }
    },
    doSave() {
      this.$api.cmdb.ci.saveCi(this.ciData).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.content.savesuccess'));
          if (!this.id && res.Return) {
            //如果是新增模型，则自动跳转到模型编辑页面
            this.close('redirect', res.Return);
          } else {
            this.close('refresh');
          }
          this.$parent.searchCiTypeCi(); //修改模板后刷新列表数据
          this.$store.dispatch('updateCmdbMenu', {forceUpdate: true});
        }
      });
    },
    selectIcon: function(icon) {
      this.currentIcon = icon;
      this.isIconDialogShow = false; 
      this.$nextTick(() => {
        this.$set(this.ciData, 'icon', icon);
      });
    },
    getCiById: function() {
      if (this.id) {
        this.$api.cmdb.ci.getCiById(this.id).then(res => {
          if (res.Status == 'OK') {
            this.ciData = res.Return;
            if (this.ciData.parentCiId) {
              this.needCheckParentCi = true;
            }
            this.currentIcon = this.ciData.icon;
            this.ciFormConfig.forEach(element => {
              element.value = this.ciData[element.name];
              //不允许修改唯一标识
              if (element.name == 'name') {
                element.disabled = true;
              } else if (element.name == 'isVirtual' || element.name == 'file') {
                //不允许再次上传配置文件和修改是否虚拟模型
                element.isHidden = true;
              }
            });
          }
        });
      } else {
        this.ciData = { icon: 'tsfont-ci' };
        this.ciData.typeId = this.ciTypeId;
        this.currentIcon = 'tsfont-ci';
        this.ciFormConfig.forEach(element => {
          element.value = this.ciData[element.name];
          //添加时允许修改唯一标识
          if (element.name == 'name') {
            element.disabled = false;
          }
        });
      }
    },
    close: function(needRedirect, newCiId) {
      this.$emit('close', needRedirect, newCiId);
    }
  },
  filter: {},
  computed: {
    fileList: function() {
      if (this.ciData && this.ciData.fileId) {
        return [{id: this.ciData.fileId, name: '配置文件.xml'}];
      } else {
        return [];
      }
    }
  },
  watch: {
    ciData: {
      handler: function(newVal) {
        for (let k in this.ciFormConfig) {
          if (this.ciFormConfig[k]._belong === 'realci') {
            this.$set(this.ciFormConfig[k], 'isHidden', this.ciData.isVirtual === 1);
          } else if (this.ciFormConfig[k]._belong === 'virtualci') {
            this.$set(this.ciFormConfig[k], 'isHidden', this.ciData.isVirtual !== 1);
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/my-theme.less';

.content {
  height: 100%;
  .left {
    padding: @space-sm;
    height: 100%;
    position: relative;
    width: 250px;
    float: left;
    border-right: 1px solid;
    overflow: auto;
  }
  .right {
    position: relative;
    height: 100%;
    width: calc(100% - 250px);
    float: left;
    overflow: auto;
    .right_content {
      height: 100%;
      width: 80%;
      margin: 0 auto;
      padding: @space-md 0;
    }
  }
}
.logo {
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: inline-block;
  position: relative;
  border: 1px solid;
  top: -5px;
  text-align: center;
  line-height: 40px;
  .logo-icon {
    font-size: 20px;
    // position: absolute;
    // top: 4px;
    // left: 10px;
  }
  &::after {
    content: '更换';
    left: 44px;
    width: 40px;
    position: absolute;
    top: 2px;
  }
}

.actived {
  color: @primary-color;
}
</style>
