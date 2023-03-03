import { default as formlabel } from './define/formlabel.json';
import { default as formtext } from './define/formtext.json';
import { default as formtextarea } from './define/formtextarea.json';
import { default as formckeditor } from './define/formckeditor.json';
import { default as formnumber } from './define/formnumber.json';
import { default as formpassword } from './define/formpassword.json';
import { default as formselect } from './define/formselect.json';
import { default as formcascader } from './define/formcascader.json';
import { default as formradio } from './define/formradio.json';
import { default as formcheckbox } from './define/formcheckbox.json';
import { default as formtableselector } from './define/formtableselector.json';
import { default as formtableinputer } from './define/formtableinputer.json';
import { default as formdate } from './define/formdate.json';
import { default as formtime } from './define/formtime.json';
import { default as formlink } from './define/formlink.json';
import { default as formrate } from './define/formrate.json';
import { default as formuserselect } from './define/formuserselect.json';
import { default as formtreeselect } from './define/formtreeselect.json';
import { default as formaccounts } from './define/formaccounts.json';
import { default as formupload } from './define/formupload.json';
import { default as formdivider } from './define/formdivider.json';
import { default as formcube } from './define/formcube.json';
import { default as formtab } from './define/formtab.json';
import { default as formcollapse } from './define/formcollapse.json';
import { default as CMDBITEMS } from '@/views/pages/cmdb/form/define';
import { default as AUTOEXECITEMS } from '@/views/pages/autoexec/form/define';

export const FORMITEM_CATEGORY = [
  { value: 'basic', text: '基础组件' },
  { value: 'layout', text: '布局组件' },
  { value: 'autoexec', text: '自动化组件' },
  { value: 'cmdb', text: '配置管理组件' }
];

export const FORMITEMS = [formlabel,
  formtext,
  formtextarea,
  formckeditor,
  formnumber,
  formpassword,
  formselect,
  formcascader, 
  formradio, 
  formcheckbox, 
  formcube, 
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
  formtab, 
  formcollapse, 
  ...CMDBITEMS,
  ...AUTOEXECITEMS
];
