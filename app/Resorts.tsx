import { useStore } from "@/stores/store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    CheckCircle,
    MapPin,
    ShoppingBag,
    Sparkles,
    Star,
    Train,
    X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* =======================
   TYPES
======================= */
interface BookingOption {
    title: string;
    inclusions: string[];
    oldPrice: string;
    newPrice: string;
    taxes: string;
}

interface Room {
    name: string;
    size: string;
    view: string;
    beds: string;
    bathrooms: number;
    features: string[];
    images: string[];
    bookingOptions: BookingOption[];
}

interface HotelData {
    name: string;
    rating: number;
    images: {
        main: string;
        room: string;
        guest: string;
    };
    property: {
        description: string;
    };
    rooms: Room[];
    review: {
        score: number;
        count: number;
        label: string;
    };
    location: {
        name: string;
        description: string;
        rating: number;
    };
    nearby: {
        attractions: string;
        shopping: string;
        transport: string;
    };
    amenities: string[];
}

/* =======================
   MOCK IMAGES (REMOTE OR LOCAL)
======================= */
const hotelImage =
    "https://images.unsplash.com/photo-1566073771259-6a8506099945";
const guestImage =
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267";
const classicRoomImage1 =
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511";
const classicRoomImage2 =
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2";
const classicRoomImage3 =
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b";
const classicRoomImage4 =
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0";

const deluxeRoomImage1 =
    "https://images.unsplash.com/photo-1590490360182-c33d57733427";
const deluxeRoomImage2 =
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7";
const deluxeRoomImage3 =
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c";
const deluxeRoomImage4 =
    "https://images.unsplash.com/photo-1591088398332-8a7791972843";

/* =======================
   HOTEL DATA (SAME PAGE)
======================= */
const hotelData: HotelData = {
    name: "Majestic Premier Hotel Bur Dubai",
    rating: 4,
    images: {
        main: hotelImage,
        room: classicRoomImage1,
        guest: guestImage,
    },
    property: {
        description:
            "With close proximity to nearby city attractions, get a taste of luxury and comfort at Majestic Premier Hotel Bur Dubai while enjoying their in-house recreational activities.",
    },
    rooms: [
        {
            name: "Classic Room",
            size: "269 sq.ft (25 sq.mt)",
            view: "City View",
            beds: "2 Twin bed(s)",
            bathrooms: 1,
            features: ["Room with City View & Bathtub!", "Bathtub"],
            images: [
                classicRoomImage1,
                classicRoomImage2,
                classicRoomImage3,
                classicRoomImage4,
            ],
            bookingOptions: [
                {
                    title: "Room Only",
                    inclusions: [
                        "No meals included",
                        "15% off on food & beverage services",
                        "Non-Refundable",
                    ],
                    oldPrice: "476",
                    newPrice: "267",
                    taxes: "83",
                },
                {
                    title: "Room with Breakfast",
                    inclusions: [
                        "Early Check-In upto 4 hours (subject to availability)",
                        "Non-Refundable",
                    ],
                    oldPrice: "374",
                    newPrice: "318",
                    taxes: "103",
                },
            ],
        },
        {
            name: "Deluxe Room",
            size: "269 sq.ft (25 sq.mt)",
            view: "City View",
            beds: "2 Twin bed(s)",
            bathrooms: 1,
            features: ["Room with City View & Bathtub!", "Bathtub"],
            images: [
                deluxeRoomImage1,
                deluxeRoomImage2,
                deluxeRoomImage3,
                deluxeRoomImage4,
            ],
            bookingOptions: [
                {
                    title: "Room with Breakfast + Lunch/Dinner",
                    inclusions: [
                        "Early Check-In upto 4 hours (subject to availability)",
                        "Non-Refundable",
                    ],
                    oldPrice: "526",
                    newPrice: "469",
                    taxes: "144",
                },
                {
                    title: "Room With Breakfast + Lunch + Dinner",
                    inclusions: [
                        "Early Check-In upto 4 hours (subject to availability)",
                        "Non-Refundable",
                    ],
                    oldPrice: "677",
                    newPrice: "576",
                    taxes: "186",
                },
            ],
        },
    ],
    review: { score: 4.3, count: 1404, label: "Excellent" },
    location: {
        name: "Bur Dubai",
        description:
            "4 minutes walk to Meena Bazaar | 6.8 km drive to Dubai Airport",
        rating: 4.5,
    },
    nearby: {
        attractions:
            "Have fun exploring Meena Bazaar (4 mins walk) & Bur Dubai Souk Market (1.6 km drive)",
        shopping:
            "Indulge in shopping at Day to Day Supermarket (6 mins walk) & BurJuman Mall (9 mins walk)",
        transport:
            "Property is near Dubai Airport (6.8 km drive) & Sharaf DG Metro Station (5 mins walk)",
    },
    amenities: ["Spa", "Swimming Pool", "Gym", "Jacuzzi", "Night Club"],
};

/* =======================
   SCREEN
======================= */
const Resorts: React.FC = () => {
    const [showAmenities, setShowAmenities] = useState(false);

    const { bookingStore, serviceStore } = useStore();
        const [selectedName, setSelectedName] = useState("");
        const serviceId = "414D40E9-3BDD-4DCD-868F-08DDF80D14F5";
    
         useEffect(() => {
            // ✅ Only load service details — do NOT override location again
            serviceStore.getService(serviceId);
          }, []);
        
          useEffect(() => {
            if (serviceStore.currentService?.name) {
              setSelectedName(serviceStore.currentService.name);
            }
          }, [serviceStore.currentService?.id]);

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: "#fff" }}
            edges={["top"]}
        >
            {/* App Header */}
            <View style={styles.appheader}>
                <Text style={styles.headerTitle}>Resorts</Text>
                <Ionicons
                    name="close"
                    size={24}
                    color="#111"
                    onPress={() => router.back()}
                />
            </View>

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Title */}
                <View style={styles.header}>
                    <CheckCircle size={26} color="#cc3093" />
                    <Text style={styles.title}>{selectedName}</Text>
                </View>

                {/* Rating */}
                <View style={styles.row}>
                    {[...Array(hotelData.rating)].map((_, i) => (
                        <Star key={i} size={18} color="#facc15" />
                    ))}
                </View>

                {/* Main Image */}
                <Image
                    source={{ uri: hotelData.images.main }}
                    style={styles.mainImage}
                />

                {/* About */}
                <Text style={styles.sectionTitle}>About Property</Text>
                <Text style={styles.text}>{hotelData.property.description}</Text>

                {/* Nearby */}
                <View style={styles.infoRow}>
                    <MapPin size={18} color="#cc3093" />
                    <Text style={styles.text}>{hotelData.nearby.attractions}</Text>
                </View>

                <View style={styles.infoRow}>
                    <ShoppingBag size={18} color="#cc3093" />
                    <Text style={styles.text}>{hotelData.nearby.shopping}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Train size={18} color="#cc3093" />
                    <Text style={styles.text}>{hotelData.nearby.transport}</Text>
                </View>

                {/* Amenities preview */}
                <Text style={styles.sectionTitle}>Amenities</Text>
                {hotelData.amenities.slice(0, 3).map((a, i) => (
                    <View key={i} style={styles.row}>
                        <Sparkles size={16} color="#cc3093" />
                        <Text>{a}</Text>
                    </View>
                ))}

                <Pressable onPress={() => setShowAmenities(true)}>
                    <Text style={styles.link}>+ View all amenities</Text>
                </Pressable>

                {/* Rooms */}
                <Text style={styles.sectionTitle}>Rooms</Text>
                {hotelData.rooms.map((room, index) => (
                    <View key={index} style={styles.card}>
                        <Image source={{ uri: room.images[0] }} style={styles.roomImage} />
                        <Text style={styles.roomTitle}>{room.name}</Text>
                        <Text style={styles.subText}>
                            {room.size} • {room.view}
                        </Text>

                        {room.bookingOptions.map((option, i) => (
                            <View key={i} style={styles.booking}>
                                <Text style={styles.bold}>{option.title}</Text>
                                <Text style={styles.price}>AED {option.newPrice}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>

            {/* =======================
         MODERN AMENITIES MODAL
      ======================= */}
            <Modal
                visible={showAmenities}
                transparent
                animationType="slide"
                statusBarTranslucent
            >
                <View style={styles.overlay}>
                    <View style={styles.sheet}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>All Amenities</Text>
                            <Pressable onPress={() => setShowAmenities(false)}>
                                <X size={22} color="#111" />
                            </Pressable>
                        </View>

                        {/* Grid */}
                        <FlatList
                            data={hotelData.amenities}
                            keyExtractor={(_, i) => i.toString()}
                            numColumns={2}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            renderItem={({ item }) => (
                                <View style={styles.amenityItem}>
                                    <CheckCircle size={18} color="#cc3093" />
                                    <Text style={styles.amenityText}>{item}</Text>
                                </View>
                            )}
                        />

                        {/* Button */}
                        <Pressable
                            style={styles.closeButton}
                            onPress={() => setShowAmenities(false)}
                        >
                            <Text style={styles.closeText}>Done</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            {/* Bottom Bar */}
            <View style={styles.footer}>
                <View style={styles.footerContainer}>
                    <View style={styles.buttonWrapper}>
                        <TouchableOpacity
                            style={styles.nextButton}
                            onPress={() =>
                                router.push({
                                    pathname: '/ResortsDetails',
                                })
                            }
                        >
                            <Text style={styles.nextButtonText}>Next</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

        </SafeAreaView>
    );
};

export default Resorts;

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 16,
        marginBottom: 150,
    },

    appheader: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 0.5,
        borderColor: "#e5e5e5",
        backgroundColor: "#fff",
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1a1a1a",
    },

    header: { flexDirection: "row", alignItems: "center", gap: 10 },
    title: { fontSize: 22, fontWeight: "700" },

    row: { flexDirection: "row", gap: 6, marginVertical: 6 },
    infoRow: { flexDirection: "row", gap: 8, marginVertical: 8 },

    mainImage: { height: 220, borderRadius: 16, marginVertical: 12 },

    sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 20 },

    text: { color: "#555", flex: 1 },
    subText: { color: "#666", marginTop: 2 },

    link: { color: "#cc3093", marginTop: 10, fontWeight: "600" },

    card: {
        borderRadius: 16,
        padding: 12,
        marginVertical: 10,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#eee",
    },

    roomImage: { height: 160, borderRadius: 12, marginBottom: 8 },
    roomTitle: { fontSize: 16, fontWeight: "700" },

    booking: { marginTop: 8 },
    bold: { fontWeight: "700" },
    price: { color: "#cc3093", fontWeight: "700" },

    /* Modal */
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },

    sheet: {
        maxHeight: height * 0.75,
        backgroundColor: "#fff",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 55,
    },

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
    },

    amenityItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#faf5f8",
        margin: 6,
        padding: 12,
        borderRadius: 14,
    },

    amenityText: { fontSize: 14, flexShrink: 1 },

    closeButton: {
        backgroundColor: "#cc3093",
        marginVertical: 16,
        paddingVertical: 14,
        borderRadius: 18,
        alignItems: "center",
    },

    closeText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },

    footer: {
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 0,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderColor: "#eee",
    },

    footerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 20,

    },

    buttonWrapper: {
        width: '100%',
        paddingHorizontal: 20,
    },

    nextButton: {
        backgroundColor: '#cc3093',
        paddingVertical: 14,
        borderRadius: 8,
        marginBottom: 10,
        width: '100%',
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
        fontFamily: 'Byom-Bold',

    },

});
