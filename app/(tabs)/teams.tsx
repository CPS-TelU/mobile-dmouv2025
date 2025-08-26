import React, { useState } from "react";
import {
  Image,
  Linking,
  Modal,
  Pressable,
  // SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path, Rect, SvgProps } from "react-native-svg";
// Pastikan path import ini benar sesuai dengan struktur folder proyek Anda
import { TEAM_DATA } from "../../constants/team-data";
// Saya asumsikan file Colors Anda juga ada di constants
import { Colors } from "../../constants/Colors";

// --- DEFINISI TIPE DATA (TYPE DEFINITIONS) ---
type Member = {
  id: string;
  name: string;
  code: string;
  major: string;
  profilePic: React.FC<SvgProps> | number;
  quote: string; // Menambahkan tipe untuk quote
  socials: {
    instagram: string;
    linkedin: string;
    github: string;
  };
};

// --- KOMPONEN IKON MEDIA SOSIAL ---
const InstagramIcon = (props: SvgProps) => (
  <Svg
    width={28}
    height={28}
    viewBox="0 0 24 24"
    fill="none"
    stroke={Colors.text}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <Rect x={2} y={2} width={20} height={20} rx={5} ry={5} />
    <Path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <Path d="M17.5 6.5h.01" />
  </Svg>
);

const LinkedinIcon = (props: SvgProps) => (
  <Svg
    width={28}
    height={28}
    viewBox="0 0 24 24"
    fill="none"
    stroke={Colors.text}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <Path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
    <Rect x={2} y={9} width={4} height={12} />
    <Circle cx={4} cy={4} r={2} />
  </Svg>
);

const GithubIcon = (props: SvgProps) => (
  <Svg
    width={28}
    height={28}
    viewBox="0 0 24 24"
    fill="none"
    stroke={Colors.text}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <Path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
  </Svg>
);

// --- KARTU ANGGOTA TIM ---
type TeamMemberCardProps = {
  code: string;
  name: string;
  major: string;
  profilePicSource: React.FC<SvgProps> | number;
};

const TeamMemberCard = ({
  code,
  name,
  major,
  profilePicSource,
}: TeamMemberCardProps) => {
  const ProfilePic = profilePicSource;
  return (
    <View style={styles.memberCard}>
      <View style={styles.memberInfoBox}>
        <Text style={styles.memberCode}>{code}</Text>
        <Text style={styles.memberName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.memberMajor} numberOfLines={1}>
          {major}
        </Text>
        <View style={styles.commentTail} />
      </View>
      <View style={styles.memberProfilePic}>
        {typeof ProfilePic === "number" ? (
          <Image
            source={ProfilePic}
            style={styles.profileImage}
            resizeMode="cover"
          />
        ) : (
          <ProfilePic width="100%" height="100%" />
        )}
      </View>
    </View>
  );
};

// --- KOMPONEN UTAMA HALAMAN TIM ---
export default function TeamsScreen() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const handleMemberPress = (member: Member) => {
    setSelectedMember(member);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
  };

  return (
    <SafeAreaView
      style={styles.safeAreaContainer}
      edges={["top", "left", "right"]}
    >
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>RESEARCH DIVISION 2023</Text>
          <Text style={styles.headerSubtitle}>OUR TEAM</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {TEAM_DATA.map((group, index) => (
          <View key={index} style={styles.teamSection}>
            <Text style={styles.sectionTitle}>{group.role}</Text>
            <View style={styles.membersContainer}>
              {group.members.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={styles.memberCardTouchable}
                  onPress={() => handleMemberPress(member)}
                >
                  <TeamMemberCard
                    code={member.code}
                    name={member.name}
                    major={member.major}
                    profilePicSource={member.profilePic}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* --- MODAL DETAIL ANGGOTA --- */}
      {selectedMember && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedMember}
          onRequestClose={handleCloseModal}
        >
          <Pressable style={styles.modalBackdrop} onPress={handleCloseModal}>
            <Pressable style={styles.modalContentContainer}>
              <View style={styles.modalHeader}>
                <View style={styles.modalProfilePic}>
                  {typeof selectedMember.profilePic === "number" ? (
                    <Image
                      source={selectedMember.profilePic}
                      style={styles.profileImage}
                      resizeMode="cover"
                    />
                  ) : (
                    React.createElement(selectedMember.profilePic, {
                      width: "100%",
                      height: "100%",
                    })
                  )}
                </View>
              </View>
              <Text style={styles.modalName}>{selectedMember.name}</Text>
              <Text style={styles.modalCode}>{selectedMember.code}</Text>
              <Text style={styles.modalMajor}>{selectedMember.major}</Text>

              <View style={styles.quoteSection}>
                <Text style={styles.modalQuoteTitle}>Motto</Text>
                <Text style={styles.modalQuote}>
                  &quot;{selectedMember.quote}&quot;
                </Text>
              </View>

              <View style={styles.socialsContainer}>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(selectedMember.socials.instagram)
                  }
                >
                  <InstagramIcon />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(selectedMember.socials.linkedin)
                  }
                >
                  <LinkedinIcon />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => Linking.openURL(selectedMember.socials.github)}
                >
                  <GithubIcon />
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 15,
    color: Colors.text,
  },
  headerSubtitle: {
    fontFamily: "Roboto-Medium",
    fontSize: 24,
    color: Colors.text,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 90,
  },
  teamSection: {
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: "Roboto-SemiBoldItalic",
    fontSize: 18,
    color: Colors.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  membersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 11,
  },
  memberCardTouchable: {
    width: "48%",
  },
  memberCard: {
    alignItems: "center",
    marginBottom: 25,
  },
  memberInfoBox: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
    width: "105%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
    position: "relative",
  },
  commentTail: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: Colors.white,
    position: "absolute",
    bottom: -10,
    alignSelf: "center",
  },
  memberCode: {
    fontFamily: "Poppins-Bold",
    fontSize: 15,
    color: Colors.text,
    textAlign: "center",
  },
  memberName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    color: Colors.primary,
    textAlign: "center",
    marginTop: 2,
  },
  memberMajor: {
    fontFamily: "Poppins-Regular",
    fontSize: 9,
    color: Colors.textLight,
    textAlign: "center",
  },
  memberProfilePic: {
    width: 108,
    height: 108,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: Colors.secondary,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContentContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 80,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    marginTop: -60,
    alignItems: "center",
    marginBottom: 15,
  },
  modalProfilePic: {
    width: 125,
    height: 125,
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: Colors.white,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    elevation: 5,
  },
  modalName: {
    fontFamily: "Poppins-Bold",
    fontSize: 22,
    color: Colors.primary,
    textAlign: "center",
  },
  modalCode: {
    fontFamily: "Roboto-Medium",
    fontSize: 16,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 4,
  },
  modalMajor: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: 15, // Mengurangi margin bawah agar lebih dekat ke garis
  },
  // --- STYLE BARU UNTUK SEKSI QUOTE ---
  quoteSection: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 15,
    marginBottom: 20,
  },
  modalQuoteTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  modalQuote: {
    fontFamily: "Poppins-Regular",
    fontStyle: "italic",
    fontSize: 14,
    color: Colors.textLight,
    textAlign: "center",
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  socialsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 25,
    width: "100%",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
