import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Marker, Region } from "react-native-maps";

type RootStackParamList = {
  MapScreen: undefined;
  AddressScreen: {
    coords: { latitude: number; longitude: number };
    addressName: string;
  };
};

type NavProps = NativeStackNavigationProp<RootStackParamList, "MapScreen">;

export default function MapScreen() {
  const navigation = useNavigation<NavProps>();

  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region | null>(null);
  const [markerCoordinate, setMarkerCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [addressName, setAddressName] = useState<string>("");

  const [inputValue, setInputValue] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(true);

  const googlePlacesRef = useRef<any>(null);

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  const fetchCurrentLocation = async () => {
    setLoading(true);

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Location permission is required to use this feature.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );

      setLoading(false);
      return;
    }

    try {
      const lastKnownLocation = await Location.getLastKnownPositionAsync();
      if (lastKnownLocation) {
        const { latitude, longitude } = lastKnownLocation.coords;
        const cachedRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setRegion(cachedRegion);
        setMarkerCoordinate({ latitude, longitude });
        await updateAddressName(latitude, longitude);
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      const initialRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setRegion(initialRegion);
      setMarkerCoordinate({ latitude, longitude });
      await updateAddressName(latitude, longitude);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not fetch current location.");
    } finally {
      setLoading(false);
    }
  };

  const updateAddressName = async (latitude: number, longitude: number) => {
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (address) {
        const parts = [
          address.name,
          address.street,
          address.city,
          address.region,
          address.country,
          address.postalCode,
        ].filter(Boolean);
        setAddressName(parts.join(", "));
      } else {
        setAddressName("Unknown address");
      }
    } catch {
      setAddressName("Unknown address");
    }
  };

  useEffect(() => {
    if (markerCoordinate) {
      updateAddressName(markerCoordinate.latitude, markerCoordinate.longitude);
      setRegion((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          latitude: markerCoordinate.latitude,
          longitude: markerCoordinate.longitude,
        };
      });
    }
  }, [markerCoordinate]);

  // New clear search logic that remounts autocomplete to force hide dropdown
  const clearSearch = () => {
    setShowAutocomplete(false); // unmount autocomplete
    setInputValue("");
    Keyboard.dismiss();

    setTimeout(() => {
      setShowAutocomplete(true); // remount autocomplete, dropdown gone
    }, 100);
  };

  if (loading || !region || !markerCoordinate) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6a0dad" />
        <Text style={styles.loadingText}>Fetching your location...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        {/* Back Button */}
        {Platform.OS === "ios" && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back-ios" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Conditionally render autocomplete */}
        {showAutocomplete && (
          <View style={styles.searchContainer}>
            <GooglePlacesAutocomplete
              ref={googlePlacesRef}
              placeholder="Search for a place or address"
              onPress={(data, details = null) => {
                if (details?.geometry?.location) {
                  const latitude = details.geometry.location.lat;
                  const longitude = details.geometry.location.lng;

                  setMarkerCoordinate({ latitude, longitude });
                  setRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  });

                  setAddressName(data.description);
                  setInputValue(data.description);

                  Keyboard.dismiss();

                  // Hide dropdown by remounting
                  setShowAutocomplete(false);
                  setTimeout(() => {
                    setShowAutocomplete(true);
                  }, 100);
                }
              }}
              fetchDetails={true}
              query={{
                key: "AIzaSyBMFwULNuurFyz5VpECusQ2Gwr-beoYpTs",
                language: "en",
                components: "country:AE",
              }}
              GooglePlacesDetailsQuery={{
                fields: "geometry,name,formatted_address",
              }}
              debounce={300}
              enablePoweredByContainer={false}
              textInputProps={{
                value: inputValue,
                onChangeText: (text) => setInputValue(text),
                autoCorrect: false,
              }}
              styles={{
                textInputContainer: {
                  backgroundColor: "#fff",
                  borderRadius: 6,
                  borderColor: "#ccc",
                  borderWidth: 1,
                  paddingHorizontal: 10,
                  flexDirection: "row",
                  alignItems: "center",
                },
                textInput: {
                  fontSize: 13,
                  height: 47,
                  flex: 1,
                  paddingRight: 30,
                },
                listView: {
                  backgroundColor: "white",
                  borderRadius: 6,
                  elevation: 3,
                  maxHeight: 200,
                  zIndex: 20,
                },
              }}
            />

            {inputValue.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSearch}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Map View */}
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
          onPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setMarkerCoordinate({ latitude, longitude });
          }}
        >
          <Marker
            coordinate={markerCoordinate}
            draggable
            onDragEnd={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              setMarkerCoordinate({ latitude, longitude });
            }}
            title="Drag me or tap map"
          />
        </MapView>

        {/* Location Button */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={fetchCurrentLocation}
          activeOpacity={0.7}
        >
          <Text style={styles.locationButtonText}>📍</Text>
        </TouchableOpacity>

        {/* Address Display */}
        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Current Address:</Text>
          <Text style={styles.addressText}>
            {addressName || "Loading address..."}
          </Text>
        </View>

        {/* Next Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "/bookingForm",
                params: {
                  latitude: markerCoordinate.latitude,
                  longitude: markerCoordinate.longitude,
                  addressName: addressName || "Unknown address",
                },
              });
            }}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "#cc3093",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 2,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    zIndex: 50,
  },

  searchContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 80,
    left: 20,
    right: 20,
    zIndex: 30,
    flexDirection: "row",
    alignItems: "center",
  },

  clearButton: {
    position: "absolute",
    right: 10,
    top: 15,
    zIndex: 40,
  },

  locationButton: {
    position: "absolute",
    bottom: 250,
    right: 20,
    backgroundColor: "#cc3093",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
    zIndex: 20,
  },
  locationButtonText: {
    fontSize: 28,
    color: "#fff",
  },

  addressContainer: {
    position: "absolute",
    marginBottom: 20,
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 10,
    borderRadius: 8,
    zIndex: 10,
  },
  addressLabel: { fontWeight: "bold", marginBottom: 5 },
  addressText: { fontSize: 14 },

  buttonContainer: {
    marginBottom: 60,
    paddingHorizontal: 20,
    zIndex: 10,
  },

  nextButton: {
    backgroundColor: "#cc3093",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  nextButtonText: {
    color: "white",
    fontWeight: "bold",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#cc3093",
  },
});
