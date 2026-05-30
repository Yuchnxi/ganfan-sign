import { getAcceptedRecords } from '../../utils/cloud-db';
import { formatDate } from '../../utils/date';

const MINE_IMAGE_URLS = {
  profileAvatar: 'https://ganfan-sign-1304377482.cos.ap-guangzhou.myqcloud.com/masco/mascot_rice_holding_bowl@2x.png',
  recordMascot: 'https://ganfan-sign-1304377482.cos.ap-guangzhou.myqcloud.com/masco/mascot_rice_waving@2x.png',
  statsLunch: 'https://ganfan-sign-1304377482.cos.ap-guangzhou.myqcloud.com/foods/food_huangmenji_lg@2x.png',
  statsDinner: 'https://ganfan-sign-1304377482.cos.ap-guangzhou.myqcloud.com/foods/food_malatang@2x.png'
};

const CATEGORY_LABELS = {
  kuaican: '快餐',
  huoguo: '火锅',
  fenmian: '粉面',
  riliao: '日料',
  other: '其他'
};

const EMPTY_WEEKLY_STATS = {
  totalMeals: 0,
  mostFoodName: '待记录',
  mostCategoryLabel: '待记录',
  topLunchName: '待记录',
  topLunchImage: MINE_IMAGE_URLS.statsLunch,
  topDinnerName: '待记录',
  topDinnerImage: MINE_IMAGE_URLS.statsDinner
};

function createEmptyDay(date) {
  return {
    date,
    displayDate: date ? date.slice(5) : '',
    lunch: '待记录',
    dinner: '待记录'
  };
}

function getWeekStartDate() {
  const date = new Date();
  const day = date.getDay() || 7;

  date.setDate(date.getDate() - day + 1);
  return formatDate(date);
}

function getMostFrequent(records, getKey) {
  const countMap = {};
  let bestKey = '';
  let bestCount = 0;

  records.forEach((record) => {
    const key = getKey(record);

    if (!key) {
      return;
    }

    countMap[key] = (countMap[key] || 0) + 1;

    if (countMap[key] > bestCount) {
      bestKey = key;
      bestCount = countMap[key];
    }
  });

  return bestKey;
}

Page({
  data: {
    imageUrls: MINE_IMAGE_URLS,
    loadingRecords: false,
    recordError: '',
    todaySummary: createEmptyDay(''),
    historyRows: [],
    hasRecords: false,
    weeklyStats: EMPTY_WEEKLY_STATS
  },

  onShow() {
    this.loadAcceptedRecords();
  },

  // 加载已采纳的抽签记录，并按日期聚合成我的页摘要卡片。
  async loadAcceptedRecords() {
    this.setData({
      loadingRecords: true,
      recordError: ''
    });

    try {
      const today = formatDate();
      const recordsResult = await getAcceptedRecords();

      if (recordsResult.error) {
        this.setData({
          recordError: recordsResult.error,
          todaySummary: createEmptyDay(today),
          historyRows: [],
          hasRecords: false,
          weeklyStats: EMPTY_WEEKLY_STATS
        });
        return;
      }

      const records = recordsResult.data || [];
      const rows = this.groupRecordsByDate(records);
      const todaySummary = rows.find((row) => row.date === today) || createEmptyDay(today);
      const historyRows = rows.filter((row) => row.date !== today).slice(0, 3);
      const weeklyStats = this.getWeeklyStats(records);

      this.setData({
        todaySummary,
        historyRows,
        hasRecords: records.length > 0,
        weeklyStats
      });
    } finally {
      this.setData({ loadingRecords: false });
    }
  },

  // 同一天内分别保留午餐和晚餐的最新已吃记录，形成两列展示。
  groupRecordsByDate(records) {
    const rowMap = {};

    records.forEach((record) => {
      const date = record.date || '未知日期';

      if (!rowMap[date]) {
        rowMap[date] = createEmptyDay(date);
      }

      if (
        (record.mealType === 'lunch' || record.mealType === 'dinner')
        && rowMap[date][record.mealType] === '待记录'
      ) {
        rowMap[date][record.mealType] = record.foodName || '未知食物';
      }
    });

    return Object.keys(rowMap)
      .sort((prevDate, nextDate) => nextDate.localeCompare(prevDate))
      .map((date) => rowMap[date]);
  },

  // 统计本周已确认吃掉的记录，只统计 accepted: true 的云端数据。
  getWeeklyStats(records) {
    const weekStart = getWeekStartDate();
    const today = formatDate();
    const weeklyRecords = records.filter((record) => (
      record.date >= weekStart && record.date <= today
    ));
    const mostFoodName = getMostFrequent(weeklyRecords, (record) => record.foodName);
    const mostCategory = getMostFrequent(weeklyRecords, (record) => record.category);
    const lunchRecords = weeklyRecords.filter((record) => record.mealType === 'lunch');
    const dinnerRecords = weeklyRecords.filter((record) => record.mealType === 'dinner');
    const topLunchName = getMostFrequent(lunchRecords, (record) => record.foodName);
    const topDinnerName = getMostFrequent(dinnerRecords, (record) => record.foodName);
    const topLunchRecord = lunchRecords.find((record) => record.foodName === topLunchName) || {};
    const topDinnerRecord = dinnerRecords.find((record) => record.foodName === topDinnerName) || {};

    return {
      totalMeals: weeklyRecords.length,
      mostFoodName: mostFoodName || '待记录',
      mostCategoryLabel: CATEGORY_LABELS[mostCategory] || '待记录',
      topLunchName: topLunchName || '待记录',
      topLunchImage: topLunchRecord.foodImage || MINE_IMAGE_URLS.statsLunch,
      topDinnerName: topDinnerName || '待记录',
      topDinnerImage: topDinnerRecord.foodImage || MINE_IMAGE_URLS.statsDinner
    };
  },

  // 查看完整已吃记录。
  onMoreRecordsTap() {
    wx.navigateTo({
      url: '/packageSub/records/records'
    });
  }
});
