import { getAcceptedRecords } from '../../utils/cloud-db';

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
    loading: false,
    error: '',
    recordRows: []
  },

  onLoad() {
    this.loadRecords();
  },

  // 读取所有已采纳记录，并按日期汇总成午餐 / 晚餐两列。
  async loadRecords() {
    this.setData({
      loading: true,
      error: ''
    });

    try {
      const recordsResult = await getAcceptedRecords();

      if (recordsResult.error) {
        this.setData({
          error: recordsResult.error,
          recordRows: []
        });
        return;
      }

      this.setData({
        recordRows: this.groupRecordsByDate(recordsResult.data || [])
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 同一天只展示每个餐次最新一次确认吃掉的食物。
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
  }
});
