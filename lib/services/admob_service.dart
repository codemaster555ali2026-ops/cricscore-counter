import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

class AdMobService {
  // ==========================================
  // OFFICIAL GOOGLE ADMOB TEST AD UNIT IDS
  // Replace these with your live Ad Unit IDs before releasing to Google Play / App Store
  // ==========================================
  
  // Banner Ad Units
  static const String _testBannerAndroid = 'ca-app-pub-3940256099942544/6300978111';
  static const String _testBannerIOS = 'ca-app-pub-3940256099942544/2934735716';

  // Interstitial Ad Units
  static const String _testInterstitialAndroid = 'ca-app-pub-3940256099942544/1033173712';
  static const String _testInterstitialIOS = 'ca-app-pub-3940256099942544/4411468910';

  // Rewarded Video Ad Units
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

  static String get rewardedAdUnitId {
    if (kIsWeb) return _testRewardedAndroid;
    if (Platform.isAndroid) return _testRewardedAndroid;
    if (Platform.isIOS) return _testRewardedIOS;
    return _testRewardedAndroid;
  }

  // State management
  static InterstitialAd? _interstitialAd;
  static bool isInterstitialLoaded = false;

  static RewardedAd? _rewardedAd;
  static bool isRewardedLoaded = false;

  // Strict Global Match Ads Cap: max 8 all types of ads in entire match
  static int matchAdsShown = 0;
  static const int maxAdsPerMatch = 8;
  static bool get canShowAd => matchAdsShown < maxAdsPerMatch;

  static void resetMatchAds() {
    matchAdsShown = 0;
  }

  /// Call once inside main() after WidgetsFlutterBinding.ensureInitialized()
  static Future<void> initialize() async {
    try {
      await MobileAds.instance.initialize();
      loadInterstitialAd();
      loadRewardedAd();
      debugPrint('[AdMobService] Google Mobile Ads initialized successfully.');
    } catch (e) {
      debugPrint('[AdMobService] Initialization warning: $e');
    }
  }

  /// Create and load a 320x50 Banner Ad
  static BannerAd createBannerAd({
    required Function() onAdLoaded,
    Function(LoadAdError)? onAdFailed,
  }) {
    return BannerAd(
      adUnitId: bannerAdUnitId,
      size: AdSize.banner,
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (ad) {
          debugPrint('[AdMobService] Banner Ad loaded successfully.');
          onAdLoaded();
        },
        onAdFailedToLoad: (ad, error) {
          debugPrint('[AdMobService] Banner Ad failed to load: ${error.message}');
          ad.dispose();
          if (onAdFailed != null) onAdFailed(error);
        },
        onAdOpened: (ad) => debugPrint('[AdMobService] Banner ad opened.'),
        onAdClosed: (ad) => debugPrint('[AdMobService] Banner ad closed.'),
      ),
    );
  }

  /// Preload Full-Screen Interstitial Ad
  static void loadInterstitialAd() {
    InterstitialAd.load(
      adUnitId: interstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitialAd = ad;
          isInterstitialLoaded = true;
          debugPrint('[AdMobService] Interstitial Ad loaded and ready.');
          
          _interstitialAd!.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (ad) {
              ad.dispose();
              isInterstitialLoaded = false;
              loadInterstitialAd(); // Immediately preload next ad
            },
            onAdFailedToShowFullScreenContent: (ad, error) {
              ad.dispose();
              isInterstitialLoaded = false;
              loadInterstitialAd();
            },
          );
        },
        onAdFailedToLoad: (error) {
          debugPrint('[AdMobService] Interstitial Ad failed to load: ${error.message}');
          isInterstitialLoaded = false;
          _interstitialAd = null;
        },
      ),
    );
  }

  /// Show Interstitial Ad (strictly max 8 all types of ads in entire match)
  static void showInterstitialAd({Function()? onComplete}) {
    if (!canShowAd) {
      debugPrint('[AdMobService] Strict match limit of 8 ads reached. Not showing interstitial ad.');
      if (onComplete != null) onComplete();
      return;
    }
    matchAdsShown++;

    if (isInterstitialLoaded && _interstitialAd != null) {
      _interstitialAd!.show();
      if (onComplete != null) onComplete();
    } else {
      debugPrint('[AdMobService] Interstitial Ad was not ready yet, preloading...');
      loadInterstitialAd();
      if (onComplete != null) onComplete();
    }
  }

  /// Preload Rewarded Video Ad
  static void loadRewardedAd() {
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
              loadRewardedAd(); // Preload next
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

  /// Show Rewarded Video Ad and trigger reward callback (strictly max 8 all types of ads in entire match)
  static void showRewardedAd({required Function(RewardItem reward) onUserEarnedReward}) {
    if (!canShowAd) {
      debugPrint('[AdMobService] Strict match limit of 8 ads reached. Not showing rewarded ad.');
      return;
    }
    matchAdsShown++;

    if (isRewardedLoaded && _rewardedAd != null) {
      _rewardedAd!.show(
        onUserEarnedReward: (AdWithoutView ad, RewardItem reward) {
          debugPrint('[AdMobService] User earned reward: ${reward.amount} ${reward.type}');
          onUserEarnedReward(reward);
        },
      );
    } else {
      debugPrint('[AdMobService] Rewarded Ad not ready. Preloading...');
      loadRewardedAd();
    }
  }
}
