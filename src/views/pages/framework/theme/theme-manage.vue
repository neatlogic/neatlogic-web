<template>
  <TsContain>
    <template v-slot:topRight>
      <div class="action-group">
        <div class="action-item tsfont-rotate-right" @click="reset">{{ $t('page.revert') }}</div>
        <div class="action-item tsfont-save" @click="save">{{ $t('page.save') }}</div>
      </div>
    </template>
    <template v-slot:content>
      <Loading :loading-show="!isShow" type="fix"></Loading>
      <div class="bg-op radius-lg">
        <Row>
          <Col span="12">
            <div class="colTitle">{{ $t('page.themelight') }}</div>
            <ThemeTypeList
              v-if="isShow"
              ref="light"
              :list="light"
              :type="'light'"
              class="padding"
            ></ThemeTypeList>
          </Col>
          <Col span="12">
            <div class="colTitle">{{ $t('page.themedark') }}</div>
            <ThemeTypeList
              v-if="isShow"
              ref="dark"
              :list="dark"
              :type="'dark'"
              class="padding"
            ></ThemeTypeList>
          </Col>
        </Row>
      </div>
    </template>
  </TsContain>
</template>
<script>
import { mutations } from './state.js';
import ThemeUtils from './themeUtils.js';
import ThemeTypeList from './components/theme-type-list.vue';
import themeConfig from './components/theme-config.js';

export default {
  name: '',
  components: {
    ThemeTypeList
  },
  props: {},
  data() {
    return {
      isShow: false,
      light: [],
      dark: [],
      temLight: [],
      temDark: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    themeConfig.temLight = this.$utils.deepClone(themeConfig.light);
    themeConfig.temDark = this.$utils.deepClone(themeConfig.dark);
    this.getList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getTheme(config) {
      let json = {
        light: config.light,
        dark: config.dark
      };

      ThemeUtils.configTheme(json);
      ThemeUtils.activeTheme();
    },
    getValueList(baseList, list) {
      baseList.forEach(v => {
        let index = list.findIndex(j => j.param === v.param);
        if (index >= 0) {
          let newConfig = list[index];
          if (newConfig) {
            v.value = newConfig.value;
          }
        }
      });
      return baseList;
    },
    getList() {
      this.$api.framework.theme.getTheme().then(res => {
        if (res.Status == 'OK') {
          this.$nextTick(() => {
            if (res.themeConfig && !this.$utils.isEmptyObj(res.themeConfig)) {
              let config = res.themeConfig;
              let configLight = this.$utils.deepClone(themeConfig.light);
              let configDark = this.$utils.deepClone(themeConfig.dark);
              this.light = this.getValueList(configLight, config.light);
              this.dark = this.getValueList(configDark, config.dark);
              let newConfig = {
                light: this.light,
                dark: this.dark
              };
              this.getTheme(newConfig);
            } else {
              this.dark = this.$utils.deepClone(themeConfig.dark);
              this.light = this.$utils.deepClone(themeConfig.light);
              ThemeUtils.resetTheme();
              mutations.setLogo('');
            }
            this.isShow = true;
          });
        }
      });
    },
    reset() {
      this.preview('reset');
    },
    setProperty(list) {
      list.forEach(v => {
        if (v.type === 'common' && v.value) {
          document.body.style.setProperty(v.param, v.value); // 将变量存储到浏览器的方法里
        }
      });
    },
    delProperty(list) {
      list.forEach(v => {
        if (v.type === 'common') {
          document.body.style.setProperty(v.param, 'initial'); // 将变量存储到浏览器的方法进行清空
        }
      });
    },
    render() {
      if (localStorage.themeClass === 'theme-dark') {
        this.$nextTick(() => {
          this.setProperty(this.dark);
        });
      } else {
        this.$nextTick(() => {
          this.setProperty(this.light);
        });
      }
    },
    resetFile(list) {
      list.forEach(v => {
        if (v.type === 'input' || v.type === 'file') {
          v.value = '';
        }
      });
      return list;
    },
    preview(item) {
      if (item === 'preview') {
        this.render();
      } else {
        this.$api.framework.theme.saveTheme({}).then(res => {
          if (res.Status == 'OK') {
            this.light = this.$utils.deepClone(themeConfig.temLight);
            this.dark = this.$utils.deepClone(themeConfig.temDark);
            let list = this.light;
            if (localStorage.themeClass === 'theme-dark') {
              // 默认主题模式
              list = this.dark;
            }

            this.resetFile(this.light);
            this.resetFile(this.dark);
            themeConfig.light = this.$utils.deepClone(themeConfig.temLight);
            themeConfig.dark = this.$utils.deepClone(themeConfig.temDark);
            this.$forceUpdate();
            this.delProperty(list);
            ThemeUtils.resetTheme();
            mutations.setLogo('');
            this.$Message.success(this.$t('message.executesuccess'));
          }
        });
      }
    },
    setList(list, oldList) {
      let newList = [];
      list.forEach(v => {
        if (v.type === 'file' && !v.value) {
          let config = oldList.find(t => v.param === t.param);
          v.value = config.value;
        }

        newList.push({ value: v.value, param: v.param, type: v.type });
      });
      return newList;
    },
    save() {
      let light = this.$utils.deepClone(this.light);
      let dark = this.$utils.deepClone(this.dark);
      let data = {
        config: {
          light: this.setList(light, themeConfig.temLight),
          dark: this.setList(dark, themeConfig.temDark)
        }
      };
      this.$api.framework.theme.saveTheme(data).then(res => {
        if (res.Status == 'OK') {
          this.getTheme(data.config);
          this.$Message.success(this.$t('message.savesuccess'));
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.noboderLeft {
  border-left: 0px solid #ccc;
}
.colTitle {
  text-align: center;
  height: 50px;
  line-height: 50px;
  font-size: 16px;
}
</style>
