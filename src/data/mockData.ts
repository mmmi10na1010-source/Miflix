import { MediaItem } from '../types';

import heroBannerImg from '../assets/images/miflix_hero_banner_1790271134533.jpg';
import turkishPosterImg from '../assets/images/turkish_drama_poster_1790271144658.jpg';
import arabicCinemaImg from '../assets/images/arabic_cinema_poster_1790271159117.jpg';
import animeEpicImg from '../assets/images/anime_epic_poster_1790271170377.jpg';

export const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  // 1. تركي (Turkish)
  {
    id: 'tr-1',
    title: 'أسرار البوسفور',
    originalTitle: 'Boğaz Sırları',
    type: 'series',
    categoryId: 'turkish_drama',
    synopsis: 'صراع عائلي ملحمي على ضفاف البوسفور بإسطنبول حيث تتشابك خيوط النفوذ والمال مع قصة حب مستحيلة تتحدى تقاليد أكبر العائلات نفوذاً.',
    posterUrl: turkishPosterImg,
    backdropUrl: heroBannerImg,
    releaseYear: 2024,
    rating: 8.9,
    ageRating: '+16',
    genres: ['دراما', 'تشويق', 'رومانسية'],
    duration: '50 دقيقة',
    isFeatured: false,
    views: 184500, // High views -> Top trending
    isMiflixOriginal: false,
    keywords: [
      'مشاهدة مسلسل أسرار البوسفور مترجم',
      'مسلسلات تركية 2024',
      'قصة عشق',
      'دراما تركية رومانسية',
      'ايجي بست تركي'
    ],
    seasons: [
      {
        id: 'tr-1-s1',
        seasonNumber: 1,
        title: 'الموسم الأول',
        episodes: [
          {
            id: 'tr-1-s1-e1',
            episodeNumber: 1,
            title: 'الحلقة 1: ليلة العودة',
            description: 'يعود كمال إلى إسطنبول بعد غياب خمس سنوات ليكتشف أن قصر العائلة أصبح تحت سيطرة عائلة أرسلان الغريمة.',
            duration: '48 دقيقة',
            views: 92000,
            servers: [
              { id: 's1', name: 'سيرفر 1 (سريع VIP)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', quality: '1080p FHD', type: 'direct' },
              { id: 's2', name: 'سيرفر 2 (Ultra 4K)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', quality: '4K UHD', type: 'direct' },
              { id: 's3', name: 'سيرفر 3 (احتياطي)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', quality: '720p HD', type: 'direct' }
            ]
          },
          {
            id: 'tr-1-s1-e2',
            episodeNumber: 2,
            title: 'الحلقة 2: المواجهة الأولى',
            description: 'تتصاعد حدة التوتر في اجتماع مجلس الإدارة بعد إعلان كمال عن امتلاكه أسهماً تمنحه حق الفيتو.',
            duration: '51 دقيقة',
            views: 45000,
            servers: [
              { id: 's1', name: 'سيرفر 1 (سريع VIP)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', quality: '1080p FHD', type: 'direct' },
              { id: 's2', name: 'سيرفر 2 (Ultra 4K)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', quality: '4K UHD', type: 'direct' }
            ]
          }
        ]
      }
    ],
    createdAt: '2025-01-10'
  },
  {
    id: 'tr-2',
    title: 'قيامة المحارب',
    originalTitle: 'Savaşçının Doğuşu',
    type: 'series',
    categoryId: 'turkish_drama',
    synopsis: 'ملحمة تاريخية أسطورية تدور في القرن الثالث عشر حول تأسيس دولة جديدة وصراعات الفرسان والمكائد العسكرية في قلب الأناضول.',
    posterUrl: turkishPosterImg,
    backdropUrl: heroBannerImg,
    releaseYear: 2023,
    rating: 9.1,
    ageRating: '+16',
    genres: ['تاريخي', 'حربي', 'أكشن ملحمي'],
    duration: '60 دقيقة',
    isFeatured: false,
    views: 142000,
    isMiflixOriginal: false,
    seasons: [
      {
        id: 'tr-2-s1',
        seasonNumber: 1,
        title: 'الموسم 1',
        episodes: [
          {
            id: 'tr-2-s1-e1',
            episodeNumber: 1,
            title: 'الحلقة 1: راية الأجداد',
            duration: '62 دقيقة',
            views: 71000,
            servers: [
              { id: 's1', name: 'سيرفر 1 (سريع VIP)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', quality: '1080p FHD', type: 'direct' },
              { id: 's2', name: 'سيرفر 2 (Ultra 4K)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', quality: '4K UHD', type: 'direct' }
            ]
          }
        ]
      }
    ],
    createdAt: '2025-01-12'
  },
  {
    id: 'tr-3',
    title: 'طائر النار',
    originalTitle: 'Ateş Kuşları',
    type: 'series',
    categoryId: 'turkish_drama',
    synopsis: 'قصة إنسانية مؤثرة لخمسة أطفال شوارع يواجهون قسوة الحياة معاً ويصنعون عائلتهم الخاصة رغم كل العواصف.',
    posterUrl: turkishPosterImg,
    backdropUrl: heroBannerImg,
    releaseYear: 2024,
    rating: 8.5,
    ageRating: '+13',
    genres: ['دراما اجتماعية', 'إنساني'],
    duration: '45 دقيقة',
    views: 96000,
    seasons: [
      {
        id: 'tr-3-s1',
        seasonNumber: 1,
        title: 'الموسم 1',
        episodes: [
          {
            id: 'tr-3-s1-e1',
            episodeNumber: 1,
            title: 'الحلقة 1: البدايات الأولى',
            duration: '45 دقيقة',
            views: 48000,
            servers: [
              { id: 's1', name: 'سيرفر 1 (سريع VIP)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', quality: '1080p FHD', type: 'direct' }
            ]
          }
        ]
      }
    ],
    createdAt: '2025-02-01'
  },

  // 2. عربي (Arabic)
  {
    id: 'ar-1',
    title: 'صائد الظلال',
    originalTitle: 'Shadow Hunter',
    type: 'movie',
    categoryId: 'arabic_cinema',
    synopsis: 'في شوارع القاهرة والرياض الصاخبة، يتعقب محقق استخباراتي بارع شبكة جرائم مالية وإلكترونية دولية تتخطى الحدود قبل ضربتها الكبرى.',
    posterUrl: arabicCinemaImg,
    backdropUrl: heroBannerImg,
    releaseYear: 2024,
    rating: 8.8,
    ageRating: '+16',
    genres: ['جريمة', 'غموض', 'إثارة وتشويق'],
    duration: 'ساعتان و 12 دقيقة',
    isFeatured: false,
    views: 220000, // Very high -> Top trending
    keywords: [
      'مشاهدة فيلم صائد الظلال كامل',
      'تحميل فيلم صائد الظلال 1080p',
      'افلام عربي 2024 سينما',
      'ماي سيما صائد الظلال',
      'ايجي بست افلام اكشن'
    ],
    servers: [
      { id: 's1', name: 'سيرفر 1 (سريع VIP)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', quality: '4K UHD', type: 'direct' },
      { id: 's2', name: 'سيرفر 2 (FHD متعدد الجودات)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', quality: '1080p', type: 'direct' },
      { id: 's3', name: 'سيرفر 3 (خفيف للموبايل)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', quality: '720p', type: 'direct' }
    ],
    createdAt: '2025-01-15'
  },
  {
    id: 'ar-2',
    title: 'كيرة والجن: ملحمة المقاومة',
    originalTitle: 'Kira & El Gin',
    type: 'movie',
    categoryId: 'arabic_cinema',
    synopsis: 'ملحمة بطولية ترصد تكاتف نخبة من الفدائيين الأحرار في مواجهة الاحتلال البريطاني إبان ثورة 1919 في واحدة من أضخم الإنتاجات السينمائية العربية.',
    posterUrl: arabicCinemaImg,
    backdropUrl: heroBannerImg,
    releaseYear: 2023,
    rating: 9.0,
    ageRating: '+16',
    genres: ['تاريخي', 'أكشن', 'دراما وطنية'],
    duration: 'ساعتان و 45 دقيقة',
    views: 165000,
    servers: [
      { id: 's1', name: 'سيرفر 1 (سريع VIP)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', quality: '4K UHD', type: 'direct' },
      { id: 's2', name: 'سيرفر 2 (FHD 1080p)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', quality: '1080p', type: 'direct' }
    ],
    createdAt: '2025-01-18'
  },
  {
    id: 'ar-3',
    title: 'رمال الذهب',
    originalTitle: 'Golden Sands',
    type: 'movie',
    categoryId: 'arabic_cinema',
    synopsis: 'رحلة استكشافية مشحونة بالمخاطر في صحراء الربع الخالي بحثاً عن كنز أثري مدفون منذ ألف عام يطمع فيه صيادو الآثار الدوليون.',
    posterUrl: arabicCinemaImg,
    backdropUrl: heroBannerImg,
    releaseYear: 2024,
    rating: 8.3,
    ageRating: '+13',
    genres: ['مغامرة', 'تشويق', 'إثارة'],
    duration: 'ساعة و 54 دقيقة',
    views: 89000,
    servers: [
      { id: 's1', name: 'سيرفر 1 (سريع VIP)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', quality: '1080p', type: 'direct' }
    ],
    createdAt: '2025-02-05'
  },

  // 3. أجنبي (Foreign / Hollywood)
  {
    id: 'hw-1',
    title: 'المحيط السيبراني: البروتوكول الأخير',
    originalTitle: 'Cyber Void: Final Protocol',
    type: 'movie',
    categoryId: 'hollywood',
    synopsis: 'في عام 2088، يحاول فريق من قراصنة الذاكرة والعملاء السابقين إيقاف نظام ذكاء اصطناعي بعد سيطرته على شبكة الطاقة والاتصالات العالمية.',
    posterUrl: heroBannerImg,
    backdropUrl: heroBannerImg,
    releaseYear: 2024,
    rating: 8.9,
    ageRating: '+16',
    genres: ['خيال علمي', 'أكشن', 'إثارة'],
    duration: 'ساعتان و 18 دقيقة',
    isFeatured: true, // Main featured banner
    views: 310000, // Top 1 view
    servers: [
      { id: 's1', name: 'سيرفر 1 (سريع VIP 4K)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', quality: '4K HDR', type: 'direct' },
      { id: 's2', name: 'سيرفر 2 (FHD 1080p)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', quality: '1080p', type: 'direct' },
      { id: 's3', name: 'سيرفر 3 (سيرفر احتياطي دولي)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', quality: '1080p', type: 'direct' }
    ],
    createdAt: '2025-01-01'
  },
  {
    id: 'hw-2',
    title: 'أوبنهايمر',
    originalTitle: 'Oppenheimer',
    type: 'movie',
    categoryId: 'hollywood',
    synopsis: 'السيرة الذاتية الملحمية للعالم الفيزيائي روبرت أوبنهايمر ودوره المحوري في مشروع مانهاتن الذي غيّر تاريخ البشرية إلى الأبد.',
    posterUrl: heroBannerImg,
    backdropUrl: heroBannerImg,
    releaseYear: 2023,
    rating: 9.2,
    ageRating: '+16',
    genres: ['سيرة ذاتية', 'دراما تاريخية'],
    duration: '3 ساعات',
    views: 198000,
    servers: [
      { id: 's1', name: 'سيرفر 1 (سريع VIP)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', quality: '4K UHD', type: 'direct' }
    ],
    createdAt: '2025-01-04'
  },
  {
    id: 'hw-3',
    title: 'كثيب: الجزء الثاني',
    originalTitle: 'Dune: Part Two',
    type: 'movie',
    categoryId: 'hollywood',
    synopsis: 'يواصل بول أتريديس رحلته الملحمية متحالفا مع تشاني والفريمن في مسعى للانتقام من المتآمرين الذين دمروا عائلته وصراعه للسيطرة على كوكب أراكيس.',
    posterUrl: heroBannerImg,
    backdropUrl: heroBannerImg,
    releaseYear: 2024,
    rating: 9.0,
    ageRating: '+13',
    genres: ['خيال علمي', 'مغامرة فضاء'],
    duration: 'ساعتان و 46 دقيقة',
    views: 154000,
    servers: [
      { id: 's1', name: 'سيرفر 1 (سريع VIP)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', quality: '4K UHD', type: 'direct' }
    ],
    createdAt: '2025-01-08'
  },

  // 4. أنمي (Anime)
  {
    id: 'an-1',
    title: 'سيف الظلال: بوابة الفوضى',
    originalTitle: 'Kage no Yaiba',
    type: 'series',
    categoryId: 'anime',
    synopsis: 'في عالم تسكنه أطياف الظلام، يوقظ فتى يتيم قوة نصل سحري موروث من سلالة حراس العوالم ويبدأ معركته ضد كائنات الهاوية.',
    posterUrl: animeEpicImg,
    backdropUrl: animeEpicImg,
    releaseYear: 2024,
    rating: 9.3,
    ageRating: '+16',
    genres: ['أنمي خيال', 'أكشن', 'قوى خارقة'],
    duration: '24 دقيقة',
    views: 172000,
    seasons: [
      {
        id: 'an-1-s1',
        seasonNumber: 1,
        title: 'الموسم الأول',
        episodes: [
          {
            id: 'an-1-s1-e1',
            episodeNumber: 1,
            title: 'الحلقة 1: وريث اللهب',
            description: 'يكتشف رين حقيقة العلامة الموشومة على ذراعه حين يهاجم وحش من الرتبة العليا قريته المعزولة.',
            duration: '24 دقيقة',
            views: 86000,
            servers: [
              { id: 's1', name: 'سيرفر 1 (بلوراي)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', quality: '1080p FHD', type: 'direct' },
              { id: 's2', name: 'سيرفر 2 (Ultra 4K)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', quality: '4K UHD', type: 'direct' }
            ]
          }
        ]
      }
    ],
    createdAt: '2025-01-20'
  },
  {
    id: 'an-2',
    title: 'هجوم العمالقة: الفصل الأخير',
    originalTitle: 'Attack on Titan: The Final Chapter',
    type: 'series',
    categoryId: 'anime',
    synopsis: 'المعركة الفاصلة لمصير البشرية بأكملها، حيث تتصارع أيديولوجيات الحرية والانتقام في ذروة أحداث واحدة من أعظم سلاسل الأنمي في التاريخ.',
    posterUrl: animeEpicImg,
    backdropUrl: animeEpicImg,
    releaseYear: 2023,
    rating: 9.6,
    ageRating: '+18',
    genres: ['أنمي سينمائي', 'ملحمة عسكرية'],
    duration: '28 دقيقة',
    views: 240000, // Very high trending
    seasons: [
      {
        id: 'an-2-s1',
        seasonNumber: 1,
        title: 'القسم الختامي',
        episodes: [
          {
            id: 'an-2-s1-e1',
            episodeNumber: 1,
            title: 'حلقة خاصة: دوي الأرض',
            duration: '60 دقيقة',
            views: 120000,
            servers: [
              { id: 's1', name: 'سيرفر 1 (بلوراي أصلي)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', quality: '4K UHD', type: 'direct' }
            ]
          }
        ]
      }
    ],
    createdAt: '2025-01-22'
  },
  {
    id: 'an-3',
    title: 'سولو ليفلينج: ارتقاء الظل',
    originalTitle: 'Solo Leveling',
    type: 'series',
    categoryId: 'anime',
    synopsis: 'بعد أن كان أضعف صياد في العالم أجمع، يحصل سونغ جين وو على فرصة لا مثيل لها عبر نظام مهام فريد يمنحه قوة لا نهائية للتطور بمفرده.',
    posterUrl: animeEpicImg,
    backdropUrl: animeEpicImg,
    releaseYear: 2024,
    rating: 9.2,
    ageRating: '+16',
    genres: ['أكشن', 'فانتازيا سحرية', 'مغامرة'],
    duration: '24 دقيقة',
    views: 135000,
    seasons: [
      {
        id: 'an-3-s1',
        seasonNumber: 1,
        title: 'الموسم الأول',
        episodes: [
          {
            id: 'an-3-s1-e1',
            episodeNumber: 1,
            title: 'الحلقة 1: الصياد الأضعف',
            duration: '24 دقيقة',
            views: 67000,
            servers: [
              { id: 's1', name: 'سيرفر 1 (سريع VIP)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', quality: '1080p', type: 'direct' }
            ]
          }
        ]
      }
    ],
    createdAt: '2025-01-25'
  },

  // 5. أعمال MIFLIX (MIFLIX Originals)
  {
    id: 'mf-1',
    title: 'أسرار المملكة: فجر جديد',
    originalTitle: 'Kingdom of Secrets: New Dawn',
    type: 'series',
    categoryId: 'miflix_originals',
    synopsis: 'إنتاج أصلي حصري من MIFLIX. دراما سياسية وتشويقية ضخمة تروي كواليس النفوذ والمصالح والتحديات الاستراتيجية في منطقة الشرق الأوسط برؤية سينمائية عالمية غير مسبوقة.',
    posterUrl: heroBannerImg,
    backdropUrl: heroBannerImg,
    releaseYear: 2025,
    rating: 9.4,
    ageRating: '+16',
    genres: ['إنتاج MIFLIX الأصلي', 'إثارة سياسية', 'دراما معاصرة'],
    duration: '55 دقيقة',
    isFeatured: true,
    views: 295000, // Top rank in views
    isMiflixOriginal: true,
    seasons: [
      {
        id: 'mf-1-s1',
        seasonNumber: 1,
        title: 'الموسم 1: شبكة النفوذ',
        episodes: [
          {
            id: 'mf-1-s1-e1',
            episodeNumber: 1,
            title: 'الحلقة 1: عاصفة الرياض',
            description: 'انفجار تسريب سري يهز أروقة الدبلوماسية الدولية ويضع فريق المهام الخاصة أمام 24 ساعة لاحتواء الأزمة.',
            duration: '56 دقيقة',
            views: 147000,
            servers: [
              { id: 's1', name: 'سيرفر 1 (MIFLIX CDN فائقة السرعة)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', quality: '4K Dolby Vision', type: 'direct' },
              { id: 's2', name: 'سيرفر 2 (MIFLIX FHD 1080p)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', quality: '1080p 60fps', type: 'direct' }
            ]
          }
        ]
      }
    ],
    createdAt: '2025-02-10'
  },
  {
    id: 'mf-2',
    title: 'المهمة صفر: ليلة بيروت',
    originalTitle: 'Mission Zero: Beirut Night',
    type: 'movie',
    categoryId: 'miflix_originals',
    synopsis: 'فيلم الإثارة والأكشن الحصري من MIFLIX. عملية إنقاذ سرية تجري تحت جنح الظلام في قلب ميناء بيروت لإنقاذ عالم تكنولوجيا محتجز.',
    posterUrl: arabicCinemaImg,
    backdropUrl: heroBannerImg,
    releaseYear: 2025,
    rating: 8.9,
    ageRating: '+16',
    genres: ['إنتاج MIFLIX الأصلي', 'أكشن', 'إثارة ومطاردات'],
    duration: 'ساعتان و 5 دقائق',
    views: 180000,
    isMiflixOriginal: true,
    servers: [
      { id: 's1', name: 'سيرفر 1 (MIFLIX CDN فائقة السرعة)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', quality: '4K UHD', type: 'direct' },
      { id: 's2', name: 'سيرفر 2 (MIFLIX FHD)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', quality: '1080p', type: 'direct' }
    ],
    createdAt: '2025-02-14'
  }
];
