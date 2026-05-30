const COS_BASE_URL = 'https://ganfan-sign-1304377482.cos.ap-guangzhou.myqcloud.com';

export const FOOD_IMAGE_URLS = {
  food_huangmenji_lg: `${COS_BASE_URL}/food/food_huangmenji_lg@2x.png`,
  food_huangmenji_sm: `${COS_BASE_URL}/food/food_huangmenji_sm@2x.png`,
  food_zhujiaofan: `${COS_BASE_URL}/food/food_zhujiaofan@2x.png`,
  food_malatang: `${COS_BASE_URL}/food/food_malatang@2x.png`,
  food_niuroufen: `${COS_BASE_URL}/food/food_niuroufen@2x.png`,
  food_shousi: `${COS_BASE_URL}/food/food_shousi@2x.png`,
  food_kaoyu: `${COS_BASE_URL}/food/food_kaoyu@2x.png`,
  food_shaxian: `${COS_BASE_URL}/food/food_shaxian@2x.png`,
  food_chashaofan: `${COS_BASE_URL}/food/food_chashaofan@2x.png`,
  food_danchaofan: `${COS_BASE_URL}/food/food_danchaofan@2x.png`,
  food_galijifan: `${COS_BASE_URL}/food/food_galijifan@2x.png`,
  food_jipaifan: `${COS_BASE_URL}/food/food_jipaifan@2x.png`,
  food_luroufan: `${COS_BASE_URL}/food/food_luroufan@2x.png`,
  food_shaoyafan: `${COS_BASE_URL}/food/food_shaoyafan@2x.png`
};

export const DEFAULT_FOODS = [
  {
    id: 'food_huangmenji',
    name: '黄焖鸡米饭',
    image: FOOD_IMAGE_URLS.food_huangmenji_lg,
    mealType: ['lunch', 'dinner'],
    category: 'kuaican',
    enabled: true
  },
  {
    id: 'food_huangmenji_sm',
    name: '黄焖鸡米饭（小）',
    image: FOOD_IMAGE_URLS.food_huangmenji_sm,
    mealType: ['lunch', 'dinner'],
    category: 'kuaican',
    enabled: true
  },
  {
    id: 'food_zhujiaofan',
    name: '猪脚饭',
    image: FOOD_IMAGE_URLS.food_zhujiaofan,
    mealType: ['lunch', 'dinner'],
    category: 'kuaican',
    enabled: true
  },
  {
    id: 'food_malatang',
    name: '麻辣烫（烤串）',
    image: FOOD_IMAGE_URLS.food_malatang,
    mealType: ['dinner'],
    category: 'other',
    enabled: true
  },
  {
    id: 'food_niuroufen',
    name: '牛肉粉',
    image: FOOD_IMAGE_URLS.food_niuroufen,
    mealType: ['lunch', 'dinner'],
    category: 'fenmian',
    enabled: true
  },
  {
    id: 'food_shousi',
    name: '寿司',
    image: FOOD_IMAGE_URLS.food_shousi,
    mealType: ['lunch', 'dinner'],
    category: 'riliao',
    enabled: true
  },
  {
    id: 'food_kaoyu',
    name: '烤鱼',
    image: FOOD_IMAGE_URLS.food_kaoyu,
    mealType: ['dinner'],
    category: 'other',
    enabled: true
  },
  {
    id: 'food_shaxian',
    name: '沙县小吃',
    image: FOOD_IMAGE_URLS.food_shaxian,
    mealType: ['lunch', 'dinner'],
    category: 'kuaican',
    enabled: true
  },
  {
    id: 'food_chashaofan',
    name: '叉烧饭',
    image: FOOD_IMAGE_URLS.food_chashaofan,
    mealType: ['lunch', 'dinner'],
    category: 'kuaican',
    enabled: true
  },
  {
    id: 'food_danchaofan',
    name: '蛋炒饭',
    image: FOOD_IMAGE_URLS.food_danchaofan,
    mealType: ['lunch', 'dinner'],
    category: 'kuaican',
    enabled: true
  },
  {
    id: 'food_galijifan',
    name: '咖喱鸡饭',
    image: FOOD_IMAGE_URLS.food_galijifan,
    mealType: ['lunch', 'dinner'],
    category: 'kuaican',
    enabled: true
  },
  {
    id: 'food_jipaifan',
    name: '鸡排饭',
    image: FOOD_IMAGE_URLS.food_jipaifan,
    mealType: ['lunch', 'dinner'],
    category: 'kuaican',
    enabled: true
  },
  {
    id: 'food_luroufan',
    name: '卤肉饭',
    image: FOOD_IMAGE_URLS.food_luroufan,
    mealType: ['lunch', 'dinner'],
    category: 'kuaican',
    enabled: true
  },
  {
    id: 'food_shaoyafan',
    name: '烧鸭饭',
    image: FOOD_IMAGE_URLS.food_shaoyafan,
    mealType: ['lunch', 'dinner'],
    category: 'kuaican',
    enabled: true
  }
];
