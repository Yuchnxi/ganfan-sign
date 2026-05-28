import { CLOUD_ENV_ID } from './utils/constants';
import { ensureDailyDraw, ensureDefaultFoods, ensureDefaultSettings } from './utils/cloud-db';
import { formatDate } from './utils/date';
import { TANGYUAN_FONT_FAMILY, TANGYUAN_FONT_SOURCE } from './utils/tangyuan-font-source';

App({
  globalData: {
    cloudReady: false,
    cloudInitError: '',
    atmosphereFontReady: false
  },

  // 小程序启动时初始化云开发；环境 ID 未配置时使用开发者工具当前默认环境。
  onLaunch() {
    this.initCloud();
    this.initCloudData();
    this.loadAtmosphereFont();
  },

  // 初始化微信云开发能力，后续云数据库读写统一走 utils/cloud-db.js。
  initCloud() {
    if (!wx.cloud) {
      wx.showToast({
        title: '请使用新版微信打开',
        icon: 'none'
      });
      return;
    }

    const cloudConfig = {
      traceUser: true
    };

    if (CLOUD_ENV_ID) {
      cloudConfig.env = CLOUD_ENV_ID;
    }

    wx.cloud.init(cloudConfig);
    this.globalData.cloudReady = true;
  },

  // 初始化首版必要云数据：默认菜单、默认设置和当天抽签计数。
  async initCloudData() {
    if (!this.globalData.cloudReady) {
      return;
    }

    const today = formatDate();
    const results = await Promise.all([
      ensureDefaultFoods(),
      ensureDefaultSettings(),
      ensureDailyDraw(today)
    ]);
    const failedResult = results.find((result) => result.error);

    if (failedResult) {
      this.globalData.cloudInitError = failedResult.error;
      wx.showToast({
        title: failedResult.error,
        icon: 'none'
      });
    }
  },

  // 加载氛围字体，仅用于标题、按钮和抽签结果等少量装饰文字。
  loadAtmosphereFont() {
    wx.loadFontFace({
      family: TANGYUAN_FONT_FAMILY,
      source: TANGYUAN_FONT_SOURCE,
      success: () => {
        this.globalData.atmosphereFontReady = true;
      },
      fail: (error) => {
        console.warn('氛围字体加载失败，已回退到系统字体', error);
      }
    });
  }
});
