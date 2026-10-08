import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'services/admob_service.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive for local persistence of matches, teams, and player stats
  await Hive.initFlutter();
  
  // Initialize Google Mobile Ads (AdMob)
  await MobileAds.instance.initialize();
  AdMobService.initialize();

  runApp(
    const ProviderScope(
      child: CricketScoreboardApp(),
    ),
  );
}

class CricketScoreboardApp extends StatelessWidget {
  const CricketScoreboardApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cricket Scoreboard App - 15 Phases',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0B192C),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF008DDA),
          secondary: Color(0xFF41B06E),
          surface: Color(0xFF1E3E62),
          onSurface: Colors.white,
          error: Color(0xFFFF4D4D),
        ),
        textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0B192C),
          elevation: 0,
          centerTitle: true,
        ),
        cardTheme: CardThemeData(
          color: const Color(0xFF1E3E62),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          elevation: 4,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF008DDA),
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ),
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFF4F6F9),
        colorScheme: const ColorScheme.light(
          primary: Color(0xFF008DDA),
          secondary: Color(0xFF41B06E),
          surface: Colors.white,
          onSurface: Color(0xFF0B192C),
        ),
        textTheme: GoogleFonts.outfitTextTheme(ThemeData.light().textTheme),
      ),
      home: const HomeScreen(),
    );
  }
}
