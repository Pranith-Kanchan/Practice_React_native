import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, ScrollView ,Dimensions } from 'react-native';
import { useLazyQuery, gql } from '@apollo/client';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const GET_COUNTRY = gql`
  query GetCountry($code: ID!) {
    country(code: $code) {
      name
      native
      capital
      emoji
      currency
      languages {
        code
        name
      }
    }
  }
`;

const { width } = Dimensions.get('window');

console.log("witdhh----->",width);

const ProfileScreen = ({ route, navigation }) => {
    const initialCode = route.params?.countryCode || '';
    const [inputCode, setInputCode] = useState(initialCode);
    const [isFlipped, setIsFlipped] = useState(false);
    const rotateY = useSharedValue(0);

    const [fetchCountry, { loading, error, data }] = useLazyQuery(GET_COUNTRY);

    const handleSearch = () => {
        if (inputCode.trim()) {
            fetchCountry({ variables: { code: inputCode.trim().toUpperCase() } });
        }
    };

    const flipCard = () => {
        'worklet';
        rotateY.value = withTiming(isFlipped ? 0 : 180, { 
            duration: 800,
            easing: Easing.out(Easing.exp)
        }, () => {
            runOnJS(setIsFlipped)(!isFlipped);
        });
    };

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            rotateY.value,
            [0, 180],
            [0, 180],
            Extrapolate.CLAMP
        );

        return {
            transform: [
                { rotateY: `${rotate}deg` },
            ],
            opacity: rotateY.value < 90 ? 1 : 0,
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            rotateY.value,
            [0, 180],
            [180, 360],
            Extrapolate.CLAMP
        );

        return {
            transform: [
                { rotateY: `${rotate}deg` },
            ],
            opacity: rotateY.value > 90 ? 1 : 0,
        };
    });

    const tapGesture = Gesture.Tap()
        .onStart(() => {
            if (data?.country) {
                flipCard();
            }
        });

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Animated.View entering={FadeInUp.duration(800).easing(Easing.out(Easing.exp))}>
                <Text style={styles.title}>Country Explorer</Text>
            </Animated.View>

            <View style={styles.searchContainer}>
                <Animated.View entering={FadeInUp.delay(100).duration(800).easing(Easing.out(Easing.exp))}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter country code (e.g., BR)"
                        placeholderTextColor="#aaa"
                        value={inputCode}
                        onChangeText={setInputCode}
                        autoCapitalize="characters"
                    />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(200).duration(800).easing(Easing.out(Easing.exp))}>
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={handleSearch}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? 'Searching...' : 'Search'}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Fetching country data...</Text>
                </View>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {error.message}</Text>
                </View>
            )}

            {data?.country && (
                <GestureDetector gesture={tapGesture}>
                    <View style={styles.cardContainer}>
                        {/* Front of the Card */}
                        <Animated.View style={[styles.countryCard, styles.cardFace, frontAnimatedStyle]}>
                            <Animated.View
                                style={styles.countryHeader}
                                entering={FadeInDown.delay(100).duration(800)}
                            >
                                <Text style={styles.emoji}>{data.country.emoji}</Text>
                                <View>
                                    <Text style={styles.countryName}>{data.country.name}</Text>
                                    <Text style={styles.countryNative}>{data.country.native}</Text>
                                </View>
                            </Animated.View>

                            <Animated.View
                                style={styles.detailSection}
                                entering={FadeInDown.delay(200).duration(800)}
                            >
                                <Text style={styles.sectionTitle}>Capital</Text>
                                <Text style={styles.detailText}>{data.country.capital || 'N/A'}</Text>
                            </Animated.View>

                            <Animated.View
                                style={styles.detailSection}
                                entering={FadeInDown.delay(300).duration(800)}
                            >
                                <Text style={styles.sectionTitle}>Currency</Text>
                                <Text style={styles.detailText}>{data.country.currency || 'N/A'}</Text>
                            </Animated.View>

                            <View style={styles.flipHint}>
                                <Text style={styles.flipHintText}>Tap to see languages</Text>
                            </View>
                        </Animated.View>

                        {/* Back of the Card */}
                        <Animated.View style={[styles.countryCard, styles.cardFace, styles.cardBack, backAnimatedStyle]}>
                            <Animated.View
                                style={styles.detailSection}
                                entering={FadeInDown.delay(100).duration(800)}
                            >
                                <Text style={styles.sectionTitle}>Languages</Text>
                                {data.country.languages.map((lang, index) => (
                                    <Animated.View
                                        key={lang.code}
                                        style={styles.languageItem}
                                        entering={FadeInDown.delay(200 + index * 100).duration(800)}
                                    >
                                        <Text style={styles.detailText}>• {lang.name}</Text>
                                    </Animated.View>
                                ))}
                            </Animated.View>

                            <View style={styles.flipHint}>
                                <Text style={styles.flipHintText}>Tap to return</Text>
                            </View>
                        </Animated.View>
                    </View>
                </GestureDetector>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#1e3c72',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#fff',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    searchContainer: {
        width: '100%',
        marginBottom: 20,
    },
    input: {
        height: 50,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 15,
        marginBottom: 15,
        borderRadius: 10,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    searchButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 3,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        marginVertical: 20,
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 16,
    },
    errorContainer: {
        backgroundColor: 'rgba(255,0,0,0.2)',
        padding: 15,
        borderRadius: 10,
        marginVertical: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,0,0,0.5)',
    },
    errorText: {
        color: '#ffeb3b',
        fontSize: 16,
    },
    cardContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 1000,
        marginVertical: 15,
        height: 350,
    },
    countryCard: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        width: '100%',
        borderRadius: 15,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        height: '100%',
    },
    cardFace: {
        backfaceVisibility: 'hidden',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    cardBack: {
        backgroundColor: 'rgba(30, 60, 114, 0.9)',
    },
    countryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        paddingBottom: 15,
    },
    emoji: {
        fontSize: 50,
        marginRight: 15,
    },
    countryName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    countryNative: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        fontStyle: 'italic',
    },
    detailSection: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 5,
    },
    detailText: {
        fontSize: 16,
        color: '#fff',
        marginLeft: 10,
    },
    languageItem: {
        marginVertical: 3,
    },
    flipHint: {
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
    },
    flipHintText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontStyle: 'italic',
    },
});

export default ProfileScreen;