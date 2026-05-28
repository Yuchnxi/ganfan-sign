import { COLLECTIONS, DEFAULT_SETTINGS, STORAGE_KEYS } from './constants';
import { DEFAULT_FOODS } from '../data/default-foods';

// 获取云数据库实例；所有云数据库访问都从这里进入，便于统一降级和错误处理。
export function getDb() {
  if (!wx.cloud || !wx.cloud.database) {
    throw new Error('当前微信版本不支持云开发');
  }

  return wx.cloud.database();
}

// 统一生成成功返回结构，页面只需要判断 error 是否为空即可。
function ok(data) {
  return {
    data,
    error: ''
  };
}

// 统一生成失败返回结构，避免页面直接处理异常对象。
function fail(data, error, fallbackMessage) {
  return {
    data,
    error: error.message || fallbackMessage
  };
}

// 读取本地缓存作为云端失败时的降级展示数据。
function getCache(key, fallbackData) {
  try {
    return wx.getStorageSync(key) || fallbackData;
  } catch (error) {
    return fallbackData;
  }
}

// 写入本地缓存；缓存失败不影响云端主流程。
function setCache(key, data) {
  try {
    wx.setStorageSync(key, data);
  } catch (error) {
    console.warn('本地缓存写入失败', error);
  }
}

// 给新增数据补齐基础时间字段，保持集合里的结构稳定。
function withTimestamps(data) {
  const now = Date.now();

  return {
    ...data,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now
  };
}

// 云数据库内部字段不能被写回 update data，保存前统一剥离。
function withoutCloudId(data) {
  const { _id, _openid, ...restData } = data;

  return restData;
}

// 同步默认食物数据：补齐缺失食物，并把旧云存储图片地址迁移到 COS。
async function syncDefaultFoods(foods) {
  const db = getDb();
  const now = Date.now();
  const defaultFoodMap = DEFAULT_FOODS.reduce((map, food) => ({
    ...map,
    [food.id]: food
  }), {});
  const existingFoodIds = foods.map((food) => food.id);
  const foodsToAdd = DEFAULT_FOODS.filter((food) => !existingFoodIds.includes(food.id));
  const foodsToUpdate = foods.filter((food) => {
    const defaultFood = defaultFoodMap[food.id];

    return defaultFood && food.image !== defaultFood.image;
  });
  const addTasks = foodsToAdd.map((food, index) => db.collection(COLLECTIONS.FOODS).add({
    data: {
      ...food,
      createdAt: now + index,
      updatedAt: now + index
    }
  }));
  const updateTasks = foodsToUpdate.map((food) => db.collection(COLLECTIONS.FOODS)
    .where({ id: food.id })
    .update({
      data: {
        image: defaultFoodMap[food.id].image,
        updatedAt: now
      }
    }));

  await Promise.all([...addTasks, ...updateTasks]);

  return [
    ...foods.map((food) => ({
      ...food,
      image: defaultFoodMap[food.id] ? defaultFoodMap[food.id].image : food.image
    })),
    ...foodsToAdd.map((food, index) => ({
      ...food,
      createdAt: now + index,
      updatedAt: now + index
    }))
  ];
}

// 读取当前用户的食物列表；云端为空或失败时返回安全结构，页面据此展示提示。
export async function getFoods() {
  try {
    const db = getDb();
    const result = await db.collection(COLLECTIONS.FOODS)
      .orderBy('createdAt', 'asc')
      .get();
    const foods = result.data || [];

    setCache(STORAGE_KEYS.CACHE_FOODS, foods);
    return ok(foods);
  } catch (error) {
    return fail(getCache(STORAGE_KEYS.CACHE_FOODS, []), error, '菜单读取失败');
  }
}

// 首次使用时初始化默认菜单；已有云端菜单时不重复写入。
export async function ensureDefaultFoods() {
  try {
    const foodsResult = await getFoods();

    if (foodsResult.error) {
      return foodsResult;
    }

    if (foodsResult.data.length > 0) {
      const syncedFoods = await syncDefaultFoods(foodsResult.data);

      setCache(STORAGE_KEYS.CACHE_FOODS, syncedFoods);
      return ok(syncedFoods);
    }

    const now = Date.now();
    const defaultFoods = DEFAULT_FOODS.map((food, index) => ({
      ...food,
      createdAt: now + index,
      updatedAt: now + index
    }));
    const db = getDb();
    const tasks = defaultFoods.map((food) => db.collection(COLLECTIONS.FOODS).add({
      data: food
    }));

    await Promise.all(tasks);
    setCache(STORAGE_KEYS.CACHE_FOODS, defaultFoods);

    return ok(defaultFoods);
  } catch (error) {
    return fail([], error, '默认菜单初始化失败');
  }
}

// 新增一个食物；食物 id 使用业务 id，云数据库仍会自动生成 _id。
export async function addFood(food) {
  try {
    const db = getDb();
    const foodData = withTimestamps({
      ...food,
      id: food.id || `food_${Date.now()}`
    });

    await db.collection(COLLECTIONS.FOODS).add({
      data: foodData
    });

    return ok(foodData);
  } catch (error) {
    return fail(null, error, '食物保存失败');
  }
}

// 更新一个食物；按业务 id 定位，避免页面依赖云数据库内部 _id。
export async function updateFood(foodId, patchData) {
  try {
    const db = getDb();
    const safePatchData = withoutCloudId(patchData);

    await db.collection(COLLECTIONS.FOODS)
      .where({ id: foodId })
      .update({
        data: {
          ...safePatchData,
          updatedAt: Date.now()
        }
      });

    return ok(true);
  } catch (error) {
    return fail(false, error, '食物更新失败');
  }
}

// 删除一个食物；当前阶段直接按业务 id 删除，不额外维护复杂回收状态。
export async function deleteFood(foodId) {
  try {
    const db = getDb();

    await db.collection(COLLECTIONS.FOODS)
      .where({ id: foodId })
      .remove();

    return ok(true);
  } catch (error) {
    return fail(false, error, '食物删除失败');
  }
}

// 读取用户设置；没有云端设置时使用默认配置，保证抽签流程有稳定规则。
export async function getSettings() {
  try {
    const db = getDb();
    const result = await db.collection(COLLECTIONS.SETTINGS).limit(1).get();
    const settings = {
      ...DEFAULT_SETTINGS,
      ...(result.data[0] || {})
    };

    setCache(STORAGE_KEYS.CACHE_SETTINGS, settings);
    return ok(settings);
  } catch (error) {
    return fail(
      getCache(STORAGE_KEYS.CACHE_SETTINGS, DEFAULT_SETTINGS),
      error,
      '设置读取失败'
    );
  }
}

// 首次使用时初始化默认设置；已有设置时保持用户配置不变。
export async function ensureDefaultSettings() {
  try {
    const db = getDb();
    const result = await db.collection(COLLECTIONS.SETTINGS).limit(1).get();

    if (result.data[0]) {
      return ok({
        ...DEFAULT_SETTINGS,
        ...result.data[0]
      });
    }

    const settings = withTimestamps(DEFAULT_SETTINGS);

    await db.collection(COLLECTIONS.SETTINGS).add({
      data: settings
    });
    setCache(STORAGE_KEYS.CACHE_SETTINGS, settings);

    return ok(settings);
  } catch (error) {
    return fail(DEFAULT_SETTINGS, error, '默认设置初始化失败');
  }
}

// 保存用户设置；没有设置记录时新增，有记录时更新第一条。
export async function saveSettings(settings) {
  try {
    const db = getDb();
    const result = await db.collection(COLLECTIONS.SETTINGS).limit(1).get();
    const safeSettings = withoutCloudId(settings);
    const settingsData = {
      ...DEFAULT_SETTINGS,
      ...safeSettings,
      updatedAt: Date.now()
    };

    if (result.data[0] && result.data[0]._id) {
      await db.collection(COLLECTIONS.SETTINGS)
        .doc(result.data[0]._id)
        .update({
          data: settingsData
        });
    } else {
      await db.collection(COLLECTIONS.SETTINGS).add({
        data: withTimestamps(settingsData)
      });
    }

    setCache(STORAGE_KEYS.CACHE_SETTINGS, settingsData);
    return ok(settingsData);
  } catch (error) {
    return fail(DEFAULT_SETTINGS, error, '设置保存失败');
  }
}

// 读取某一天的抽签计数；没有记录时返回 0，供页面判断今日次数。
export async function getDailyDraw(date) {
  try {
    const db = getDb();
    const result = await db.collection(COLLECTIONS.DAILY_DRAWS)
      .where({ date })
      .limit(1)
      .get();

    return ok(result.data[0] || { date, count: 0 });
  } catch (error) {
    return fail({ date, count: 0 }, error, '抽签次数读取失败');
  }
}

// 小程序启动时确保当天计数记录存在，后续抽签再递增 count。
export async function ensureDailyDraw(date) {
  try {
    const db = getDb();
    const result = await db.collection(COLLECTIONS.DAILY_DRAWS)
      .where({ date })
      .limit(1)
      .get();

    if (result.data[0]) {
      return ok(result.data[0]);
    }

    const dailyDraw = withTimestamps({ date, count: 0 });

    await db.collection(COLLECTIONS.DAILY_DRAWS).add({
      data: dailyDraw
    });

    return ok(dailyDraw);
  } catch (error) {
    return fail({ date, count: 0 }, error, '每日抽签次数初始化失败');
  }
}

// 抽签后增加当天计数；如果今天还没有记录，则先创建一条。
export async function increaseDailyDraw(date) {
  try {
    const db = getDb();
    const result = await db.collection(COLLECTIONS.DAILY_DRAWS)
      .where({ date })
      .limit(1)
      .get();

    if (result.data[0] && result.data[0]._id) {
      const nextCount = (result.data[0].count || 0) + 1;

      await db.collection(COLLECTIONS.DAILY_DRAWS)
        .doc(result.data[0]._id)
        .update({
          data: {
            count: nextCount,
            updatedAt: Date.now()
          }
        });

      return ok({
        ...result.data[0],
        count: nextCount,
        updatedAt: Date.now()
      });
    }

    const dailyDraw = withTimestamps({ date, count: 1 });

    await db.collection(COLLECTIONS.DAILY_DRAWS).add({
      data: dailyDraw
    });

    return ok(dailyDraw);
  } catch (error) {
    return fail({ date, count: 0 }, error, '抽签次数更新失败');
  }
}

// 创建抽签记录；默认 accepted 为 false，只有用户确认后再更新。
export async function addDrawRecord(record) {
  try {
    const db = getDb();
    const recordData = {
      ...record,
      id: record.id || `record_${Date.now()}`,
      accepted: record.accepted || false,
      createdAt: record.createdAt || Date.now()
    };

    await db.collection(COLLECTIONS.RECORDS).add({
      data: recordData
    });

    return ok(recordData);
  } catch (error) {
    return fail(null, error, '抽签记录保存失败');
  }
}

// 用户点击“就吃这个”后，将对应抽签记录标记为已采纳。
export async function acceptDrawRecord(recordId) {
  try {
    const db = getDb();

    await db.collection(COLLECTIONS.RECORDS)
      .where({ id: recordId })
      .update({
        data: {
          accepted: true,
          acceptedAt: Date.now()
        }
      });

    return ok(true);
  } catch (error) {
    return fail(false, error, '抽签记录确认失败');
  }
}

// 读取已采纳记录；统计和最近 N 天排除只使用 accepted: true 的数据。
export async function getAcceptedRecords(startDate, endDate) {
  try {
    const db = getDb();
    const command = db.command;
    const query = {
      accepted: true
    };

    if (startDate && endDate) {
      query.date = command.gte(startDate).and(command.lte(endDate));
    } else if (startDate) {
      query.date = command.gte(startDate);
    } else if (endDate) {
      query.date = command.lte(endDate);
    }

    const result = await db.collection(COLLECTIONS.RECORDS)
      .where(query)
      .orderBy('createdAt', 'desc')
      .get();

    return ok(result.data || []);
  } catch (error) {
    return fail([], error, '已吃记录读取失败');
  }
}
