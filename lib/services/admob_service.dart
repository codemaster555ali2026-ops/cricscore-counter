import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

/// Centralized AdManager service for Flutter Cricket Scoreboard App
/// Implements Google AdMob integration following the 7 specified placements:
/// 1. Home Dashboard: Adaptive Banner
/// 2. First Innings – 10 Over Summary: Native Ad
/// 3. First Innings Completed – Innings Break: Interstitial Ad
/// 4. Second Innings Start Screen: Adaptive Banner
/// 5. Second Innings – 10 Over Summary: Native Ad
/// 6. Match Completed – Before Detailed Scorecard: Interstitial Ad
/// 7. Match History / Final Report Screen: Adaptive Banner
///
/// Ad Frequency Control Rules:
/// - Maximum 2 interstitial opportunities per complete T20 match
/// - Never interrupt ball-by-ball scoring, undo, or autosave
/// - Separate match tracking to prevent duplicates
class AdMobService {
  // ==========================================
  // OFFICIAL GOOGLE ADMOB TEST AD UNIT IDS
  // Configurable for production deployment
  // ==========================================
  
  // Adaptive Banner Ad Units
  static const String _testBannerAndroid = 'ca-app-pub-3940256099942544/6300978111';
  static const String _testBannerIOS = 'ca-app-pub-3940256099942544/2934735716';

  // Interstitial Ad Units
  static const String _testInterstitialAndroid = 'ca-app-pub-3940256099942544/1033173712';
  static const String _testInterstitialIOS = 'ca-app-pub-3940256099942544/4411468910';

  // Native Ad Units
  static const String _testNativeAndroid = 'ca-app-pub-3940256099942544/2247696110';
  static const String _testNativeIOS = 'ca-app-pub-3940256099942544/3986624511';

  // Rewarded Video Ad Units (Optional extra utility)
  static const String _testRewardedAndroid = 'ca-app-pub-3940256099942544/5224354917';
  static const String _testRewardedIOS = 'ca-app-pub-3940256099942544/1712485313';

  // Platform-aware unit getters
  static String get bannerAdUnitId {
    if (kIsWeb) return _testBannerAndroid;
    if (Platform.isAndroid) return _testBannerAndroid;
    if (Platform.isIOS) return _testBannerIOS;
    return _testBannerAndroid;
  }

  static String get interstitialAdUnitId {
    if (kIsWeb) return _testInterstitialAndroid;
    if (Platform.isAndroid) return _testInterstitialAndroid;
    if (Platform.isIOS) return _testInterstitialIOS;
    return _testInterstitialAndroid;
  }

  static String get nativeAdUnitId {
    if (kIsWeb) return _testNativeAndroid;
    if (Platform.isAndroid) return _testNativeAndroid;
    if (Platform.isIOS) return _testNativeIOS;
    return _testNativeAndroid;
  }

  static String get rewardedAdUnitId {
    if (kIsWeb) return _testRewardedAndroid;
    if (Platform.isAndroid) return _testRewardedAndroid;
    if (Platform.isIOS) return _testRewardedIOS;
    return _testRewardedAndroid;
  }

  // Interstitial instance state
  static InterstitialAd? _interstitialAd;
  static bool isInterstitialLoaded = false;
  static bool _isLoadingInterstitial = false;

  // Rewarded instance state
  static RewardedAd? _rewardedAd;
  static bool isRewardedLoaded = false;

  // Frequency Control & Per-Match Tracking
  static String? _currentMatchId;
  static int _interstitialsShownThisMatch = 0;
  static const int maxInterstitialsPerMatch = 2;

  // Track screens already shown interstitials to prevent repeated triggers on revisit
  static final Set<String> _visitedInterstitialScreens = {};

  /// Call whenever a new match begins or an existing match is loaded
  static void registerMatchSession(String matchId) {
    if (_currentMatchId != matchId) {
      _currentMatchId = matchId;
      _interstitialsShownThisMatch = 0;
      _visitedInterstitialScreens.clear();
      debugPrint('[AdManager] Registered new match session: $matchId');
    }
  }

  static bool get canShowInterstitialThisMatch =>
      _interstitialsShownThisMatch < maxInterstitialsPerMatch;

  /// Call once inside main() after WidgetsFlutterBinding.ensureInitialized()
  static Future<void> initialize() async {
    if (kIsWeb) {
      debugPrint('[AdMobService] Running on Web - Mobile Ads SDK initialization skipped.');
      return;
    }

    try {
      await MobileAds.instance.initialize();
      loadInterstitialAd();
      loadRewardedAd();
      debugPrint('[AdMobService] Google Mobile Ads initialized successfully.');
    } catch (e) {
      debugPrint('[AdMobService] Initialization note: $e');
    }
  }

  /// Placement 1, 4, 7: Adaptive Banner Ad Creator
  static BannerAd createAdaptiveBannerAd({
    required Function() onAdLoaded,
    Function(LoadAdError)? onAdFailed,
  }) {
    return BannerAd(
      adUnitId: bannerAdUnitId,
      size: AdSize.banner,
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (ad) {
          debugPrint('[AdMobService] Adaptive Banner loaded.');
          onAdLoaded();
        },
        onAdFailedToLoad: (ad, error) {
          debugPrint('[AdMobService] Banner failed to load: ${error.message}');
          ad.dispose();
          if (onAdFailed != null) onAdFailed(error);
        },
        onAdOpened: (ad) => debugPrint('[AdMobService] Banner ad opened.'),
        onAdClosed: (ad) => debugPrint('[AdMobService] Banner ad closed.'),
      ),
    );
  }

  /// Preload Full-Screen Interstitial Ad safely
  static void loadInterstitialAd() {
    if (kIsWeb || _isLoadingInterstitial || isInterstitialLoaded) return;
    _isLoadingInterstitial = true;

    InterstitialAd.load(
      adUnitId: interstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitialAd = ad;
          isInterstitialLoaded = true;
          _isLoadingInterstitial = false;
          debugPrint('[AdMobService] Interstitial Ad loaded and ready.');

          _interstitialAd!.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (ad) {
              ad.dispose();
              isInterstitialLoaded = false;
              _interstitialAd = null;
              loadInterstitialAd(); // Preload next
            },
            onAdFailedToShowFullScreenContent: (ad, error) {
              ad.dispose();
              isInterstitialLoaded = false;
              _interstitialAd = null;
              loadInterstitialAd();
            },
          );
        },
        onAdFailedToLoad: (error) {
          debugPrint('[AdMobService] Interstitial Ad failed to load: ${error.message}');
          isInterstitialLoaded = false;
          _isLoadingInterstitial = false;
          _interstitialAd = null;
        },
      ),
    );
  }

  /// Safe Placement 3 & 6: Interstitial Ad Trigger
  /// - Natural screen transition only (Innings Break & Before Scorecard)
  /// - Max 2 per match
  /// - Won't repeat on back/resume visits to the same screen
  /// - Never interrupts scoring, undo or autosave
  /// - If ad is not ready, proceeds normally without blocking
  static void showNaturalTransitionInterstitial({
    required String screenKey,
    required Function() onContinue,
  }) {
    if (kIsWeb) {
      onContinue();
      return;
    }

    // Check frequency cap & revisit prevention
    if (!canShowInterstitialThisMatch || _visitedInterstitialScreens.contains(screenKey)) {
      debugPrint('[AdMobService] Interstitial skipped: screen already visited or limit reached ($interstitialsShownThisMatch/2).');
      onContinue();
      return;
    }

    _visitedInterstitialScreens.add(screenKey);

    if (isInterstitialLoaded && _interstitialAd != null) {
      _interstitialsShownThisMatch++;
      _interstitialAd!.fullScreenContentCallback = FullScreenContentCallback(
        onAdDismissedFullScreenContent: (ad) {
          ad.dispose();
          isInterstitialLoaded = false;
          _interstitialAd = null;
          loadInterstitialAd();
          onContinue();
        },
        onAdFailedToShowFullScreenContent: (ad, error) {
          ad.dispose();
          isInterstitialLoaded = false;
          _interstitialAd = null;
          loadInterstitialAd();
          onContinue();
        },
      );
      _interstitialAd!.show();
    } else {
      // Continue seamlessly if ad is not ready
      debugPrint('[AdMobService] Interstitial not ready. Proceeding without ad delay.');
      loadInterstitialAd();
      onContinue();
    }
  }

  /// Placements 2 & 5: Native Ad creator
  static NativeAd createNativeAd({
    required Function() onAdLoaded,
    Function(LoadAdError)? onAdFailed,
  }) {
    return NativeAd(
      adUnitId: nativeAdUnitId,
      factoryId: 'cricketNativeAdFactory',
      request: const AdRequest(),
      listener: NativeAdListener(
        onAdLoaded: (ad) {
          debugPrint('[AdMobService] Native ad loaded successfully.');
          onAdLoaded();
        },
        onAdFailedToLoad: (ad, error) {
          debugPrint('[AdMobService] Native ad failed to load: ${error.message}');
          ad.dispose();
          if (onAdFailed != null) onAdFailed(error);
        },
      ),
    );
  }

  /// Preload Rewarded Video Ad
  static void loadRewardedAd() {
    if (kIsWeb) return;
    RewardedAd.load(
      adUnitId: rewardedAdUnitId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (ad) {
          _rewardedAd = ad;
          isRewardedLoaded = true;
          debugPrint('[AdMobService] Rewarded Video Ad loaded and ready.');

          _rewardedAd!.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (ad) {
              ad.dispose();
              isRewardedLoaded = false;
              loadRewardedAd();
            },
            onAdFailedToShowFullScreenContent: (ad, error) {
              ad.dispose();
              isRewardedLoaded = false;
              loadRewardedAd();
            },
          );
        },
        onAdFailedToLoad: (error) {
          debugPrint('[AdMobService] Rewarded Ad failed to load: ${error.message}');
          isRewardedLoaded = false;
          _rewardedAd = null;
        },
      ),
    );
  }

  /// Show Rewarded Video Ad
  static void showRewardedAd({required Function(RewardItem reward) onUserEarnedReward}) {
    if (isRewardedLoaded && _rewardedAd != null) {
      _rewardedAd!.show(
        onUserEarnedReward: (AdWithoutView ad, RewardItem reward) {
          debugPrint('[AdMobService] User earned reward: ${reward.amount} ${reward.type}');
          onUserEarnedReward(reward);
        },
      );
    } else {
      debugPrint('[AdMobService] Rewarded Ad not ready.');
      loadRewardedAd();
    }
  }

  static int get interstitialsShownThisMatch => _interstitialsShownThisMatch;
}
