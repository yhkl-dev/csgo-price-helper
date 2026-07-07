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

export interface C5BatchPriceResponse {
  success: boolean
  data: Record<string, C5BatchPriceItem>
  errorCode: number
  errorMsg: string | null
  errorData: unknown
  errorCodeStr: unknown
}

export interface C5BatchPriceItem {
  itemId: string
  marketHashName: string
  price: number
  count: number
  website: string
}
