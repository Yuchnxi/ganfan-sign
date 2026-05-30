import { getAcceptedRecords } from '../../utils/cloud-db';
import { formatDate } from '../../utils/date';

const MINE_IMAGE_URLS = {
  profileAvatar: 'https://ganfan-sign-1304377482.cos.ap-guangzhou.myqcloud.com/masco/mascot_rice_holding_bowl@2x.png',
  recordMascot: 'https://ganfan-sign-1304377482.cos.ap-guangzhou.myqcloud.com/masco/mascot_rice_waving@2x.png'
};

function createEmptyDay(date) {
  return {
    date,
    displayDate: date ? date.slice(5) : '',
    lunch: '待记录',
    dinner: '待记录'
  };
}

Page({
  data: {
    imageUrls: MINE_IMAGE_URLS,
    loadingRecords: false,
    recordError: '',
    todaySummary: createEmptyDay(''),
    historyRows: [],
    hasRecords: false
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
          hasRecords: false
        });
        return;
      }

      const records = recordsResult.data || [];
      const rows = this.groupRecordsByDate(records);
      const todaySummary = rows.find((row) => row.date === today) || createEmptyDay(today);
      const historyRows = rows.filter((row) => row.date !== today).slice(0, 3);

      this.setData({
        todaySummary,
        historyRows,
        hasRecords: records.length > 0
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

      if (record.mealType === 'lunch' || record.mealType === 'dinner') {
        rowMap[date][record.mealType] = record.foodName || '未知食物';
      }
    });

    return Object.keys(rowMap)
      .sort((prevDate, nextDate) => nextDate.localeCompare(prevDate))
      .map((date) => rowMap[date]);
  },

  // 查看完整已吃记录。
  onMoreRecordsTap() {
    wx.navigateTo({
      url: '/packageSub/records/records'
    });
  }
});
