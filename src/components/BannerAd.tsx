import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from '@react-native-firebase/admob';
import AdMobService from '../services/AdMobService';

interface BannerAdComponentProps {
  size?: BannerAdSize;
  style?: any;
}

const BannerAdComponent: React.FC<BannerAdComponentProps> = ({
  size = BannerAdSize.SMART_BANNER,
  style,
}) => {
  const [adUnitId, setAdUnitId] = useState<string>('');
  const [showAd, setShowAd] = useState(false);
  const [adError, setAdError] = useState(false);

  useEffect(() => {
    loadAdConfig();
  }, []);

  const loadAdConfig = async () => {
    const unitId = AdMobService.getBannerAdUnitId();
    const adsEnabled = AdMobService.isAdsEnabled();
    
    if (unitId && adsEnabled) {
      setAdUnitId(unitId);
      setShowAd(true);
    }
  };

  const handleAdError = (error: Error) => {
    console.log('Banner ad error:', error);
    setAdError(true);
  };

  const handleAdLoaded = () => {
    console.log('Banner ad loaded');
    setAdError(false);
  };

  if (!showAd || !adUnitId || adError) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginVertical: 10,
  },
});

export default BannerAdComponent;