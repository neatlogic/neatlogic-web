<template>
  <header class="topnav help-topbar">
    <div class="topnav-left-container help-brand">
      <a
        v-if="getNavigationLogo"
        :href="`${home}/${defaultModuleId}.html`"
        :aria-label="$t('page.homepage')"
        class="homeLink"
        @click.prevent="toHomePage"
      >
        <img class="topnav-newlogo" :src="getNavigationLogo" alt="" />
      </a>
      <router-link :to="{name: 'documentonline'}" class="help-title">
        {{ $t('term.documentonline.helpcenter') }}
      </router-link>
    </div>
    <InputSearcher
      v-if="$route.name !== 'documentonline'"
      v-model="keyword"
      class="help-search"
      :placeholder="$t('term.documentonline.searchhelp')"
      @change="searchDocument"
    />
    <div v-if="!$store.state.isPwdRedirected" class="topnav-right-container help-actions">
      <template v-if="$AuthUtils.hasRole('DOCUMENTONLINE_CONFIG_MODIFY')">
        <button
          type="button"
          class="help-upload"
          :title="$t('term.documentonline.uploaddocument')"
          :aria-label="$t('term.documentonline.uploaddocument')"
          @click="$refs.uploadDialog.showDialog()"
        >
          <span class="tsfont-upload" aria-hidden="true"></span>
          <span class="help-upload-label">{{ $t('term.documentonline.uploaddocument') }}</span>
        </button>
        <UploadDialog
          ref="uploadDialog"
          :title="$t('term.documentonline.uploaddocument')"
          :actionUrl="importJarUrl"
          :formatList="['jar']"
          @on-success="handleUploadResult"
          @on-close="refreshDocuments"
        />
      </template>
      <TopnavUser class="help-user" />
    </div>
  </header>
</template>

<script>
import NavigationLogoMixin from '@/views/components/topnav/navigation-logo-mixin.js';
import UploadDialog from '@/resources/components/UploadDialog/UploadDialog.vue';

export default {
  inject: ['reloadRouter'],
  components: {
    TopnavUser: () => import('@/views/components/topnav/topnav-user.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    UploadDialog
  },
  mixins: [NavigationLogoMixin],
  data() {
    return {
      home: HOME,
      keyword: '',
      importJarUrl: BASEURLPREFIX + '/api/binary/documentonline/jar/import',
      hasUploadedDocuments: false
    };
  },
  methods: {
    handleUploadResult(response) {
      if (response.Status === 'OK') {
        this.hasUploadedDocuments = true;
      }
    },
    refreshDocuments() {
      if (this.hasUploadedDocuments) {
        this.hasUploadedDocuments = false;
        this.reloadRouter();
      }
    },
    toHomePage() {
      if (MODULEID === this.defaultModuleId) {
        this.$router.push('/');
      } else {
        this.$utils.gotoHref(this.home + '/' + this.defaultModuleId + '.html');
      }
    },
    searchDocument(value) {
      const searchKeyword = (value || '').trim();
      if (searchKeyword) {
        this.$router.push({name: 'documentonline-search', query: {searchKeyword}});
      } else {
        this.$router.push({name: 'documentonline'});
      }
    }
  },
  computed: {
    defaultModuleId() {
      return this.$store.getters.defaultModule.moduleId;
    }
  },
  watch: {
    '$route.query.searchKeyword': {
      immediate: true,
      handler(value) {
        this.keyword = value || '';
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';

.help-topbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(160px, min(36vw, 400px)) minmax(0, 1fr);
  gap: 16px;
}
.help-brand {
  min-width: 0;
  .homeLink {
    flex-shrink: 1;
    min-width: 0;
  }
  .topnav-newlogo {
    max-width: 100%;
    object-fit: contain;
  }
}
.help-title,
.help-upload {
  flex: 0 0 auto;
  color: inherit;
  padding: 7px 8px;
  border-radius: 6px;
  white-space: nowrap;
  &:hover,
  &:focus-visible {
    color: inherit;
    background: var(--top-active, @default-top-active);
  }
}
.help-title {
  font-size: 15px;
  font-weight: 600;
}
.help-upload {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: none;
  font: inherit;
  cursor: pointer;
}
.help-search {
  min-width: 0;
  ::v-deep .ivu-input {
    height: 32px;
    &::placeholder {
      color: var(--help-muted) !important;
      opacity: 1;
    }
  }
  ::v-deep .ivu-input-prefix {
    display: grid;
    place-items: center;
    i {
      line-height: 1;
    }
  }
}
.help-actions {
  grid-column: 3;
  justify-self: end;
  gap: 8px;
}
@media (max-width: 960px) {
  .help-brand .homeLink {
    width: 126px;
  }
}
@media (max-width: 760px) {
  .help-topbar {
    display: flex;
    gap: 6px;
    padding-left: 8px;
  }
  .help-brand {
    flex: 0 1 auto;
  }
  .help-brand .homeLink {
    width: 82px;
  }
  .help-search {
    flex: 1 1 126px;
  }
  .help-actions {
    margin-left: auto;
    gap: 0;
  }
}
@media (max-width: 480px) {
  .help-topbar:has(.help-search) {
    .homeLink,
    .help-upload-label {
      display: none;
    }
  }
}
</style>
