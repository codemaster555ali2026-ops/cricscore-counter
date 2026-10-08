// Centralized Google AdMob Service for Web & Mobile Simulation
export type AdTriggerContext = 'match_start' | 'over_break' | 'innings_break' | 'match_end' | 'custom';

export interface AdInterstitialEvent {
  id: string;
  trigger: AdTriggerContext;
  title: string;
  subtitle: string;
  adUnitId: string;
  creativeName: string;
  creativeIcon: string;
  creativeDescription: string;
  ctaText: string;
}

type AdListener = (event: AdInterstitialEvent | null) => void;

class AdMobManager {
  private listeners: Set<AdListener> = new Set();
  private currentAd: AdInterstitialEvent | null = null;
  public autoAdsEnabled: boolean = true;
  public matchAdsShown: number = 0;
  public readonly MAX_ADS_PER_MATCH: number = 8;

  // Official Google AdMob Test Ad Units
  public readonly BANNER_AD_UNIT = 'ca-app-pub-3940256099942544/6300978111';
  public readonly INTERSTITIAL_AD_UNIT = 'ca-app-pub-3940256099942544/1033173712';
  public readonly REWARDED_AD_UNIT = 'ca-app-pub-3940256099942544/5224354917';

  public resetMatchAdsCount(): void {
    this.matchAdsShown = 0;
  }

  public subscribe(listener: AdListener): () => void {
    this.listeners.add(listener);
    listener(this.currentAd);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.currentAd));
  }

  public showInterstitial(params: {
    trigger: AdTriggerContext;
    title?: string;
    subtitle?: string;
  }) {
    if (!this.autoAdsEnabled && params.trigger !== 'custom') {
      return;
    }

    // STRICT LIMIT: Max 8 ads in an entire match!
    if (params.trigger !== 'custom' && this.matchAdsShown >= this.MAX_ADS_PER_MATCH) {
      return;
    }

    if (params.trigger !== 'custom') {
      this.matchAdsShown++;
    }

    let creativeName = 'Cricket Pro Equipment & Live Stream';
    let creativeIcon = '🏏';
    let creativeDescription = 'Premium English Willow bats, batting pads, and HD match broadcasts.';
    let ctaText = 'Continue to Match';
    let defaultTitle = `Google AdMob Interstitial (Ad ${this.matchAdsShown} of ${this.MAX_ADS_PER_MATCH})`;
    let defaultSubtitle = 'Official Test Ad Unit: ca-app-pub-3940256099942544/1033173712';

    if (params.trigger === 'match_start') {
      defaultTitle = `MATCH START AD (${this.matchAdsShown}/${this.MAX_ADS_PER_MATCH}) • ADMOB`;
      creativeName = 'Dream XI Fantasy Cricket League';
      creativeIcon = '🎯';
      creativeDescription = 'Build your fantasy team, predict top run scorers and win virtual awards!';
      ctaText = 'Start 1st Ball of Match';
    } else if (params.trigger === 'over_break') {
      defaultTitle = `OVER BREAK AD (${this.matchAdsShown}/${this.MAX_ADS_PER_MATCH}) • ADMOB`;
      creativeName = 'PowerPlay Cricket Energy Drink';
      creativeIcon = '⚡';
      creativeDescription = 'Stay hydrated between overs. Unmatched focus for opening batsmen & pacers!';
      ctaText = 'Proceed to Next Over';
    } else if (params.trigger === 'innings_break') {
      defaultTitle = `INNINGS BREAK AD (${this.matchAdsShown}/${this.MAX_ADS_PER_MATCH}) • ADMOB`;
      creativeName = 'Super Chaser Cricket VR Master';
      creativeIcon = '🎮';
      creativeDescription = 'Test your run-chasing instincts in virtual reality stadium experience!';
      ctaText = 'Continue to 2nd Innings Run Chase';
    } else if (params.trigger === 'match_end') {
      defaultTitle = `MATCH CONCLUDED AD (${this.matchAdsShown}/${this.MAX_ADS_PER_MATCH}) • ADMOB`;
      creativeName = 'Champions Cup Official Tournament Sponsor';
      creativeIcon = '🏆';
      creativeDescription = 'Celebrate victory with authentic player jerseys and tournament awards!';
      ctaText = 'View Match Summary & Awards';
    }

    this.currentAd = {
      id: `ad-${Date.now()}`,
      trigger: params.trigger,
      title: params.title || defaultTitle,
      subtitle: params.subtitle || defaultSubtitle,
      adUnitId: this.INTERSTITIAL_AD_UNIT,
      creativeName,
      creativeIcon,
      creativeDescription,
      ctaText
    };

    this.notify();
  }

  public closeInterstitial() {
    this.currentAd = null;
    this.notify();
  }

  public getCurrentAd(): AdInterstitialEvent | null {
    return this.currentAd;
  }
}

export const adMobService = new AdMobManager();
