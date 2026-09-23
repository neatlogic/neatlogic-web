import ComponentManager from '@/resources/import/component-manager.js';
import {resolveApplicationInspectJobDetail} from './job/job-detail-route.js';

// 应用巡检模块自行声明父作业详情入口，自动化列表只消费解析结果。
ComponentManager.registerComponent('autoexecJobDetailRoute', [resolveApplicationInspectJobDetail]);
