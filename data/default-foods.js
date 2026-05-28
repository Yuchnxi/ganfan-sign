export const FOOD_IMAGE_FILE_IDS = {
  food_huangmenji: 'cloud://cloud1-d7gw6xoc27e2a3d20.636c-cloud1-d7gw6xoc27e2a3d20-1304070199/foods/food_huangmenji_lg@2x.png',
  food_kaoyu: 'cloud://cloud1-d7gw6xoc27e2a3d20.636c-cloud1-d7gw6xoc27e2a3d20-1304070199/foods/food_kaoyu@2x.png',
  food_malatang: 'cloud://cloud1-d7gw6xoc27e2a3d20.636c-cloud1-d7gw6xoc27e2a3d20-1304070199/foods/food_malatang@2x.png',
  food_niuroufen: 'cloud://cloud1-d7gw6xoc27e2a3d20.636c-cloud1-d7gw6xoc27e2a3d20-1304070199/foods/food_niuroufen@2x.png',
  food_shaxian: 'cloud://cloud1-d7gw6xoc27e2a3d20.636c-cloud1-d7gw6xoc27e2a3d20-1304070199/foods/food_shaxian@2x.png',
  food_shousi: 'cloud://cloud1-d7gw6xoc27e2a3d20.636c-cloud1-d7gw6xoc27e2a3d20-1304070199/foods/food_shousi@2x.png',
  food_zhujiaofan: 'cloud://cloud1-d7gw6xoc27e2a3d20.636c-cloud1-d7gw6xoc27e2a3d20-1304070199/foods/food_zhujiaofan@2x.png'
};

export const DEFAULT_FOODS = [
  {
    id: 'food_huangmenji',
    name: '黄焖鸡米饭',
    image: FOOD_IMAGE_FILE_IDS.food_huangmenji,
    mealType: ['lunch', 'dinner'],
    category: 'kuaican',
    enabled: true
  },
  {
    id: 'food_zhujiaofan',
    name: '猪脚饭',
    image: FOOD_IMAGE_FILE_IDS.food_zhujiaofan,
    mealType: ['lunch', 'dinner'],
    category: 'kuaican',
    enabled: true
  },
  {
    id: 'food_malatang',
    name: '麻辣烫',
    image: FOOD_IMAGE_FILE_IDS.food_malatang,
    mealType: ['dinner'],
    category: 'other',
    enabled: true
  }
];
