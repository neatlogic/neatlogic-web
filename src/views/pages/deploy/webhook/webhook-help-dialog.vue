<template>
  <div>
    <TsDialog
      :title="$t('page.help')"
      width="large"
      type="slider"
      :isShow="true"
      :hasFooter="false"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <ul v-for="(item) in dataList" :key="item.uuid" class="mb-nm">
            <li class="mb-sm">{{ item.title }}</li>
            <li v-for="(v, vIndex) in item.detailList" :key="vIndex" class="text-title">
              <div> {{ v.title }}</div>
              <div v-if="v.type == 'img'" class="pt-sm pb-sm">
                <img :src="v.desc" alt="" class="img-box" />
              </div>
              <div v-else class="desc-text-indent">
                {{ v.desc }}
              </div>
            </li>
          </ul>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
      dataList: [
        {
          uuid: this.$utils.setUuid(),
          title: this.$t('term.deploy.functionoverview'),
          detailList: [
            {
              title: '',
              desc: this.$t('term.deploy.functiondesc')
            }
          ]
        },
        {
          uuid: this.$utils.setUuid(),
          title: this.$t('term.deploy.configmode'),
          detailList: [
            {
              title: '1.' + this.$t('term.deploy.triggerconditionfilter'),
              desc: this.$t('term.deploy.triggerconditiondesc')
            },
            {
              title: '2.' + this.$t('term.deploy.externalintegrationmode'),
              desc: this.$t('term.deploy.externalintegrationmodedesc')
            },
            {
              type: 'img',
              title: '',
              desc: require('./img/help1.png')
            },
            {
              type: 'img',
              title: this.$t('term.deploy.integrationconfig'),
              desc: require('./img/help2.png')
            }
          ]
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
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.desc-text-indent {
  text-indent: 1.5em;
}
.img-box {
  display: inline-block;
  width: 100%;
}
</style>
