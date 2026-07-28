import { expect } from 'chai';
import {
  clampPercent,
  getToneBackgroundClass,
  getToneColor,
  getToneTextClass
} from '@/views/components/portal/components/display/display-utils.js';

describe('workbench display utilities', () => {
  it('clamps percentages for empty, negative and over-target statistics', () => {
    expect(clampPercent(undefined)).to.equal(0);
    expect(clampPercent(-20)).to.equal(0);
    expect(clampPercent(64)).to.equal(64);
    expect(clampPercent(128)).to.equal(100);
  });

  it('maps all supported statistic tones to project theme values', () => {
    expect(getToneTextClass('info')).to.equal('text-info');
    expect(getToneBackgroundClass('warning')).to.equal('bg-warning-grey');
    expect(getToneColor('danger')).to.include('--error-color');
    expect(getToneColor('unknown')).to.include('--primary-color');
  });
});
