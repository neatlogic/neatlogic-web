<template>
  <TsDialog
    type="modal"
    :isShow="true"
    :title="$t('page.teamtagtypemanage')"
    width="70%"
    @on-close="onClose()"
  >
    <TsContain>
      <template slot="topRight">
        
      </template>
      <div slot="content" class="dividing-color">
        
      </div>
    </TsContain>
    
    <template v-slot:footer>
      <div class="drawer-footer ">
        <Button style="margin-left: 8px" @click="onOk(false)">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="onOk(true)">{{ $t('page.save') }}</Button>
      </div>
    </template>
  </TsDialog>

</template>

<script>
export default {
  name: '',
  provide() {
    return { $parent: this };
  },
  components: {

  },
  props: {
  
  },
  data() {
    return {
      
    };
  },
  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {

  },

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    
    onClose() {
      this.$emit('close');
    }
  },

  filter: {},

  computed: {
  },

  watch: {}
};
</script>
<style lang="less" scoped>

</style>

