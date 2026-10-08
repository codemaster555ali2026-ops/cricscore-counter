export interface FlutterFile {
  path: string;
  name: string;
  category: 'config' | 'main' | 'models' | 'services' | 'screens' | 'widgets';
  content: string;
}

export const FLUTTER_CODEBASE: FlutterFile[] = [
  {
    path: '.github/workflows/build_apk.yml',
    name: 'build_apk.yml',
    category: 'config',
    content: `name: Build Cricket Scoreboard APK

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-apk:
    name: Build Android Release APK
    runs-on: ubuntu-latest
    timeout-minutes: 25

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Java 17
        uses: actions/setup-java@v5
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      - name: Set up Flutter SDK (Latest Stable)
        uses: subosito/flutter-action@v2
        with:
          channel: 'stable'
          cache: true

      - name: Prepare Android Platform & Wrapper
        run: |
          flutter config --no-analytics
          rm -f ./android/build.gradle.kts ./android/app/build.gradle.kts ./android/settings.gradle.kts || true
          chmod +x ./android/gradlew || true

      - name: Install Dependencies
        run: flutter pub get

      - name: Compile Android Release APK
        run: flutter build apk --release --no-tree-shake-icons --android-skip-build-dependency-validation

      - name: Upload Release APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: CricketScoreboard-Release-APK
          path: build/app/outputs/flutter-apk/app-release.apk
          if-no-files-found: error
          retention-days: 14`
  },
  {
    path: 'codemagic.yaml',
    name: 'codemagic.yaml',
    category: 'config',
    content: `workflows:
  android-release-workflow:
    name: Build Cricket Scoreboard Android APK (Release)
    max_build_duration: 30
    instance_type: linux_x2
    environment:
      flutter: stable
      java: 17
    scripts:
      - name: Set up local.properties
        script: |
          echo "flutter.sdk=\\$FLUTTER_ROOT" > "\\$CM_BUILD_DIR/android/local.properties"
      - name: Get Flutter packages
        script: |
          flutter packages pub get
      - name: Build Android Release APK
        script: |
          flutter build apk --release --no-tree-shake-icons --android-skip-build-dependency-validation
    artifacts:
      - build/**/outputs/**/*.apk
      - build/**/outputs/**/mapping.txt
    publishing:
      email:
        recipients:
          - codemaster555ali2026@gmail.com
        notify:
          success: true
          failure: true`
  },
  {
    path: 'android/build.gradle',
    name: 'build.gradle',
    category: 'config',
    content: `allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.buildDir = '../build'
subprojects {
    project.buildDir = "\${rootProject.buildDir}/\${project.name}"
}
subprojects {
    project.evaluationDependsOn(':app')
}

tasks.register("clean", Delete) {
    delete rootProject.buildDir
}`
  },
  {
    path: 'android/settings.gradle',
    name: 'settings.gradle',
    category: 'config',
    content: `pluginManagement {
    def flutterSdkPath = {
        def properties = new Properties()
        file("local.properties").withInputStream { properties.load(it) }
        def flutterSdkPath = properties.getProperty("flutter.sdk")
        assert flutterSdkPath != null : "flutter.sdk not set in local.properties"
        return flutterSdkPath
    }()

    includeBuild("$flutterSdkPath/packages/flutter_tools/gradle")

    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

plugins {
    id "dev.flutter.flutter-plugin-loader" version "1.0.0"
    id "com.android.application" version "8.3.2" apply false
    id "org.jetbrains.kotlin.android" version "2.0.20" apply false
}

include ":app"`
  },
  {
    path: 'android/app/build.gradle',
    name: 'app/build.gradle',
    category: 'config',
    content: `plugins {
    id "com.android.application"
    id "org.jetbrains.kotlin.android"
    id "dev.flutter.flutter-gradle-plugin"
}

android {
    namespace "com.cricket.scoreboard.cricket_scoreboard_15phases"
    compileSdk = 36
    ndkVersion flutter.ndkVersion

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = '17'
    }

    defaultConfig {
        applicationId "com.cricket.scoreboard.cricket_scoreboard_15phases"
        minSdkVersion 21
        targetSdkVersion 36
        versionCode 1
        versionName "1.0"
        multiDexEnabled true
    }

    buildTypes {
        release {
            signingConfig signingConfigs.debug
            minifyEnabled false
            shrinkResources false
        }
    }
}

flutter {
    source '../..'
}

dependencies {
    implementation "org.jetbrains.kotlin:kotlin-stdlib:1.9.22"
    implementation 'androidx.multidex:multidex:2.0.1'
    implementation 'com.google.android.gms:play-services-ads:23.0.0'
}`
  },
  {
    path: 'android/gradle.properties',
    name: 'gradle.properties',
    category: 'config',
    content: `org.gradle.jvmargs=-Xmx4G -XX:MaxMetaspaceSize=1G
android.useAndroidX=true
android.enableJetifier=true
android.newDsl=false
android.builtInKotlin=false`
  },
  {
    path: 'android/gradle/wrapper/gradle-wrapper.properties',
    name: 'gradle-wrapper.properties',
    category: 'config',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.14-all.zip`
  },
  {
    path: 'android/app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    category: 'config',
    content: `<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    <uses-permission android:name="android.permission.WAKE_LOCK"/>

    <application
        android:label="Cricket Scoreboard"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher"
        android:hardwareAccelerated="true">

        <!-- Google AdMob Application ID -->
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-3940256099942544~3347511713"/>

        <meta-data
            android:name="com.google.android.gms.ads.flag.OPTIMIZE_INITIALIZATION"
            android:value="true"/>
        <meta-data
            android:name="com.google.android.gms.ads.flag.OPTIMIZE_AD_LOADING"
            android:value="true"/>

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>

        <!-- Flutter v2 Embedding Declaration -->
        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>`
  },
  {
    path: 'android/app/src/main/kotlin/com/cricket/scoreboard/cricket_scoreboard_15phases/MainActivity.kt',
    name: 'MainActivity.kt (Flutter v2 Embedding)',
    category: 'config',
    content: `package com.cricket.scoreboard.cricket_scoreboard_15phases

import io.flutter.embedding.android.FlutterActivity

class MainActivity: FlutterActivity() {
}`
  },
  {
    path: 'android/app/src/main/res/values/styles.xml',
    name: 'styles.xml',
    category: 'config',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="LaunchTheme" parent="@android:style/Theme.Black.NoTitleBar">
        <item name="android:windowBackground">@drawable/launch_background</item>
    </style>
    <style name="NormalTheme" parent="@android:style/Theme.Black.NoTitleBar">
        <item name="android:windowBackground">?android:colorBackground</item>
    </style>
</resources>`
  },
  {
    path: 'android/app/src/main/res/values/colors.xml',
    name: 'colors.xml',
    category: 'config',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0B192C</color>
</resources>`
  },
  {
    path: 'android/app/src/main/res/drawable/launch_background.xml',
    name: 'launch_background.xml',
    category: 'config',
    content: `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@android:color/black" />
</layer-list>`
  },
  {
    path: 'ios/Runner/Info.plist',
    name: 'Info.plist',
    category: 'config',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleName</key>
	<string>Cricket Scoreboard</string>
	<key>CFBundleIdentifier</key>
	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>GADApplicationIdentifier</key>
	<string>ca-app-pub-3940256099942544~1458002511</string>
</dict>
</plist>`
  },
  {
    path: 'pubspec.yaml',
    name: 'pubspec.yaml',
    category: 'config',
    content: `name: cricket_scoreboard_15phases
description: "Cricket Scoreboard App - 15 Phases: Complete Data, Smart Features, Professional Experience"
publish_to: "none"
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.5.1
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  google_mobile_ads: ^5.1.0
  intl: ^0.19.0
  google_fonts: ^6.2.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true`
  },
  {
    path: 'lib/main.dart',
    name: 'main.dart',
    category: 'main',
    content: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'services/admob_service.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  await MobileAds.instance.initialize();
  AdMobService.initialize();

  runApp(const ProviderScope(child: CricketScoreboardApp()));
}

class CricketScoreboardApp extends StatelessWidget {
  const CricketScoreboardApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cricket Scoreboard App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(useMaterial3: true),
      home: const HomeScreen(),
    );
  }
}`
  },
  {
    path: 'lib/services/admob_service.dart',
    name: 'admob_service.dart',
    category: 'services',
    content: `import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

class AdMobService {
  static const String _testBannerAndroid = 'ca-app-pub-3940256099942544/6300978111';
  static const String _testBannerIOS = 'ca-app-pub-3940256099942544/2934735716';
  static const String _testInterstitialAndroid = 'ca-app-pub-3940256099942544/1033173712';
  static const String _testInterstitialIOS = 'ca-app-pub-3940256099942544/4411468910';
  static const String _testRewardedAndroid = 'ca-app-pub-3940256099942544/5224354917';

  static String get bannerAdUnitId => kIsWeb || Platform.isAndroid ? _testBannerAndroid : _testBannerIOS;
  static String get interstitialAdUnitId => kIsWeb || Platform.isAndroid ? _testInterstitialAndroid : _testInterstitialIOS;

  static InterstitialAd? _interstitialAd;
  static bool isInterstitialLoaded = false;

  static void initialize() {
    loadInterstitialAd();
  }

  static BannerAd createBannerAd({required Function() onAdLoaded}) {
    return BannerAd(
      adUnitId: bannerAdUnitId,
      size: AdSize.banner,
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (ad) => onAdLoaded(),
        onAdFailedToLoad: (ad, error) => ad.dispose(),
      ),
    );
  }

  static void loadInterstitialAd() {
    InterstitialAd.load(
      adUnitId: interstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitialAd = ad;
          isInterstitialLoaded = true;
          _interstitialAd!.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (ad) {
              ad.dispose();
              isInterstitialLoaded = false;
              loadInterstitialAd();
            },
          );
        },
        onAdFailedToLoad: (error) {
          isInterstitialLoaded = false;
          _interstitialAd = null;
        },
      ),
    );
  }

  static void showInterstitialAd({Function()? onComplete}) {
    if (isInterstitialLoaded && _interstitialAd != null) {
      _interstitialAd!.show();
    } else {
      loadInterstitialAd();
    }
    if (onComplete != null) onComplete();
  }
}`
  },
  {
    path: 'lib/widgets/ad_banner_widget.dart',
    name: 'ad_banner_widget.dart',
    category: 'widgets',
    content: `import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import '../services/admob_service.dart';

class AdBannerWidget extends StatefulWidget {
  const AdBannerWidget({super.key});

  @override
  State<AdBannerWidget> createState() => _AdBannerWidgetState();
}

class _AdBannerWidgetState extends State<AdBannerWidget> {
  BannerAd? _bannerAd;
  bool _isBannerLoaded = false;

  @override
  void initState() {
    super.initState();
    _bannerAd = AdMobService.createBannerAd(
      onAdLoaded: () {
        if (mounted) setState(() => _isBannerLoaded = true);
      },
    );
    _bannerAd?.load();
  }

  @override
  void dispose() {
    _bannerAd?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isBannerLoaded || _bannerAd == null) {
      return Container(
        height: 50,
        color: const Color(0xFF0F172A),
        alignment: Alignment.center,
        child: const Text('Google AdMob Banner (320x50)', style: TextStyle(color: Colors.white38, fontSize: 11)),
      );
    }
    return SizedBox(
      width: _bannerAd!.size.width.toDouble(),
      height: _bannerAd!.size.height.toDouble(),
      child: AdWidget(ad: _bannerAd!),
    );
  }
}`
  },
  {
    path: 'lib/screens/live_scoring_screen.dart',
    name: 'live_scoring_screen.dart',
    category: 'screens',
    content: `import 'package:flutter/material.dart';
import '../models/match_model.dart';
import '../services/admob_service.dart';
import '../widgets/ad_banner_widget.dart';

class LiveScoringScreen extends StatefulWidget {
  final Team teamA;
  final Team teamB;
  final int totalOvers;
  final int? target;

  const LiveScoringScreen({super.key, required this.teamA, required this.teamB, required this.totalOvers, this.target});

  @override
  State<LiveScoringScreen> createState() => _LiveScoringScreenState();
}

class _LiveScoringScreenState extends State<LiveScoringScreen> {
  int _totalRuns = 0;
  int _wickets = 0;
  int _completedOvers = 0;
  int _ballsInCurrentOver = 0;
  bool _isMatchCompleted = false;
  bool _isInningsCompleted = false;
  String _resultText = '';

  // Max 8 ads cap per match
  int _matchAdsShown = 0;
  static const int maxMatchAds = 8;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _triggerAdIfUnderCap(); // AUTOMATIC AD: MATCH START
    });
  }

  bool _isMilestoneOver(int completedOvers, int totalOvers) {
    if (totalOvers <= 5) return false;
    if (totalOvers <= 10) return completedOvers == 5;
    final o1 = (totalOvers * 0.25).round();
    final o2 = (totalOvers * 0.55).round();
    final o3 = (totalOvers * 0.80).round();
    return completedOvers == o1 || completedOvers == o2 || completedOvers == o3;
  }

  void _triggerAdIfUnderCap() {
    if (_matchAdsShown < maxMatchAds) {
      _matchAdsShown++;
      AdMobService.showInterstitialAd();
    }
  }

  void _recordBall(int runs, {bool isWicket = false, bool isWide = false}) {
    // STRICT BLOCK: Never allow ball scoring if match/innings complete or overs limit reached
    if (_isMatchCompleted || _isInningsCompleted || _completedOvers >= widget.totalOvers) return;

    setState(() {
      _totalRuns += runs;
      if (isWicket) _wickets++;

      // Check if target is chased on any delivery
      if (widget.target != null && _totalRuns >= widget.target!) {
        _isMatchCompleted = true;
        _resultText = '\${widget.teamA.name} won by \${10 - _wickets} wickets!';
        _triggerAdIfUnderCap();
        return;
      }

      if (!isWide) {
        _ballsInCurrentOver++;

        if (_ballsInCurrentOver == 6) {
          _completedOvers++;
          _ballsInCurrentOver = 0;

          // Check if total overs reached (e.g. 20.0 overs)
          if (_completedOvers >= widget.totalOvers || _wickets >= 10) {
            if (widget.target != null) {
              _isMatchCompleted = true;
              if (_totalRuns == widget.target! - 1) {
                _resultText = 'Match Tied! Both teams scored \$_totalRuns runs.';
              } else {
                final runsDefended = widget.target! - 1 - _totalRuns;
                _resultText = '\${widget.teamB.name} won by \$runsDefended runs!';
              }
            } else {
              _isInningsCompleted = true; // 1st innings complete, stop balls!
            }
            _triggerAdIfUnderCap();
            return;
          }

          // SMART OVER AD: Only on milestone overs, NOT every over! (Max 8 ads total)
          if (_isMilestoneOver(_completedOvers, widget.totalOvers)) {
            _triggerAdIfUnderCap();
          }
        }
      }

      // Check all out during over
      if (isWicket && _wickets >= 10) {
        if (widget.target != null) {
          _isMatchCompleted = true;
          final runsDefended = widget.target! - 1 - _totalRuns;
          _resultText = '\${widget.teamB.name} won by \$runsDefended runs!';
        } else {
          _isInningsCompleted = true;
        }
        _triggerAdIfUnderCap();
      }
    });
  }

  void _startSecondInnings() {
    _triggerAdIfUnderCap(); // AUTOMATIC AD: 2ND INNINGS START (capped at 8)
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => LiveScoringScreen(
          teamA: widget.teamB,
          teamB: widget.teamA,
          totalOvers: widget.totalOvers,
          target: _totalRuns + 1,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('\${widget.teamA.name} vs \${widget.teamB.name}')),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            color: const Color(0xFF0F172A),
            child: Column(
              children: [
                Text('Score: \$_totalRuns/\$_wickets (\$_completedOvers.\$_ballsInCurrentOver/\${widget.totalOvers} ov)', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                if (widget.target != null)
                  Text(_totalRuns >= widget.target! ? 'Target Achieved! Match Finished!' : 'Target: \${widget.target} (Need \${widget.target! - _totalRuns} runs in \${(widget.totalOvers * 6) - (_completedOvers * 6 + _ballsInCurrentOver)} balls)', style: const TextStyle(color: Colors.amberAccent)),
              ],
            ),
          ),
          Expanded(
            child: _isMatchCompleted
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.emoji_events, size: 64, color: Colors.amber),
                        const SizedBox(height: 12),
                        const Text('MATCH CONCLUDED!', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.greenAccent)),
                        const SizedBox(height: 8),
                        Text(_resultText, style: const TextStyle(fontSize: 16, color: Colors.white)),
                        const SizedBox(height: 20),
                        ElevatedButton(onPressed: () => Navigator.pop(context), child: const Text('Back to Home')),
                      ],
                    ),
                  )
                : _isInningsCompleted
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.sports_cricket, size: 64, color: Colors.orangeAccent),
                            const SizedBox(height: 12),
                            const Text('1ST INNINGS CONCLUDED!', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.orangeAccent)),
                            const SizedBox(height: 8),
                            Text('\${widget.teamA.name} scored \$_totalRuns/\$_wickets in \$_completedOvers.\$_ballsInCurrentOver overs', style: const TextStyle(fontSize: 16, color: Colors.white)),
                            const SizedBox(height: 6),
                            Text('Target for \${widget.teamB.name}: \${_totalRuns + 1} Runs (\${widget.totalOvers} ov)', style: const TextStyle(fontSize: 16, color: Colors.amber, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 20),
                            ElevatedButton.icon(
                              onPressed: _startSecondInnings,
                              icon: const Icon(Icons.play_arrow),
                              label: const Text('Start 2nd Innings (Chase)'),
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.orange, foregroundColor: Colors.white),
                            ),
                          ],
                        ),
                      )
                    : Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: [
                          ElevatedButton(onPressed: () => _recordBall(0), child: const Text('0')),
                          ElevatedButton(onPressed: () => _recordBall(1), child: const Text('1')),
                          ElevatedButton(onPressed: () => _recordBall(4), child: const Text('4')),
                          ElevatedButton(onPressed: () => _recordBall(6), child: const Text('6')),
                          ElevatedButton(onPressed: () => _recordBall(0, isWicket: true), child: const Text('Wicket')),
                        ],
                      ),
          ),
          const AdBannerWidget(),
        ],
      ),
    );
  }
}`
  },
  {
    path: 'lib/screens/home_screen.dart',
    name: 'home_screen.dart',
    category: 'screens',
    content: `import 'package:flutter/material.dart';
import '../services/admob_service.dart';
import '../widgets/ad_banner_widget.dart';
import 'match_setup_screen.dart';
import 'live_scoring_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Cricket Scoreboard')),
      body: Column(
        children: [
          Expanded(
            child: Center(
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => MatchSetupScreen(
                        onStartMatch: (format, totalOvers, teamA, teamB) {
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                              builder: (context) => LiveScoringScreen(teamA: teamA, teamB: teamB, totalOvers: totalOvers),
                            ),
                          );
                        },
                      ),
                    ),
                  );
                },
                icon: const Icon(Icons.sports_cricket),
                label: const Text('Start New Match (1-20 Overs)'),
              ),
            ),
          ),
          const AdBannerWidget(),
        ],
      ),
    );
  }
}`
  },
  {
    path: 'lib/screens/match_setup_screen.dart',
    name: 'match_setup_screen.dart',
    category: 'screens',
    content: `import 'package:flutter/material.dart';
import '../models/match_model.dart';
import '../models/player_model.dart';
import '../services/admob_service.dart';

class MatchSetupScreen extends StatefulWidget {
  final Function(MatchFormat format, int totalOvers, Team teamA, Team teamB) onStartMatch;
  const MatchSetupScreen({super.key, required this.onStartMatch});

  @override
  State<MatchSetupScreen> createState() => _MatchSetupScreenState();
}

class _MatchSetupScreenState extends State<MatchSetupScreen> {
  MatchFormat _selectedFormat = MatchFormat.t20;
  int _totalOvers = 20;

  final TextEditingController _teamAController = TextEditingController(text: 'Thunderbolts XI');
  final TextEditingController _teamBController = TextEditingController(text: 'Falcons United');

  final TextEditingController _playerAInput = TextEditingController();
  final List<Player> _teamAPlayers = [];

  final TextEditingController _playerBInput = TextEditingController();
  final List<Player> _teamBPlayers = [];

  void _addPlayerA() {
    if (_playerAInput.text.trim().isEmpty) return;
    setState(() {
      _teamAPlayers.add(Player(id: 'p-a-\${_teamAPlayers.length + 1}', name: _playerAInput.text.trim(), role: PlayerRole.batsman));
      _playerAInput.clear();
    });
  }

  void _addPlayerB() {
    if (_playerBInput.text.trim().isEmpty) return;
    setState(() {
      _teamBPlayers.add(Player(id: 'p-b-\${_teamBPlayers.length + 1}', name: _playerBInput.text.trim(), role: PlayerRole.batsman));
      _playerBInput.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Match Setup: 1-20 Overs & Lonely Players')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Choice of Overs (1 to 20):', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 6,
              children: List.generate(20, (i) => ChoiceChip(
                label: Text('\${i + 1}'),
                selected: _totalOvers == i + 1,
                onSelected: (_) => setState(() => _totalOvers = i + 1),
              )),
            ),
            const SizedBox(height: 16),
            TextField(controller: _teamAController, decoration: const InputDecoration(labelText: 'Custom Team A Name')),
            Row(
              children: [
                Expanded(child: TextField(controller: _playerAInput, decoration: InputDecoration(labelText: 'Add Player #\${_teamAPlayers.length + 1} Lonely'))),
                IconButton(icon: const Icon(Icons.add), onPressed: _addPlayerA),
              ],
            ),
            const SizedBox(height: 16),
            TextField(controller: _teamBController, decoration: const InputDecoration(labelText: 'Custom Team B Name')),
            Row(
              children: [
                Expanded(child: TextField(controller: _playerBInput, decoration: InputDecoration(labelText: 'Add Player #\${_teamBPlayers.length + 1} Lonely'))),
                IconButton(icon: const Icon(Icons.add), onPressed: _addPlayerB),
              ],
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                AdMobService.showInterstitialAd(); // AUTOMATIC AD: MATCH START
                final teamA = Team(id: 'team-a', name: _teamAController.text.trim(), shortName: 'TA', players: _teamAPlayers, playingXIIds: _teamAPlayers.map((p) => p.id).toList());
                final teamB = Team(id: 'team-b', name: _teamBController.text.trim(), shortName: 'TB', players: _teamBPlayers, playingXIIds: _teamBPlayers.map((p) => p.id).toList());
                widget.onStartMatch(_selectedFormat, _totalOvers, teamA, teamB);
              },
              child: Text('Start Match (\$_totalOvers Overs)'),
            ),
          ],
        ),
      ),
    );
  }
}`
  },
  {
    path: 'lib/models/match_model.dart',
    name: 'match_model.dart',
    category: 'models',
    content: `import 'player_model.dart';

enum MatchFormat { t20, odi, test, custom }
enum DismissalType { bowled, caught, lbw, runOut, stumped, hitWicket, retiredHurt }

class Team {
  final String id;
  final String name;
  final String shortName;
  final String logo;
  final List<Player> players;
  final List<String> playingXIIds;

  Team({
    required this.id,
    required this.name,
    required this.shortName,
    this.logo = '🏏',
    required this.players,
    required this.playingXIIds,
  });
}`
  },
  {
    path: 'lib/models/player_model.dart',
    name: 'player_model.dart',
    category: 'models',
    content: `enum PlayerRole { batsman, bowler, allRounder, wicketKeeper }

class Player {
  final String id;
  final String name;
  final PlayerRole role;
  final bool isCaptain;
  final bool isViceCaptain;
  final bool isWicketKeeper;

  Player({
    required this.id,
    required this.name,
    required this.role,
    this.isCaptain = false,
    this.isViceCaptain = false,
    this.isWicketKeeper = false,
  });
}`
  },
  {
    path: 'lib/screens/privacy_policy_screen.dart',
    name: 'privacy_policy_screen.dart',
    category: 'screens',
    content: `import 'package:flutter/material.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Privacy Policy'),
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildCard(
              title: 'Privacy Policy for Cricket Scoreboard',
              subtitle: 'Last updated: 2026',
              content:
                  'We take your privacy seriously. This Privacy Policy explains what information we collect, how it is used, and how your data is protected when using Cricket Scoreboard.',
              icon: Icons.shield_outlined,
            ),
            const SizedBox(height: 16),
            _buildSection(
              title: '1. Information We Collect & Local Storage',
              body:
                  'Cricket Scoreboard stores match scores, teams, player statistics, and match history strictly on your local device (using Hive / Local Storage). We do not collect, upload, or sell your personal data to remote servers.',
              icon: Icons.storage_outlined,
            ),
            const SizedBox(height: 16),
            _buildSection(
              title: '2. Google AdMob Advertising',
              body:
                  'Our app integrates Google AdMob for banner and interstitial ads. Google AdMob may collect and process device identifiers, advertising IDs, and diagnostic data to serve ads in compliance with Google Play Store policies and user consent guidelines.',
              icon: Icons.campaign_outlined,
            ),
            const SizedBox(height: 16),
            _buildSection(
              title: '3. Device Permissions',
              body:
                  '• INTERNET & ACCESS_NETWORK_STATE: Required solely to load AdMob advertisements and verify connectivity.\\n• Local storage permissions are only used to export match summaries.',
              icon: Icons.security_outlined,
            ),
            const SizedBox(height: 16),
            _buildSection(
              title: '4. Children\\'s Privacy (COPPA & GDPR)',
              body:
                  'Cricket Scoreboard does not knowingly collect personally identifiable information from children under 13. All match scoring is managed offline locally on the user device.',
              icon: Icons.child_care_outlined,
            ),
            const SizedBox(height: 16),
            _buildSection(
              title: '5. Contact Us',
              body:
                  'If you have questions regarding this Privacy Policy, please contact the developer via Google Play developer support.',
              icon: Icons.email_outlined,
            ),
            const SizedBox(height: 32),
            Center(
              child: Text(
                '© 2026 Cricket Scoreboard 15 Phases • All Rights Reserved',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.5),
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard({
    required String title,
    required String subtitle,
    required String content,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.blueAccent.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: Colors.cyanAccent, size: 28),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            content,
            style: TextStyle(
              color: Colors.white.withOpacity(0.85),
              fontSize: 14,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required String body,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: Colors.blueAccent, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            body,
            style: TextStyle(
              color: Colors.white.withOpacity(0.8),
              fontSize: 13,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}`
  }
];
