import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

class AdMobService {
  static const String _testBannerAndroid = 'ca-app-pub-3940256099942544/6300978111';
  static const String _testBannerIOS = 'ca-app-pub-3940256099942544/2934735716';

  static const String _testInterstitialAndroid = 'ca-app-pub-3940256099942544/1033173712';
  static const String _testInterstitialIOS = 'ca-app-pub-3940256099942544/4411468910';

  static const String _testNativeAndroid = 'ca-app-pub-3940256099942544/2247696110';
  static const String _testNativeIOS = 'ca-app-pub-3940256099942544/3986624511';

  static const String _testRewardedAndroid = 'ca-app-pub-3940256099942544/5224354917';
  static const String _testRewardedIOS = 'ca-app-pub-3940256099942544/1712485313';

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

  static InterstitialAd? _interstitialAd;
  static bool isInterstitialLoaded = false;
  static bool _isLoadingInterstitial = false;

  static RewardedAd? _rewardedAd;
  static bool isRewardedLoaded = false;

  static String? _currentMatchId;
  static int _interstitialsShownThisMatch = 0;
  static const int maxInterstitialsPerMatch = 2;
  static final Set<String> _visitedInterstitialScreens = {};

  static void registerMatchSession(String matchId) {
    if (_currentMatchId != matchId) {
      _currentMatchId = matchId;
      _interstitialsShownThisMatch = 0;
      _visitedInterstitialScreens.clear();
    }
  }

  static bool get canShowInterstitialThisMatch =>
      _interstitialsShownThisMatch < maxInterstitialsPerMatch;

  static Future<void> initialize() async {
    if (kIsWeb) return;
    try {
      await MobileAds.instance.initialize();
      loadInterstitialAd();
      loadRewardedAd();
    } catch (e) {
      debugPrint('[AdMobService] Warning: $e');
    }
  }

  static BannerAd createAdaptiveBannerAd({
    required Function() onAdLoaded,
    Function(LoadAdError)? onAdFailed,
  }) {
    return BannerAd(
      adUnitId: bannerAdUnitId,
      size: AdSize.banner,
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (ad) => onAdLoaded(),
        onAdFailedToLoad: (ad, error) {
          ad.dispose();
          if (onAdFailed != null) onAdFailed(error);
        },
      ),
    );
  }

  static BannerAd createBannerAd({
    required Function() onAdLoaded,
    Function(LoadAdError)? onAdFailed,
  }) {
    return createAdaptiveBannerAd(
      onAdLoaded: onAdLoaded,
      onAdFailed: onAdFailed,
    );
  }

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

          _interstitialAd!.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (ad) {
              ad.dispose();
              isInterstitialLoaded = false;
              _interstitialAd = null;
              loadInterstitialAd();
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
          isInterstitialLoaded = false;
          _isLoadingInterstitial = false;
          _interstitialAd = null;
        },
      ),
    );
  }

  static void showInterstitialAd({Function()? onComplete}) {
    if (!canShowInterstitialThisMatch) {
      if (onComplete != null) onComplete();
      return;
    }
    _interstitialsShownThisMatch++;

    if (isInterstitialLoaded && _interstitialAd != null) {
      _interstitialAd!.fullScreenContentCallback = FullScreenContentCallback(
        onAdDismissedFullScreenContent: (ad) {
          ad.dispose();
          isInterstitialLoaded = false;
          _interstitialAd = null;
          loadInterstitialAd();
          if (onComplete != null) onComplete();
        },
        onAdFailedToShowFullScreenContent: (ad, error) {
          ad.dispose();
          isInterstitialLoaded = false;
          _interstitialAd = null;
          loadInterstitialAd();
          if (onComplete != null) onComplete();
        },
      );
      _interstitialAd!.show();
    } else {
      loadInterstitialAd();
      if (onComplete != null) onComplete();
    }
  }

  static void showNaturalTransitionInterstitial({
    required String screenKey,
    required Function() onContinue,
  }) {
    if (kIsWeb) {
      onContinue();
      return;
    }
    if (!canShowInterstitialThisMatch || _visitedInterstitialScreens.contains(screenKey)) {
      onContinue();
      return;
    }
    _visitedInterstitialScreens.add(screenKey);
    showInterstitialAd(onComplete: onContinue);
  }

  static NativeAd createNativeAd({
    required Function() onAdLoaded,
    Function(LoadAdError)? onAdFailed,
  }) {
    return NativeAd(
      adUnitId: nativeAdUnitId,
      factoryId: 'cricketNativeAdFactory',
      request: const AdRequest(),
      listener: NativeAdListener(
        onAdLoaded: (ad) => onAdLoaded(),
        onAdFailedToLoad: (ad, error) {
          ad.dispose();
          if (onAdFailed != null) onAdFailed(error);
        },
      ),
    );
  }

  static void loadRewardedAd() {
    if (kIsWeb) return;
    RewardedAd.load(
      adUnitId: rewardedAdUnitId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (ad) {
          _rewardedAd = ad;
          isRewardedLoaded = true;
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
          isRewardedLoaded = false;
          _rewardedAd = null;
        },
      ),
    );
  }

  static void showRewardedAd({required Function(RewardItem reward) onUserEarnedReward}) {
    if (isRewardedLoaded && _rewardedAd != null) {
      _rewardedAd!.show(
        onUserEarnedReward: (AdWithoutView ad, RewardItem reward) {
          onUserEarnedReward(reward);
        },
      );
    } else {
      loadRewardedAd();
    }
  }

  static int get interstitialsShownThisMatch => _interstitialsShownThisMatch;
}
