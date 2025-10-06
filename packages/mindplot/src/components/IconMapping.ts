/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

// Map descriptive icon names to actual asset file names
const iconNameToAssetMapping: { [key: string]: string } = {
  // General icons
  home: 'things_address_book',
  work: 'things_wrench',
  school: 'time_calendar',
  business: 'chart_organisation',
  star: 'flag_yellow',
  favorite: 'flag_pink',
  'thumbs-up': 'sign_info',
  'check-circle': 'task_100',
  warning: 'sign_warning',
  error: 'sign_exclamation',
  info: 'sign_info',
  help: 'sign_help',
  add: 'onoff_add',
  delete: 'onoff_delete',
  edit: 'soft_cursor',
  save: 'hard_drive_cd',
  search: 'sign_info',
  settings: 'things_wrench',
  'account-circle': 'things_address_book',
  person: 'things_address_book',
  group: 'chart_organisation',
  email: 'appsgoogle_gmail',
  phone: 'appsgoogle_maps',
  location: 'appsgoogle_maps',
  schedule: 'time_clock',
  money: 'money_dollar',
  'trending-up': 'chart_line',
  'pie-chart': 'chart_pie',
  'bar-chart': 'chart_curve',
  timeline: 'chart_line',
  assessment: 'chart_organisation',
  computer: 'soft_database',
  laptop: 'soft_database',
  'phone-android': 'hard_ipod',
  tablet: 'hard_ipod',
  tv: 'things_window-layout',
  headphones: 'object_music',
  camera: 'soft_cursor',
  image: 'soft_cursor',
  'video-file': 'appsgoogle_youtube',
  'audio-file': 'object_music',
  description: 'notes',
  folder: 'soft_folder_explore',
  'cloud-upload': 'soft_feed',
  wifi: 'conn_connect',
  bluetooth: 'conn_connect',
  storage: 'soft_database',
  memory: 'soft_database',
  restaurant: 'things_bubbles',
  'shopping-cart': 'money_dollar',
  'grocery-store': 'money_dollar',
  hospital: 'sign_help',
  car: 'appsgoogle_maps',
  flight: 'appsgoogle_maps',
  train: 'appsgoogle_maps',
  bike: 'appsgoogle_maps',
  walk: 'appsgoogle_maps',
  soccer: 'soft_cursor',
  basketball: 'soft_cursor',
  tennis: 'soft_cursor',
  fitness: 'soft_cursor',
  music: 'object_music',
  movie: 'appsgoogle_youtube',
  book: 'notes',
  gamepad: 'soft_cursor',
  palette: 'soft_cursor',
  brush: 'soft_cursor',
  'photo-camera': 'soft_cursor',
  lightbulb: 'sign_info',
  flash: 'sign_warning',
  security: 'sign_warning',
  lock: 'sign_closed',
  notifications: 'sign_info',
  mail: 'appsgoogle_gmail',
  chat: 'meetapps_slack',
  share: 'links',
  download: 'onoff_add',
  upload: 'onoff_add',
  refresh: 'arrow_merge',
  // Social icons
  facebook: 'social_facebook',
  twitter: 'social_twitter',
  instagram: 'social_instagram',
  linkedin: 'social_google-plus',
  youtube: 'appsgoogle_youtube',
  whatsapp: 'meetapps_whatapp',
};

/**
 * Maps a descriptive icon name to the actual asset file name
 * @param iconName The descriptive icon name (e.g., 'home', 'work', 'star')
 * @returns The asset file name (e.g., 'things_address_book', 'things_wrench', 'flag_yellow')
 */
export function mapIconNameToAsset(iconName: string): string {
  return iconNameToAssetMapping[iconName] || iconName;
}

/**
 * Gets the display name for an icon asset
 * @param assetName The asset file name
 * @returns The descriptive display name
 */
export function getIconDisplayName(assetName: string): string {
  // Find the descriptive name for the asset
  const entry = Object.entries(iconNameToAssetMapping).find(([_, asset]) => asset === assetName);
  return entry ? entry[0] : assetName;
}

export default {
  mapIconNameToAsset,
  getIconDisplayName,
};
