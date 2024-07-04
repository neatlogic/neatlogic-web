import formlabel from './formlabel-conf.vue';
import formtext from './formtext-conf.vue';
import formtextarea from './formtextarea-conf.vue';
import formckeditor from './formckeditor-conf.vue';
import formnumber from './formnumber-conf.vue';
import formpassword from './formpassword-conf.vue';
import formselect from './formselect-conf.vue';
import formcascader from './formcascader-conf.vue';
import formradio from './formradio-conf.vue';
import formcheckbox from './formcheckbox-conf.vue';
import formtableselector from './formtableselector-conf';
import formtableinputer from './formtableinputer-conf';
import formdate from './formdate-conf.vue';
import formtime from './formtime-conf.vue';
import formlink from './formlink-conf.vue';
import formrate from './formrate-conf.vue';
import formuserselect from './formuserselect-conf.vue';
import formtreeselect from './formtreeselect-conf.vue';
import formaccounts from './formaccounts-conf.vue';
import formupload from './formupload-conf.vue';
import formdivider from './formdivider-conf.vue';
import formcube from './formcube-conf.vue';
import formtab from './formtab-conf';
import formcollapse from './formcollapse-conf.vue';

import * as cmdbComponent from '@/views/pages/cmdb/form/config';
import * as autoexecComponent from '@/views/pages/autoexec/form/config';

import ComponentManager from '@/resources/import/component-manager.js';
export default {
  formlabel,
  formtext,
  formtextarea,
  formckeditor,
  formnumber,
  formpassword,
  formselect,
  formcascader,
  formradio,
  formcheckbox,
  formtableselector,
  formtableinputer,
  formdate,
  formtime,
  formlink,
  formrate,
  formuserselect,
  formtreeselect,
  formaccounts,
  formupload,
  formdivider,
  formcube,
  formtab,
  formcollapse,
  ...cmdbComponent,
  ...autoexecComponent,
  ...ComponentManager.getFormConfigComponent()
};
