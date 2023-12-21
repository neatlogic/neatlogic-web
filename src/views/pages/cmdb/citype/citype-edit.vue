<template>
  <div>
    <TsDialog v-if="ciTypeData" v-bind="ciTypeDialogConfig" @on-close="close">
      <template v-slot>
        <TsForm ref="ciTypeForm" :item-list="ciTypeFormConfig">
          <template v-slot:isMenu>
            <div>
              <i-switch v-model="ciTypeData.isMenu" :true-value="1" :false-value="0"></i-switch>
              <!-- <span class="actionText" v-html="ciTypeData.isMenu == 1 ? '是' : '否'"></span> -->
              <div class="text-grey">
                {{ $t('message.cmdb.keytype') }}
              </div>
            </div>
          </template>
          <template v-slot:isShowInTopo>
            <div>
              <i-switch v-model="ciTypeData.isShowInTopo" :true-value="1" :false-value="0"></i-switch>
              <div class="text-grey">
                {{ $t('message.cmdb.topotype') }}
              </div>
            </div>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="saveCiType()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';

export default {
  name: '',
  components: {
    TsForm
  },
  props: {
    id: {type: Number},
    isShow: {type: Boolean}
  },
  data() {
    const _this = this;
    return {
      ciTypeDialogConfig: {
        title: this.id ? this.$t('dialog.title.edittarget', {target: this.$t('page.hierarchy')}) : this.$t('dialog.title.addtarget', {target: this.$t('page.hierarchy')}),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      ciTypeData: {},
      ciTypeFormConfig: [
        {
          name: 'id',
          type: 'text',
          isHidden: true
        },
        {
          name: 'name',
          type: 'text',
          label: this.$t('page.name'),
          maxlength: 30,
          validateList: ['required'],
          width: '100%',
          onChange: function(name) {
            _this.ciTypeData.name = name;
          }
        },
        {
          name: 'isMenu',
          type: 'slot',
          label: this.$t('term.cmdb.keytype')
        },
        {
          name: 'isShowInTopo',
          type: 'slot',
          label: this.$t('term.cmdb.isshowintopo')
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getCiTypeById: function() {
      if (this.id) {
        this.$api.cmdb.citype.getCiTypeById(id).then(res => {
          if (res.Status == 'OK') {
            this.ciTypeData = res.Return;
            this.ciTypeFormConfig.forEach(element => {
              element.value = this.ciTypeData[element.name];
            });
          }
        });
      } else {
        this.ciTypeData = {};
        this.ciTypeFormConfig.forEach(element => {
          element.value = this.ciTypeData[element.name];
        });
      }
    },
    saveCiType: function() {
      const form = this.$refs['ciTypeForm'];
      if (form.valid()) {
        this.$api.cmdb.citype.saveCiType(this.ciTypeData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {
    isShow: {
      handler: function(val) {
        if (val) {
          this.getCiTypeById();
        }
      }
    }
  }
};
</script>
<style lang="less"></style>
