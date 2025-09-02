<template>
  <div>
    <TsContain>
      <template v-slot:topLeft><h3 v-if="extraMenuData" class="text-grey">{{ extraMenuData.name }}</h3></template>
      <template v-slot:content>
        <iframe
          v-if="extraMenuData"
          frameborder="0"
          :src="extraMenuData.url"
          style="width: 100%; height: calc(100vh - 125px)"
          scrolling="auto"
          allowfullscreen
          allow="geolocation; microphone; camera; clipboard-read; clipboard-write; autoplay; encrypted-media; fullscreen"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
        ></iframe>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
      id: null,
      extraMenuData: null
    };
  },
  beforeCreate() {},
  created() {
    this.id = this.$route.query.id;
    this.getExtraMenuById();
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
    getExtraMenuById() {
      if (this.id) {
        this.$api.framework.extramenu.getMenuById(this.id).then(res => {
          this.extraMenuData = res.Return;
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
