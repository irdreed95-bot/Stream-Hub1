import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "ar";

const dict = {
  en: {
    appName: "Sarad",
    appNameAr: "سراد",
    home: "Home",
    movies: "Movies",
    series: "Series",
    liveTV: "Live TV",
    search: "Search",
    settings: "Settings",
    profile: "Profile",
    categories: "Categories",
    login: "Login",
    admin: "Admin",
    trendingToday: "Trending Today",
    popularMovies: "Popular Movies",
    popularSeries: "Popular Series",
    topRated: "Top Rated",
    recentlyAdded: "Recently Added",
    worldCupHighlights: "World Cup Highlights",
    featuredMovies: "Featured Movies",
    featuredSeries: "Featured Series",
    muharramPack: "Muharram Pack",
    moviesIn4K: "4K Movies",
    action: "Action",
    comedy: "Comedy",
    drama: "Drama",
    horror: "Horror",
    sciFi: "Sci-Fi",
    family: "Family",
    anime: "Anime / Cartoon",
    watchNow: "Watch Now",
    moreInfo: "More Info",
    playNow: "Play Now",
    server: "Server",
    embeds: "Embeds",
    directURL: "Direct URL",
    scrapers: "Scrapers",
    arabic: "Arabic Sources",
    season: "Season",
    episode: "Episode",
    cast: "Top Cast",
    similarContent: "You May Also Like",
    searchPlaceholder: "Search movies, series...",
    noResults: "No results found",
    channelOffline: "Channel Offline",
    loading: "Loading...",
    retry: "Retry",
    selectChannel: "Select a channel to start watching",
    playlistUnavailable: "Playlist Unavailable",
    signIn: "Sign In",
    createAccount: "Create Account",
    emailAddress: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    rememberMe: "Remember me",
    forgotPassword: "Forgot Password?",
    downloads: "Downloads",
    help: "Help & Support",
    developerPortal: "Developer Portal",
    language: "Language",
    region: "Region",
    rtlMode: "RTL Mode",
    clearCache: "Clear Cache",
    cacheCleared: "Cache cleared successfully",
    interfaceLanguage: "Interface Language",
    contentLanguage: "Content Language",
    defaultServer: "Default Server",
    autoPlay: "Auto-play next episode",
    hdQuality: "HD Quality by Default",
    activeDownloads: "Active Downloads",
    about: "About",
    version: "Version",
    updateBanner: "Update Banner",
    adsToggle: "Ads Toggle",
    customStreams: "Custom Streams",
    pinChange: "Change PIN",
    save: "Save",
    cancel: "Cancel",
    addStream: "Add Stream",
    notFound: "Page not found",
    goHome: "Go Home",
    comesSoon: "Coming Soon",
    arabicSearch: "Search in Arabic...",
  },
  ar: {
    appName: "Sarad",
    appNameAr: "سراد",
    home: "الرئيسية",
    movies: "الأفلام",
    series: "المسلسلات",
    liveTV: "البث المباشر",
    search: "بحث",
    settings: "الإعدادات",
    profile: "الحساب",
    categories: "الأقسام",
    login: "تسجيل الدخول",
    admin: "المشرف",
    trendingToday: "الأكثر رواجاً اليوم",
    popularMovies: "الأفلام الشائعة",
    popularSeries: "المسلسلات الشائعة",
    topRated: "الأعلى تقييماً",
    recentlyAdded: "أضيف مؤخراً",
    worldCupHighlights: "أبرز لقطات كأس العالم",
    featuredMovies: "الأفلام المميزة",
    featuredSeries: "المسلسلات المميزة",
    muharramPack: "باقة محرم",
    moviesIn4K: "أفلام 4K",
    action: "أكشن",
    comedy: "كوميديا",
    drama: "دراما",
    horror: "رعب",
    sciFi: "خيال علمي",
    family: "عائلي",
    anime: "أنيمي / كرتون",
    watchNow: "شاهد الآن",
    moreInfo: "مزيد من المعلومات",
    playNow: "تشغيل",
    server: "الخادم",
    embeds: "روابط مدمجة",
    directURL: "رابط مباشر",
    scrapers: "مستخرجات",
    arabic: "مصادر عربية",
    season: "الموسم",
    episode: "الحلقة",
    cast: "أبرز الممثلين",
    similarContent: "قد يعجبك أيضاً",
    searchPlaceholder: "ابحث عن أفلام، مسلسلات...",
    noResults: "لا توجد نتائج",
    channelOffline: "القناة غير متاحة",
    loading: "جاري التحميل...",
    retry: "إعادة المحاولة",
    selectChannel: "اختر قناة للمشاهدة",
    playlistUnavailable: "قائمة القنوات غير متاحة",
    signIn: "تسجيل الدخول",
    createAccount: "إنشاء حساب",
    emailAddress: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    fullName: "الاسم الكامل",
    rememberMe: "تذكرني",
    forgotPassword: "نسيت كلمة المرور؟",
    downloads: "التحميلات",
    help: "المساعدة والطلب",
    developerPortal: "بوابة المطور",
    language: "اللغة",
    region: "المنطقة",
    rtlMode: "وضع RTL",
    clearCache: "مسح ذاكرة التخزين",
    cacheCleared: "تم مسح الذاكرة بنجاح",
    interfaceLanguage: "لغة الواجهة",
    contentLanguage: "لغة المحتوى",
    defaultServer: "الخادم الافتراضي",
    autoPlay: "تشغيل الحلقة التالية تلقائياً",
    hdQuality: "جودة HD افتراضياً",
    activeDownloads: "التحميلات النشطة",
    about: "حول التطبيق",
    version: "الإصدار",
    updateBanner: "شعار التحديث",
    adsToggle: "تبديل الإعلانات",
    customStreams: "روابط مخصصة",
    pinChange: "تغيير الرمز السري",
    save: "حفظ",
    cancel: "إلغاء",
    addStream: "إضافة رابط",
    notFound: "الصفحة غير موجودة",
    goHome: "العودة للرئيسية",
    comesSoon: "قريباً",
    arabicSearch: "ابحث بالعربي...",
  }
} as const;

export type TKey = keyof typeof dict.en;

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (k) => dict.en[k],
  isRtl: false,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem("sarad_lang") as Lang) || "en";
  });

  const isRtl = lang === "ar";

  useEffect(() => {
    document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
    localStorage.setItem("sarad_lang", lang);
  }, [lang, isRtl]);

  // Restore on mount
  useEffect(() => {
    const saved = localStorage.getItem("sarad_lang") as Lang | null;
    if (saved) setLangState(saved);
  }, []);

  const setLang = (l: Lang) => setLangState(l);
  const t = (key: TKey): string => dict[lang][key] as string;

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isRtl }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
