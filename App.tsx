import Animated, {
   SharedValue,
   useAnimatedStyle,
   useSharedValue,
   withTiming,
} from 'react-native-reanimated';
import {
   ImageBackground,
   LayoutChangeEvent,
   LayoutRectangle,
   StyleProp,
   StyleSheet,
   Switch,
   Text,
   TouchableOpacity,
   View,
   ViewStyle,
} from 'react-native';
import { useMemo, useState } from 'react';

import { BlurView } from 'expo-blur';

const BAR_X_PADDING = 12;

const TabBar = ({
   tabs,
   onTabPress,
   onLayout,
   children,
   withBlurryBG,
}: {
   tabs: string[];
   onTabPress: (value: number) => void;
   withBlurryBG?: boolean;
   onLayout?: (event: LayoutChangeEvent) => void;
   children?: React.ReactElement;
}) => {
   return (
      <View
         onLayout={onLayout}
         style={[
            styles.tabBarCommon,
            styles.tabBar,
            { backgroundColor: !withBlurryBG ? 'gold' : undefined },
         ]}
      >
         {withBlurryBG && <BlurView intensity={100} style={styles.absolute} />}
         {tabs.map((label, index) => {
            return (
               <TouchableOpacity
                  key={index}
                  style={styles.tab}
                  onPress={() => onTabPress(index)}
               >
                  <Text
                     numberOfLines={1}
                     ellipsizeMode='tail'
                     style={styles.tabText}
                  >
                     {label}
                  </Text>
               </TouchableOpacity>
            );
         })}
         {children}
      </View>
   );
};

const Magnifier = ({
   tabs,
   zoomLevel,
   offsetX,
   tabWidth,
   barWidth,
   withBlurryBG,
}: {
   tabs: string[];
   zoomLevel: number;
   offsetX: SharedValue<number>;
   barWidth: number;
   tabWidth: number;
   withBlurryBG?: boolean;
}) => {
   const [tabWidths, setTabWidths] = useState<number[]>([]);

   const allWidthMeasured = useMemo(
      () => tabWidths.length > 0 && tabWidths.length === tabs.length,
      [tabs, tabWidths]
   );

   const onLayout = (event: LayoutChangeEvent) => {
      const w = event.nativeEvent.layout.width;
      w > 0 && setTabWidths((s) => [...s, w + 16]);
   };

   const innerBlurStyle = useMemo(() => {
      const offset = `${-(100 - 100 / zoomLevel)}%`;
      return {
         position: 'absolute',
         top: offset,
         left: offset,
         right: offset,
         bottom: offset,
         transform: [{ scale: 1 / zoomLevel }],
      } as StyleProp<ViewStyle>;
   }, [zoomLevel]);

   const indicatorPosX = useAnimatedStyle(() => {
      return {
         left: allWidthMeasured
            ? withTiming(
                 offsetX.value * tabWidth +
                    BAR_X_PADDING +
                    (tabWidth - tabWidths[offsetX.value]) / 2,
                 { duration: 600 }
              )
            : withTiming(0, { duration: 600 }),
         width: allWidthMeasured
            ? withTiming(tabWidths[offsetX.value], { duration: 600 })
            : withTiming(0, { duration: 600 }),
      };
   });

   const indicatorBackgroundPosX = useAnimatedStyle(() => {
      return {
         left: allWidthMeasured
            ? withTiming(
                 -(
                    offsetX.value * tabWidth +
                    (tabWidth / zoomLevel - tabWidths[offsetX.value]) / 2 +
                    BAR_X_PADDING +
                    (tabWidth - tabWidth / zoomLevel) / 2
                 ),
                 { duration: 600 }
              )
            : withTiming(0, { duration: 600 }),
      };
   });

   return (
      <View style={[styles.tabBarCommon, styles.absolute]} pointerEvents='none'>
         <Animated.View
            style={[
               styles.indicator,
               {
                  transform: [{ scale: zoomLevel }],
               },
               indicatorPosX,
               { backgroundColor: !withBlurryBG ? 'gold' : undefined },
            ]}
         >
            {withBlurryBG && (
               <BlurView intensity={100} style={innerBlurStyle} />
            )}
            <Animated.View
               style={[
                  styles.magnifierBar,
                  { width: barWidth },
                  indicatorBackgroundPosX,
               ]}
            >
               {tabs.map((label, index) => (
                  <View key={index} style={styles.tab}>
                     <Text
                        numberOfLines={1}
                        ellipsizeMode='tail'
                        style={styles.tabText}
                        onLayout={onLayout}
                     >
                        {label}
                     </Text>
                  </View>
               ))}
            </Animated.View>
         </Animated.View>
      </View>
   );
};

const App = () => {
   const offsetX = useSharedValue(0);

   const [zoomLevel, setZoomLevel] = useState(1.4);
   const [withBlurryBG, setWithBlurryBG] = useState(true);

   const [dims, setDims] = useState<LayoutRectangle>({
      width: 0,
      height: 0,
      x: 0,
      y: 0,
   });

   const tabs = useMemo(() => ['Sweets', 'Games', 'Toys', 'Balloons'], []);
   const tabWidth = useMemo(
      () => (dims.width - BAR_X_PADDING * 2) / tabs.length,
      [tabs, dims.width]
   );

   const onLayout = (event: LayoutChangeEvent) => {
      setDims(event.nativeEvent.layout);
   };

   const onTabPress = (value: number) => {
      offsetX.value = value;
   };

   return (
      <>
         <ImageBackground
            source={require('./assets/bg.png')}
            style={styles.container}
            resizeMode='contain'
         >
            <View style={styles.tabBarWrapper}>
               <TabBar
                  tabs={tabs}
                  onTabPress={onTabPress}
                  onLayout={onLayout}
                  withBlurryBG={withBlurryBG}
               >
                  <Magnifier
                     tabs={tabs}
                     zoomLevel={zoomLevel}
                     offsetX={offsetX}
                     tabWidth={tabWidth}
                     barWidth={dims.width}
                     withBlurryBG={withBlurryBG}
                  />
               </TabBar>
            </View>
         </ImageBackground>
         <View
            style={{
               position: 'absolute',
               width: '100%',
               alignItems: 'center',
               justifyContent: 'center',
               bottom: 0,
            }}
         >
            <View
               style={{
                  backgroundColor: '#D6DDE0',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 20,
               }}
            >
               <View
                  style={{
                     flexDirection: 'row',
                     alignItems: 'center',
                  }}
               >
                  <TouchableOpacity
                     onPress={() =>
                        zoomLevel > 1 && setZoomLevel((s) => s - 0.1)
                     }
                     style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                     }}
                  >
                     <Text style={{ fontSize: 60 }}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 16, flex: 1, textAlign: 'center' }}>
                     Zoom: {zoomLevel.toFixed(2)}x
                  </Text>
                  <TouchableOpacity
                     onPress={() =>
                        zoomLevel < 2 && setZoomLevel((s) => s + 0.1)
                     }
                     style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                     }}
                  >
                     <Text style={{ fontSize: 40 }}>+</Text>
                  </TouchableOpacity>
               </View>
            </View>

            <View
               style={{
                  marginVertical: 30,
                  backgroundColor: '#D6DDE0',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 20,
               }}
            >
               <Text style={{ fontSize: 16, flex: 1 }}>Blurry background</Text>
               <Switch onValueChange={setWithBlurryBG} value={withBlurryBG} />
            </View>
         </View>
      </>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#f5f6fa',
   },
   tabBarWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
   },
   tabBar: {
      marginHorizontal: 20,
      height: 64,
      paddingHorizontal: BAR_X_PADDING,
      shadowColor: '#000',
      shadowOffset: {
         width: 0,
         height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
   },
   tabBarCommon: {
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 50,
   },
   tab: {
      flex: 1,
      marginHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center',
   },
   tabText: {
      fontSize: 12,
      textShadowColor: '#0005',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
   },
   absolute: {
      ...StyleSheet.absoluteFillObject,
   },
   magnifierBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 3,
      paddingHorizontal: BAR_X_PADDING,
   },
   magnifiedText: {
      fontSize: 18,
      textShadowColor: '#0005',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
   },
   glassEffect: {
      position: 'absolute',
      top: 3,
      alignSelf: 'center',
      width: '50%',
      height: 3,
      borderRadius: 100,
      backgroundColor: '#fff',
   },
   indicator: {
      overflow: 'hidden',
      paddingVertical: 2,
      borderWidth: 1,
      borderRadius: 20,
      borderColor: '#f5f6fa',
      shadowColor: '#000',
      shadowOffset: {
         width: 0,
         height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
   },
});

export default App;
