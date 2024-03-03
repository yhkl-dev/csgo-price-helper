export interface Category {
  category: string
  id: number
  internal_name: string
  localized_name: string
}

export interface CategoryGroup {
  category: string
  id: number
  internal_name: string
  localized_name: string
}

export interface Exterior {
  category: string
  id: number
  internal_name: string
  localized_name: string
}

export interface Itemset {
  category: string
  id: number
  internal_name: string
  localized_name: string
}

export interface Quality {
  category: string
  id: number
  internal_name: string
  localized_name: string
}

export interface Rarity {
  category: string
  id: number
  internal_name: string
  localized_name: string
}

export interface Series {
  category: string
  id: number
  internal_name: string
  localized_name: string
}

export interface Type {
  category: string
  id: number
  internal_name: string
  localized_name: string
}

export interface Weapon {
  category: string
  id: number
  internal_name: string
  localized_name: string
}

export interface Weaponcase {
  category: string
  id: number
  internal_name: string
  localized_name: string
}

export interface Tags {
  category: Category
  category_group: CategoryGroup
  exterior: Exterior
  itemset: Itemset
  quality: Quality
  rarity: Rarity
  series: Series
  type: Type
  weapon: Weapon
  weaponcase: Weaponcase
}

export interface GoodsInfo {
  appid: number
  can_3d_inspect: boolean
  can_inspect: boolean
  description: any
  game: string
  goods_id: number
  icon_url: string
  item_id: any
  market_hash_name: string
  market_min_price: string
  name: string
  original_icon_url: string
  short_name: string
  steam_price: string
  steam_price_cny: string
  tags: Tags
}

export interface RentType {
  LeaseUnitPrice: string
  LongLeaseUnitPrice: string
}

export interface DataType {
  GoodsID: string
  Platform: string
  Sell: string
  Rent: RentType
  WantToBuy: string
  MarkingHashName: string
}

export interface BuffGoodsItem {
  allow_bargain: boolean
  allow_bargain_chat: boolean
  appid: number
  asset_info: AssetInfo
  background_image_url: string
  bookmarked: boolean
  can_bargain: boolean
  can_bargain_chat: boolean
  can_use_inspect_trn_url: boolean
  cannot_bargain_reason: string
  created_at: number
  description: string
  featured: number
  fee: string
  game: string
  goods_id: number
  id: string
  img_src: string
  income: string
  lowest_bargain_price: string
  mode: number
  price: string
  recent_average_duration: number
  recent_deliver_rate: number
  state: number
  sticker_premium: any
  supported_pay_methods: number[]
  tradable_cooldown: any
  updated_at: number
  user_id: string
}

export interface AssetInfo {
  action_link: string
  appid: number
  assetid: string
  classid: string
  contextid: number
  goods_id: number
  has_tradable_cooldown: boolean
  id: string
  info: Info
  instanceid: string
  paintwear: string
  tradable_cooldown_text: string
  tradable_unfrozen_time: any
}

export interface Info {
  fraudwarnings: any
  icon_url: string
  original_icon_url: string
  paintindex: number
  paintseed: number
  stickers: any[]
  tournament_tags: any[]
}

export interface SteamGoodsResponse {
  success: number
  sell_order_count: string
  sell_order_price: string
  sell_order_table: SellOrderTable[]
  buy_order_count: string
  buy_order_price: string
  buy_order_table: BuyOrderTable[]
  highest_buy_order: string
  lowest_sell_order: string
  buy_order_graph: [number, number, string][]
  sell_order_graph: [number, number, string][]
  graph_max_y: number
  graph_min_x: number
  graph_max_x: number
  price_prefix: string
  price_suffix: string
}

export interface SellOrderTable {
  price: string
  price_with_fee: string
  quantity: string
}

export interface BuyOrderTable {
  price: string
  quantity: string
}

export interface C5GoodsResponse {
  success: boolean
  data: Data
  errorCode: number
  errorMsg: any
  errorData: any
  errorCodeStr: any
}

export interface Data {
  total: number
  pages: number
  page: number
  limit: number
  list: List[]
}

export interface List {
  id: string
  sellerInfo: SellerInfo
  systemTime: any
  appId: number
  appName: any
  itemId: string
  itemName: string
  marketHashName: string
  price: string
  subsidyPrice: string
  sellerPrice: any
  cnyPrice: string
  imageUrl: string
  compensateType: any
  delivery: number
  acceptBargain: number
  description: string
  classInfoId: any
  inspectUrl: any
  inspectViewable: number
  inspectable: any
  inspectImageUrl: string
  assetInfo: AssetInfo
  inspect3dViewable: number
  inspect3dUrl: string
  token: string
  itemInfo: ItemInfo
  isCollection: number
  wearRank: number
  inspectOriginalUrl: string
}

export interface SellerInfo {
  userId: string
  platformId: number
  thirdUserId: string
  nickname: string
  avatar: string
  verified: any
  lastActive: any
  deliveryInfo: DeliveryInfo
}

export interface DeliveryInfo {
  day7: Day7
  day15: Day15
}

export interface Day7 {
  deliverySuccessRate: string
  deliveryAvgTime: string
  deliveryNoneNum: number
}

export interface Day15 {
  deliverySuccessRate: string
  deliveryAvgTime: string
  deliveryNoneNum: number
}

export interface AssetInfo {
  classInfoId: string
  classId: string
  instanceId: string
  assetId: string
  styleId: string
  lastStyle: string
  styleProgress: string
  wear: string
  paintIndex: number
  paintSeed: number
  levelName: string
  levelColor: string
  gradient: string
  fadeColor: string
  inspectImageUrl: string
  gems: any[]
  stickers: Sticker[]
  styles: any[]
  itemSets: any[]
  ext: string
  fraudwarning: string
}

export interface Sticker {
  id: string
  type: number
  stickerId: string
  itemId: string
  name: string
  enName: string
  image: string
  slot: number
  wear: string
  price: any
}

export interface ItemInfo {
  quality: string
  qualityName: string
  qualityColor: string
  rarity: string
  rarityName: string
  rarityColor: string
  type: string
  typeName: string
  slot: string
  slotName: string
  hero: string
  heroName: string
  heroAvatar: string
  exterior: string
  exteriorName: string
  exteriorColor: string
  weapon: string
  weaponName: string
  itemSet: string
  itemSetName: string
  stickerCapsule: string
  stickerCapsuleName: string
  patchCapsule: string
  patchCapsuleName: string
  customPlayer: string
  customPlayerName: string
  category: string
  categoryName: string
  item: string
  itemName: any
}
