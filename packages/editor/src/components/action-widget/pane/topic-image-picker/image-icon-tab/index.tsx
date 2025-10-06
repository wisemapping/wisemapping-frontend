import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
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
  iconModel: any;
  emojiModel: any;
  triggerClose: () => void;
}

const ImageIconTab: React.FC<ImageIconTabProps> = ({ iconModel, emojiModel, triggerClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Comprehensive icon mapping with proper categorization
  const iconMapping: { component: any; name: string; category: string }[] = [
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
  ];

  const handleIconSelect = (iconName: string) => {
    // Clear emoji if icon is selected
    if (emojiModel) {
      emojiModel.setValue(undefined);
    }
    // Set the icon using the descriptive name (which will be saved to XML)
    if (iconModel) {
      iconModel.setValue(iconName.toLowerCase());
    }
    // Close the picker
    triggerClose();
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

  // Category icons mapping - dynamically generated to match actual categories
  const categoryIcons = useMemo(() => {
    const uniqueCategories = ['All', ...new Set(iconMapping.map((icon) => icon.category))];
    const iconMap: { [key: string]: any } = {
      All: Apps,
      Navigation: Home,
      General: Star,
      People: Person,
      Communication: Email,
      Technology: Computer,
      Business: AttachMoney,
      Lifestyle: Restaurant,
      Health: MedicalServices,
    };

    // Only include categories that actually exist in iconMapping
    const filteredMap: { [key: string]: any } = {};
    uniqueCategories.forEach((category) => {
      if (iconMap[category]) {
        filteredMap[category] = iconMap[category];
      }
    });

    return filteredMap;
  }, []);

  // Get unique categories for tabs
  const categories = useMemo(() => {
    const uniqueCategories = ['All', ...new Set(iconMapping.map((icon) => icon.category))];
    // Ensure Health category is always included
    if (!uniqueCategories.includes('Health')) {
      uniqueCategories.push('Health');
    }
    return uniqueCategories;
  }, []);

  const renderIconGrid = (icons: any[]) => (
    <Grid container sx={{ gap: 0.25, justifyContent: 'flex-start' }}>
      {icons.map((iconMapping, index) => {
        const IconComponent = iconMapping.component;
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
                <IconComponent sx={{ fontSize: 18 }} />
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
          const CategoryIcon = categoryIcons[category];
          const isSelected = selectedCategory === category;
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
              <CategoryIcon sx={{ fontSize: 20 }} />
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
