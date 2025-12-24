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
import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import NodeProperty from '../../../../../classes/model/node-property';
import {
  // Icons used in the component
  Home,
  Work,
  School,
  Business,
  Star,
  Favorite,
  ThumbUp,
  CheckCircle,
  Warning,
  Error,
  Info,
  Help,
  Add,
  Delete,
  Edit,
  Save,
  Search,
  Settings,
  AccountCircle,
  Person,
  Group,
  Email,
  Phone,
  LocationOn,
  Schedule,
  AttachMoney,
  TrendingUp,
  PieChart,
  BarChart,
  Timeline,
  Assessment,
  Computer,
  Laptop,
  PhoneAndroid,
  Tablet,
  Tv,
  Headphones,
  Camera,
  Image,
  VideoFile,
  AudioFile,
  Description,
  Folder,
  CloudUpload,
  Wifi,
  Bluetooth,
  Storage,
  Memory,
  Restaurant,
  ShoppingCart,
  LocalGroceryStore,
  LocalHospital,
  DirectionsCar,
  Flight,
  Train,
  DirectionsBike,
  DirectionsWalk,
  SportsSoccer,
  SportsBasketball,
  SportsTennis,
  FitnessCenter,
  MusicNote,
  Movie,
  Book,
  Gamepad,
  Palette,
  Brush,
  PhotoCamera,
  Lightbulb,
  FlashOn,
  Security,
  Lock,
  Notifications,
  Mail,
  Chat,
  Share,
  Download,
  Upload,
  Refresh,
  CalendarToday,
  Event,
  EventAvailable,
  EventBusy,
  AccessTime,
  Timer,
  DateRange,
  Today,
  Update,
  History,
  WbSunny,
  AcUnit,
  Whatshot,
  InvertColors,
  Opacity,
  Park,
  Nature,
  WineBar,
  Coffee,
  Cake,
  Icecream,
  Cookie,
  BakeryDining,
  MedicalServices,
  HealthAndSafety,
  Coronavirus,
  Vaccines,
  Medication,
  Sick,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  WhatsApp,
  Search as SearchIcon,
  Clear as ClearIcon,
  Apps,
  ColorLens,
  AutoFixHigh,
  FilterVintage,
  Gradient,
  Texture,
  Close,
  Check,
  Cancel,
  Done,
  Clear,
  Remove,
  AddCircle,
  RemoveCircle,
  ExpandMore,
  ExpandLess,
  KeyboardArrowDown,
  KeyboardArrowUp,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  PlayArrow,
  Pause,
  Stop,
  SkipNext,
  SkipPrevious,
  FastForward,
  FastRewind,
  VolumeUp,
  VolumeDown,
  VolumeOff,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  Fullscreen,
  FullscreenExit,
  ZoomIn,
  ZoomOut,
  OpenInNew,
  Launch,
  Link,
  LinkOff,
  ContentCopy,
  ContentCut,
  ContentPaste,
  Undo,
  Redo,
  Print,
  PrintDisabled,
  PictureAsPdf,
  Article,
  Note,
  StickyNote2,
  Assignment,
  Task,
  Checklist,
  List,
  ViewList,
  ViewModule,
  Dashboard,
  TableChart,
  ViewColumn,
  ViewHeadline,
  ViewStream,
  ViewWeek,
  ViewDay,
  ViewAgenda,
  ViewCarousel,
  ViewComfy,
  ViewCompact,
  ViewSidebar,
  ViewQuilt,
  ViewArray,
  ViewKanban,
  ViewTimeline,
  ViewInAr,
  // 40 New Icons
  AccountBalance,
  BusinessCenter,
  WorkOutline,
  Badge,
  Contacts,
  Store,
  ShoppingBasket,
  Receipt,
  CreditCard,
  Payment,
  CreateNewFolder,
  FolderOpen,
  FileCopy,
  InsertDriveFile,
  AttachFile,
  Forum,
  Comment,
  Announcement,
  Campaign,
  Feedback,
  Flag,
  Bookmark,
  BookmarkBorder,
  Label,
  LabelImportant,
  Extension,
  DashboardCustomize,
  DirectionsSubway,
  DirectionsBus,
  LocalShipping,
  Construction,
  Handyman,
  Engineering,
  SentimentSatisfied,
  Mood,
  EmojiEmotions,
  Alarm,
  AlarmOn,
  HourglassEmpty,
  Pending,
  // 75 New High-Priority Icons
  // Analytics & Data
  Analytics,
  Insights,
  DataUsage,
  CloudDone,
  CloudOff,
  CloudQueue,
  TableView,
  Api,
  QueryStats,
  BarChartOutlined,
  // Industry & Professional
  Factory,
  Agriculture,
  Biotech,
  RealEstateAgent,
  LocalPharmacy,
  MedicalInformation,
  SchoolOutlined,
  LocalLibrary,
  Museum,
  TheaterComedy,
  SportsEsports,
  Apartment,
  Domain,
  LocalCafeOutlined,
  LocalDining,
  // Actions & Controls
  PlayCircle,
  PauseCircle,
  StopCircle,
  Replay,
  Forward10,
  Replay10,
  Shuffle,
  Repeat,
  RepeatOne,
  Sort,
  FilterList,
  FilterAlt,
  SearchOff,
  FindInPage,
  FindReplace,
  Visibility,
  VisibilityOff,
  Compare,
  Flip,
  RotateLeft,
  // Status & Indicators
  PriorityHigh,
  NewReleases,
  FiberNew,
  Verified,
  VerifiedUser,
  WorkspacePremium,
  Stars,
  Grade,
  MilitaryTech,
  TrendingFlat,
  TrendingDown as TrendingDownIcon,
  Circle,
  RadioButtonChecked,
  RadioButtonUnchecked,
  CheckBox,
  // Content & Media
  LibraryBooks,
  PhotoLibrary,
  VideoLibrary,
  Collections,
  PermMedia,
  Slideshow,
  Theaters,
  LiveTv,
  Podcasts,
  SpeakerNotes,
  FormatQuote,
  LibraryMusic,
  LibraryAdd,
  VideoCall,
  PhotoCameraFront,
} from '@mui/icons-material';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  width: 32,
  height: 32,
  margin: 1,
  borderRadius: 6,
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.contrastText,
    },
  },
  '&.selected': {
    backgroundColor: theme.palette.primary.main,
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.contrastText,
    },
  },
}));

interface ImageIconTabProps {
  iconModel: NodeProperty<string | undefined>;
  emojiModel: NodeProperty<string | undefined>;
}

const ImageIconTab: React.FC<ImageIconTabProps> = ({ iconModel, emojiModel }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Comprehensive icon mapping with proper categorization
  const iconMapping: { component: React.ComponentType; name: string; category: string }[] = [
    // Navigation & General
    { component: Home, name: 'home', category: 'Navigation' },
    { component: Work, name: 'work', category: 'Navigation' },
    { component: School, name: 'school', category: 'Navigation' },
    { component: Business, name: 'business', category: 'Navigation' },
    { component: Star, name: 'star', category: 'General' },
    { component: Favorite, name: 'favorite', category: 'General' },
    { component: ThumbUp, name: 'thumbs-up', category: 'General' },
    { component: CheckCircle, name: 'check-circle', category: 'General' },
    { component: Warning, name: 'warning', category: 'General' },
    { component: Error, name: 'error', category: 'General' },
    { component: Info, name: 'info', category: 'General' },
    { component: Help, name: 'help', category: 'General' },
    { component: Add, name: 'add', category: 'General' },
    { component: Delete, name: 'delete', category: 'General' },
    { component: Edit, name: 'edit', category: 'General' },
    { component: Save, name: 'save', category: 'General' },
    { component: Search, name: 'search', category: 'General' },
    { component: Settings, name: 'settings', category: 'General' },
    { component: Lightbulb, name: 'lightbulb', category: 'General' },
    { component: FlashOn, name: 'flash', category: 'General' },
    { component: Security, name: 'security', category: 'General' },
    { component: Lock, name: 'lock', category: 'General' },
    { component: Notifications, name: 'notifications', category: 'General' },
    { component: Download, name: 'download', category: 'General' },
    { component: Upload, name: 'upload', category: 'General' },
    { component: Refresh, name: 'refresh', category: 'General' },

    // People & Communication
    { component: AccountCircle, name: 'account-circle', category: 'People' },
    { component: Person, name: 'person', category: 'People' },
    { component: Group, name: 'group', category: 'People' },
    { component: Email, name: 'email', category: 'Communication' },
    { component: Phone, name: 'phone', category: 'Communication' },
    { component: Mail, name: 'mail', category: 'Communication' },
    { component: Chat, name: 'chat', category: 'Communication' },
    { component: Share, name: 'share', category: 'Communication' },

    // Technology & Devices
    { component: Computer, name: 'computer', category: 'Technology' },
    { component: Laptop, name: 'laptop', category: 'Technology' },
    { component: PhoneAndroid, name: 'phone-android', category: 'Technology' },
    { component: Tablet, name: 'tablet', category: 'Technology' },
    { component: Tv, name: 'tv', category: 'Technology' },
    { component: Headphones, name: 'headphones', category: 'Technology' },
    { component: Camera, name: 'camera', category: 'Technology' },
    { component: Image, name: 'image', category: 'Technology' },
    { component: VideoFile, name: 'video-file', category: 'Technology' },
    { component: AudioFile, name: 'audio-file', category: 'Technology' },
    { component: Folder, name: 'folder', category: 'Technology' },
    { component: CloudUpload, name: 'cloud-upload', category: 'Technology' },
    { component: Wifi, name: 'wifi', category: 'Technology' },
    { component: Bluetooth, name: 'bluetooth', category: 'Technology' },
    { component: Storage, name: 'storage', category: 'Technology' },
    { component: Memory, name: 'memory', category: 'Technology' },

    // Business & Finance
    { component: AttachMoney, name: 'money', category: 'Business' },
    { component: TrendingUp, name: 'trending-up', category: 'Business' },
    { component: PieChart, name: 'pie-chart', category: 'Business' },
    { component: BarChart, name: 'bar-chart', category: 'Business' },
    { component: Timeline, name: 'timeline', category: 'Business' },
    { component: Assessment, name: 'assessment', category: 'Business' },
    { component: Description, name: 'description', category: 'Business' },
    { component: Schedule, name: 'schedule', category: 'Business' },
    { component: CalendarToday, name: 'calendar-today', category: 'Business' },
    { component: Event, name: 'event', category: 'Business' },
    { component: EventAvailable, name: 'event-available', category: 'Business' },
    { component: EventBusy, name: 'event-busy', category: 'Business' },
    { component: AccessTime, name: 'access-time', category: 'Business' },
    { component: Timer, name: 'timer', category: 'Business' },
    { component: DateRange, name: 'date-range', category: 'Business' },
    { component: Today, name: 'today', category: 'Business' },
    { component: Update, name: 'update', category: 'Business' },
    { component: History, name: 'history', category: 'Business' },

    // Transportation & Location - moved to Lifestyle
    { component: LocationOn, name: 'location', category: 'Lifestyle' },
    { component: DirectionsCar, name: 'car', category: 'Lifestyle' },
    { component: Flight, name: 'flight', category: 'Lifestyle' },
    { component: Train, name: 'train', category: 'Lifestyle' },
    { component: DirectionsBike, name: 'bike', category: 'Lifestyle' },
    { component: DirectionsWalk, name: 'walk', category: 'Lifestyle' },

    // Lifestyle & Activities
    { component: Restaurant, name: 'restaurant', category: 'Lifestyle' },
    { component: ShoppingCart, name: 'shopping-cart', category: 'Lifestyle' },
    { component: LocalGroceryStore, name: 'grocery-store', category: 'Lifestyle' },
    { component: LocalHospital, name: 'hospital', category: 'Lifestyle' },
    { component: SportsSoccer, name: 'soccer', category: 'Lifestyle' },
    { component: SportsBasketball, name: 'basketball', category: 'Lifestyle' },
    { component: SportsTennis, name: 'tennis', category: 'Lifestyle' },
    { component: FitnessCenter, name: 'fitness', category: 'Lifestyle' },
    { component: MusicNote, name: 'music', category: 'Lifestyle' },
    { component: Movie, name: 'movie', category: 'Lifestyle' },
    { component: Book, name: 'book', category: 'Lifestyle' },
    { component: Gamepad, name: 'gamepad', category: 'Lifestyle' },

    // Creative & Design - moved back to General
    { component: Palette, name: 'palette', category: 'General' },
    { component: Brush, name: 'brush', category: 'General' },
    { component: PhotoCamera, name: 'photo-camera', category: 'General' },
    { component: ColorLens, name: 'color-lens', category: 'General' },
    { component: AutoFixHigh, name: 'auto-fix', category: 'General' },
    { component: FilterVintage, name: 'filter-vintage', category: 'General' },
    { component: Gradient, name: 'gradient', category: 'General' },
    { component: Texture, name: 'texture', category: 'General' },

    // Nature & Weather - moved to General
    { component: WbSunny, name: 'sunny', category: 'General' },
    { component: AcUnit, name: 'snow', category: 'General' },
    { component: Whatshot, name: 'fire', category: 'General' },
    { component: InvertColors, name: 'invert-colors', category: 'General' },
    { component: Opacity, name: 'opacity', category: 'General' },
    { component: Park, name: 'park', category: 'General' },
    { component: Nature, name: 'nature', category: 'General' },

    // Food & Drink - moved to Lifestyle
    { component: WineBar, name: 'wine-bar', category: 'Lifestyle' },
    { component: Coffee, name: 'coffee', category: 'Lifestyle' },
    { component: Cake, name: 'cake', category: 'Lifestyle' },
    { component: Icecream, name: 'ice-cream', category: 'Lifestyle' },
    { component: Cookie, name: 'cookie', category: 'Lifestyle' },
    { component: BakeryDining, name: 'bakery', category: 'Lifestyle' },

    // Health & Medical
    { component: MedicalServices, name: 'medical-services', category: 'Health' },
    { component: HealthAndSafety, name: 'health-safety', category: 'Health' },
    { component: Coronavirus, name: 'coronavirus', category: 'Health' },
    { component: Vaccines, name: 'vaccines', category: 'Health' },
    { component: Medication, name: 'medication', category: 'Health' },
    { component: Sick, name: 'sick', category: 'Health' },

    // Social Media - moved to Communication
    { component: Facebook, name: 'facebook', category: 'Communication' },
    { component: Twitter, name: 'twitter', category: 'Communication' },
    { component: Instagram, name: 'instagram', category: 'Communication' },
    { component: LinkedIn, name: 'linkedin', category: 'Communication' },
    { component: YouTube, name: 'youtube', category: 'Communication' },
    { component: WhatsApp, name: 'whatsapp', category: 'Communication' },

    // Additional General Icons
    { component: Close, name: 'close', category: 'General' },
    { component: Check, name: 'check', category: 'General' },
    { component: Cancel, name: 'cancel', category: 'General' },
    { component: Done, name: 'done', category: 'General' },
    { component: Clear, name: 'clear', category: 'General' },
    { component: Remove, name: 'remove', category: 'General' },
    { component: AddCircle, name: 'add-circle', category: 'General' },
    { component: RemoveCircle, name: 'remove-circle', category: 'General' },
    { component: ExpandMore, name: 'expand-more', category: 'General' },
    { component: ExpandLess, name: 'expand-less', category: 'General' },
    { component: KeyboardArrowDown, name: 'arrow-down', category: 'General' },
    { component: KeyboardArrowUp, name: 'arrow-up', category: 'General' },
    { component: KeyboardArrowLeft, name: 'arrow-left', category: 'General' },
    { component: KeyboardArrowRight, name: 'arrow-right', category: 'General' },
    { component: PlayArrow, name: 'play', category: 'General' },
    { component: Pause, name: 'pause', category: 'General' },
    { component: Stop, name: 'stop', category: 'General' },
    { component: SkipNext, name: 'skip-next', category: 'General' },
    { component: SkipPrevious, name: 'skip-previous', category: 'General' },
    { component: FastForward, name: 'fast-forward', category: 'General' },
    { component: FastRewind, name: 'fast-rewind', category: 'General' },
    { component: VolumeUp, name: 'volume-up', category: 'General' },
    { component: VolumeDown, name: 'volume-down', category: 'General' },
    { component: VolumeOff, name: 'volume-off', category: 'General' },
    { component: Mic, name: 'mic', category: 'General' },
    { component: MicOff, name: 'mic-off', category: 'General' },
    { component: Videocam, name: 'videocam', category: 'General' },
    { component: VideocamOff, name: 'videocam-off', category: 'General' },
    { component: Fullscreen, name: 'fullscreen', category: 'General' },
    { component: FullscreenExit, name: 'fullscreen-exit', category: 'General' },
    { component: ZoomIn, name: 'zoom-in', category: 'General' },
    { component: ZoomOut, name: 'zoom-out', category: 'General' },
    { component: OpenInNew, name: 'open-in-new', category: 'General' },
    { component: Launch, name: 'launch', category: 'General' },
    { component: Link, name: 'link', category: 'General' },
    { component: LinkOff, name: 'link-off', category: 'General' },
    { component: ContentCopy, name: 'content-copy', category: 'General' },
    { component: ContentCut, name: 'content-cut', category: 'General' },
    { component: ContentPaste, name: 'content-paste', category: 'General' },
    { component: Undo, name: 'undo', category: 'General' },
    { component: Redo, name: 'redo', category: 'General' },
    { component: Print, name: 'print', category: 'General' },
    { component: PrintDisabled, name: 'print-disabled', category: 'General' },
    { component: PictureAsPdf, name: 'pdf', category: 'General' },
    { component: Article, name: 'article', category: 'General' },
    { component: Note, name: 'note', category: 'General' },
    { component: StickyNote2, name: 'sticky-note', category: 'General' },
    { component: Assignment, name: 'assignment', category: 'General' },
    { component: Task, name: 'task', category: 'General' },
    { component: Checklist, name: 'checklist', category: 'General' },
    { component: List, name: 'list', category: 'General' },
    { component: ViewList, name: 'view-list', category: 'General' },
    { component: ViewModule, name: 'view-module', category: 'General' },
    { component: Dashboard, name: 'dashboard', category: 'General' },
    { component: TableChart, name: 'table', category: 'General' },
    { component: ViewColumn, name: 'view-column', category: 'General' },
    { component: ViewHeadline, name: 'view-headline', category: 'General' },
    { component: ViewStream, name: 'view-stream', category: 'General' },
    { component: ViewWeek, name: 'view-week', category: 'General' },
    { component: ViewDay, name: 'view-day', category: 'General' },
    { component: ViewAgenda, name: 'view-agenda', category: 'General' },
    { component: ViewCarousel, name: 'view-carousel', category: 'General' },
    { component: ViewComfy, name: 'view-comfy', category: 'General' },
    { component: ViewCompact, name: 'view-compact', category: 'General' },
    { component: ViewSidebar, name: 'view-sidebar', category: 'General' },
    { component: ViewQuilt, name: 'view-quilt', category: 'General' },
    { component: ViewArray, name: 'view-array', category: 'General' },
    { component: ViewKanban, name: 'view-kanban', category: 'General' },
    { component: ViewTimeline, name: 'view-timeline', category: 'General' },
    { component: ViewInAr, name: 'view-ar', category: 'General' },

    // 40 New Icons for enhanced functionality
    { component: AccountBalance, name: 'account-balance', category: 'Business' },
    { component: BusinessCenter, name: 'business-center', category: 'Business' },
    { component: WorkOutline, name: 'work-outline', category: 'Business' },
    { component: Badge, name: 'badge', category: 'Business' },
    { component: Contacts, name: 'contacts', category: 'People' },
    { component: Store, name: 'store', category: 'Business' },
    { component: ShoppingBasket, name: 'shopping-basket', category: 'Lifestyle' },
    { component: Receipt, name: 'receipt', category: 'Business' },
    { component: CreditCard, name: 'credit-card', category: 'Business' },
    { component: Payment, name: 'payment', category: 'Business' },
    { component: CreateNewFolder, name: 'create-new-folder', category: 'Technology' },
    { component: FolderOpen, name: 'folder-open', category: 'Technology' },
    { component: FileCopy, name: 'file-copy', category: 'Technology' },
    { component: InsertDriveFile, name: 'insert-drive-file', category: 'Technology' },
    { component: AttachFile, name: 'attach-file', category: 'Technology' },
    { component: Forum, name: 'forum', category: 'Communication' },
    { component: Comment, name: 'comment', category: 'Communication' },
    { component: Announcement, name: 'announcement', category: 'Communication' },
    { component: Campaign, name: 'campaign', category: 'Communication' },
    { component: Feedback, name: 'feedback', category: 'Communication' },
    { component: Flag, name: 'flag', category: 'General' },
    { component: Bookmark, name: 'bookmark', category: 'General' },
    { component: BookmarkBorder, name: 'bookmark-border', category: 'General' },
    { component: Label, name: 'label', category: 'General' },
    { component: LabelImportant, name: 'label-important', category: 'General' },
    { component: Extension, name: 'extension', category: 'Technology' },
    { component: DashboardCustomize, name: 'dashboard-customize', category: 'General' },
    { component: DirectionsSubway, name: 'directions-subway', category: 'Lifestyle' },
    { component: DirectionsBus, name: 'directions-bus', category: 'Lifestyle' },
    { component: LocalShipping, name: 'local-shipping', category: 'Lifestyle' },
    { component: Construction, name: 'construction', category: 'General' },
    { component: Handyman, name: 'handyman', category: 'General' },
    { component: Engineering, name: 'engineering', category: 'General' },
    { component: SentimentSatisfied, name: 'sentiment-satisfied', category: 'General' },
    { component: Mood, name: 'mood', category: 'General' },
    { component: EmojiEmotions, name: 'emoji-emotions', category: 'General' },
    { component: Alarm, name: 'alarm', category: 'Business' },
    { component: AlarmOn, name: 'alarm-on', category: 'Business' },
    { component: HourglassEmpty, name: 'hourglass-empty', category: 'Business' },
    { component: Pending, name: 'pending', category: 'Business' },

    // 75 New High-Priority Icons

    // Analytics & Data (10 icons)
    { component: Analytics, name: 'analytics', category: 'Business' },
    { component: Insights, name: 'insights', category: 'Business' },
    { component: DataUsage, name: 'data-usage', category: 'Technology' },
    { component: CloudDone, name: 'cloud-done', category: 'Technology' },
    { component: CloudOff, name: 'cloud-off', category: 'Technology' },
    { component: CloudQueue, name: 'cloud-queue', category: 'Technology' },
    { component: TableView, name: 'table-view', category: 'Business' },
    { component: Api, name: 'api', category: 'Technology' },
    { component: QueryStats, name: 'query', category: 'Business' },
    { component: BarChartOutlined, name: 'bar-chart-outlined', category: 'Business' },

    // Industry & Professional (15 icons)
    { component: Factory, name: 'factory', category: 'Business' },
    { component: Agriculture, name: 'agriculture', category: 'Business' },
    { component: Biotech, name: 'biotech', category: 'Health' },
    { component: RealEstateAgent, name: 'real-estate', category: 'Business' },
    { component: LocalPharmacy, name: 'local-pharmacy', category: 'Health' },
    { component: MedicalInformation, name: 'medical-information', category: 'Health' },
    { component: SchoolOutlined, name: 'school-outlined', category: 'Navigation' },
    { component: LocalLibrary, name: 'local-library', category: 'Navigation' },
    { component: Museum, name: 'museum', category: 'Lifestyle' },
    { component: TheaterComedy, name: 'theater', category: 'Lifestyle' },
    { component: SportsEsports, name: 'sports-esports', category: 'Lifestyle' },
    { component: Apartment, name: 'apartment', category: 'Business' },
    { component: Domain, name: 'domain', category: 'Business' },
    { component: LocalCafeOutlined, name: 'local-cafe-outlined', category: 'Lifestyle' },
    { component: LocalDining, name: 'local-dining', category: 'Lifestyle' },

    // Actions & Controls (20 icons)
    { component: PlayCircle, name: 'play-circle', category: 'General' },
    { component: PauseCircle, name: 'pause-circle', category: 'General' },
    { component: StopCircle, name: 'stop-circle', category: 'General' },
    { component: Replay, name: 'replay', category: 'General' },
    { component: Forward10, name: 'forward-10', category: 'General' },
    { component: Replay10, name: 'replay-10', category: 'General' },
    { component: Shuffle, name: 'shuffle', category: 'General' },
    { component: Repeat, name: 'repeat', category: 'General' },
    { component: RepeatOne, name: 'repeat-one', category: 'General' },
    { component: Sort, name: 'sort', category: 'General' },
    { component: FilterList, name: 'filter-list', category: 'General' },
    { component: FilterAlt, name: 'filter-alt', category: 'General' },
    { component: SearchOff, name: 'search-off', category: 'General' },
    { component: FindInPage, name: 'find-in-page', category: 'General' },
    { component: FindReplace, name: 'find-replace', category: 'General' },
    { component: Visibility, name: 'visibility', category: 'General' },
    { component: VisibilityOff, name: 'visibility-off', category: 'General' },
    { component: Compare, name: 'compare', category: 'General' },
    { component: Flip, name: 'flip', category: 'General' },
    { component: RotateLeft, name: 'rotate-left', category: 'General' },

    // Status & Indicators (15 icons)
    { component: PriorityHigh, name: 'priority-high', category: 'General' },
    { component: NewReleases, name: 'new-releases', category: 'General' },
    { component: FiberNew, name: 'fiber-new', category: 'General' },
    { component: Verified, name: 'verified', category: 'General' },
    { component: VerifiedUser, name: 'verified-user', category: 'General' },
    { component: WorkspacePremium, name: 'workspace-premium', category: 'Business' },
    { component: Stars, name: 'stars', category: 'General' },
    { component: Grade, name: 'grade', category: 'General' },
    { component: MilitaryTech, name: 'military-tech', category: 'General' },
    { component: TrendingFlat, name: 'trending-flat', category: 'Business' },
    { component: TrendingDownIcon, name: 'trending-down', category: 'Business' },
    { component: Circle, name: 'circle', category: 'General' },
    { component: RadioButtonChecked, name: 'radio-button-checked', category: 'General' },
    { component: RadioButtonUnchecked, name: 'radio-button-unchecked', category: 'General' },
    { component: CheckBox, name: 'check-box', category: 'General' },

    // Content & Media (15 icons)
    { component: LibraryBooks, name: 'library-books', category: 'General' },
    { component: PhotoLibrary, name: 'photo-library', category: 'General' },
    { component: VideoLibrary, name: 'video-library', category: 'General' },
    { component: Collections, name: 'collections', category: 'General' },
    { component: PermMedia, name: 'perm-media', category: 'Technology' },
    { component: Slideshow, name: 'slideshow', category: 'General' },
    { component: Theaters, name: 'theaters', category: 'Lifestyle' },
    { component: LiveTv, name: 'live-tv', category: 'Lifestyle' },
    { component: Podcasts, name: 'podcasts', category: 'Lifestyle' },
    { component: SpeakerNotes, name: 'speaker-notes', category: 'General' },
    { component: FormatQuote, name: 'format-quote', category: 'General' },
    { component: LibraryMusic, name: 'library-music', category: 'Lifestyle' },
    { component: LibraryAdd, name: 'library-add', category: 'General' },
    { component: VideoCall, name: 'video-call', category: 'Communication' },
    { component: PhotoCameraFront, name: 'photo-camera-front', category: 'Technology' },
  ];

  const handleIconSelect = (iconName: string) => {
    // Clear emoji if icon is selected
    if (emojiModel && emojiModel.setValue) {
      emojiModel.setValue(undefined);
    }
    // Set the icon using the descriptive name (which will be saved to XML)
    if (iconModel && iconModel.setValue) {
      iconModel.setValue(iconName.toLowerCase());
    }
    // Don't close the picker - allow multiple icon selections
    // triggerClose();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Filter icons based on search and category
  const filteredIcons = useMemo(() => {
    let filtered = iconMapping;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((icon) => icon.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (icon) =>
          icon.name.toLowerCase().includes(query) || icon.category.toLowerCase().includes(query),
      );
    }

    // Ensure all icons have valid components
    filtered = filtered.filter((icon) => icon.component && icon.name);

    return filtered;
  }, [searchQuery, selectedCategory]);

  // Get unique categories for tabs
  const categories = useMemo(() => {
    const uniqueCategories = ['All', ...new Set(iconMapping.map((icon) => icon.category))];
    // Ensure Health category is always included
    if (!uniqueCategories.includes('Health')) {
      uniqueCategories.push('Health');
    }
    return uniqueCategories;
  }, []);

  const renderIconGrid = (
    icons: { component: React.ComponentType; name: string; category: string }[],
  ) => (
    <Grid container sx={{ gap: 0.25, justifyContent: 'flex-start' }}>
      {icons.map((iconMapping, index) => {
        const iconName = iconMapping.name;
        const isSelected = iconModel?.getValue() === iconName;

        return (
          <Grid key={`${iconName}-${index}`} sx={{ display: 'inline-block' }}>
            <Tooltip title={iconName} placement="top">
              <StyledIconButton
                className={isSelected ? 'selected' : ''}
                onClick={() => handleIconSelect(iconName)}
                size="small"
              >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {React.createElement(iconMapping.component as React.ComponentType<any>, {
                  style: { fontSize: 18 },
                })}
              </StyledIconButton>
            </Tooltip>
          </Grid>
        );
      })}
    </Grid>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Search Bar */}
      <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search icons..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Category Navigation - Emoji Picker Style */}
      <Box
        sx={{
          px: 2,
          pb: 1.5,
          display: 'inline-flex',
          gap: 0.5,
          overflowX: 'auto',
          alignSelf: 'flex-start',
          width: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category;

          // Render icon based on category with direct JSX
          const renderCategoryIcon = () => {
            switch (category) {
              case 'All':
                return <Apps sx={{ fontSize: 20 }} />;
              case 'Navigation':
                return <Home sx={{ fontSize: 20 }} />;
              case 'General':
                return <Star sx={{ fontSize: 20 }} />;
              case 'People':
                return <Person sx={{ fontSize: 20 }} />;
              case 'Communication':
                return <Email sx={{ fontSize: 20 }} />;
              case 'Technology':
                return <Computer sx={{ fontSize: 20 }} />;
              case 'Business':
                return <AttachMoney sx={{ fontSize: 20 }} />;
              case 'Lifestyle':
                return <Restaurant sx={{ fontSize: 20 }} />;
              case 'Health':
                return <MedicalServices sx={{ fontSize: 20 }} />;
              default:
                return <Apps sx={{ fontSize: 20 }} />;
            }
          };

          return (
            <IconButton
              key={category}
              onClick={() => handleCategoryChange(category)}
              sx={{
                minWidth: 36,
                height: 36,
                borderRadius: 1,
                color: isSelected ? 'primary.main' : 'text.secondary',
                backgroundColor: isSelected ? 'action.selected' : 'transparent',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                flexShrink: 0,
              }}
            >
              {renderCategoryIcon()}
            </IconButton>
          );
        })}
      </Box>

      {/* Icon Grid */}
      <Box sx={{ flex: 1, px: 2, pt: 1, pb: 2, overflowY: 'auto' }}>
        {filteredIcons.length > 0 ? (
          <>
            {searchQuery ? (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                  {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} found
                </Typography>
                {renderIconGrid(filteredIcons)}
              </Box>
            ) : (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                  {selectedCategory} ({filteredIcons.length} icons)
                </Typography>
                {renderIconGrid(filteredIcons)}
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No icons found matching your search
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ImageIconTab;
