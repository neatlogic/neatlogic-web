<template>
  <TsDialog v-bind="dialogData" @on-ok="save()" @on-close="close()">
    <template v-slot>
      <div>
        <TsForm ref="form" v-model="templateData" :item-list="formConfig">
          <template v-slot:relList>
            <Poptip
              trigger="hover"
              placement="bottom-start"
              width="800"
              :transfer="true"
            >
              <div>
                <a v-if="templateData.config && templateData.config.ciRelList && templateData.config.ciRelList.length > 0">
                  {{ $t('term.cmdb.selectagain') }}
                </a>
                <a v-else>{{ $t('term.cmdb.selectrelpath') }}</a>
              </div>
              <div slot="content">
                <CiRelTree :ciId="ciId" :relList="templateData.relPath" @select="selectNode"></CiRelTree>
              </div>
            </Poptip>
            <div v-if="templateData.config && templateData.config.ciRelList && templateData.config.ciRelList.length > 0">
              <div class="mb-xs text-grey">
                <span>{{ $t('page.help') }}{{ $t('page.colon') }}{{ $t('message.cmdb.editrelpath') }}</span>
              </div>
              <div>
                <span v-for="(p, pindex) in templateData.config.ciRelList" :key="pindex">
                  <span v-if="pindex === 0">
                    <Tag color="success">{{ p.ciLabel }}({{ p.ciName }})</Tag>
                  </span>
                  <span v-if="p.direction === 'from'" class="text-grey fz10 tsfont-minus"></span>
                  <span v-else-if="p.direction === 'to'" class="text-grey fz10 tsfont-arrow-left"></span>
                  <span class="text-grey fz10">
                    {{ p.relLabel }}
                  </span>
                  <span v-if="p.direction === 'from'" class="text-grey fz10 tsfont-arrow-right"></span>
                  <span v-else-if="p.direction === 'to'" class="text-grey fz10 tsfont-minus"></span>
                  <span>
                    <Tag v-if="pindex === templateData.config.ciRelList.length - 1" color="success">{{ p.targetCiLabel }}({{ p.targetCiName }})</Tag>
                    <Tag
                      v-else
                      class="cursor"
                      :color="!p.isHidden ? 'primary' : 'default'"
                      @click.native="$set(p, 'isHidden', p.isHidden ? 0 : 1)"
                    >
                      <span :class="!p.isHidden ? 'tsfont-eye' : 'tsfont-eye-off'">{{ p.targetCiLabel }}({{ p.targetCiName }})</span>
                    </Tag>
                  </span>
                </span>
              </div>
            </div>
          </template>
        </TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    CiRelTree: () => import('@/views/pages/cmdb/components/ci/ci-rel-list-tree.vue')
  },
  props: {
    id: { type: Number },
    ciId: { type: Number }
  },
  data() {
    return {
      ciRelList: [],
      templateData: {
        ciId: this.ciId,
        isActive: 1,
        isDefault: 0,
        config: {}
      },
      dialogData: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      formConfig: [
        {
          name: 'name',
          label: this.$t('page.name'),
          type: 'text',
          validateList: ['required'],
          maxLength: 50
        },
        {
          name: 'isActive',
          type: 'switch',
          label: this.$t('term.report.isactive'),
          trueValue: 1,
          falseValue: 0
        },
        {
          name: 'isDefault',
          type: 'switch',
          label: this.$t('page.isdefault'),
          trueValue: 1,
          falseValue: 0
        },
        {
          name: 'relList',
          type: 'slot',
          label: this.$t('term.diagram.relpath')
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getTemplateById();
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
    getTemplateById() {
      if (this.id) {
        this.$api.cmdb.ci.getCiTopoTemplateById(this.id, { needRelPath: 1 }).then(res => {
          this.templateData = res.Return;
        });
      }
    },
    selectNode(nodes) {
      if (!this.templateData.config) {
        this.$set(this.templateData, 'config', {});
      }
      if (nodes.length > 0) {
        this.$set(this.templateData.config, 'ciRelList', this.$utils.deepClone(nodes[0].path));
      } else {
        this.$delete(this.templateData, 'config');
      }
    },
    save() {
      const form = this.$refs['form'];
      if (form && form.valid()) {
        //console.log(JSON.stringify(this.templateData, null, 2));
        this.$api.cmdb.ci.saveTopoTemplate(this.templateData).then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
