import { COLLECTIONS, DEFAULT_SETTINGS } from './constants';

// 获取云数据库实例；所有云数据库访问都从这里进入，便于统一降级和错误处理。
export function getDb() {
  if (!wx.cloud || !wx.cloud.database) {
    throw new Error('当前微信版本不支持云开发');
  }

  return wx.cloud.database();
}

// 读取当前用户的食物列表；云端为空或失败时返回安全结构，页面据此展示提示。
export async function getFoods() {
  try {
    const db = getDb();
    const result = await db.collection(COLLECTIONS.FOODS).get();

    return {
      data: result.data || [],
      error: ''
    };
  } catch (error) {
    return {
      data: [],
      error: error.message || '菜单读取失败'
    };
  }
}

// 读取用户设置；没有云端设置时使用默认配置，保证抽签流程有稳定规则。
export async function getSettings() {
  try {
    const db = getDb();
    const result = await db.collection(COLLECTIONS.SETTINGS).limit(1).get();

    return {
      data: result.data[0] || DEFAULT_SETTINGS,
      error: ''
    };
  } catch (error) {
    return {
      data: DEFAULT_SETTINGS,
      error: error.message || '设置读取失败'
    };
  }
}
