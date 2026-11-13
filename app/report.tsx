
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import colors from "../constants/colors";

const PHOTO_BUCKET = "report-photos";

const CATEGORIES = [
  "Pothole",
  "Flooding",
  "Blocked Drainage",
  "Waste",
  "Damaged Facility",
  "Other",
] as const;

type Category = (typeof CATEGORIES)[number];

export default function ReportScreen() {
  const router = useRouter();

  const [category, setCategory] = useState<Category>("Pothole");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lga, setLga] = useState("");
  const [community, setCommunity] = useState("");
  const [locationDetails, setLocationDetails] = useState("");

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState("image/jpeg");
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleChoosePhoto() {
    try {
      setIsPickingImage(true);

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow photo-library access to attach a picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets.length > 0) {
        const photo = result.assets[0];
        const mimeType = photo.mimeType ?? "image/jpeg";

        if (
          !["image/jpeg", "image/png", "image/webp"].includes(mimeType)
        ) {
          Alert.alert(
            "Unsupported image",
            "Please select a JPEG, PNG, or WebP image."
          );
          return;
        }

        setImageUri(photo.uri);
        setImageMimeType(mimeType);
      }
    } catch (error) {
      console.error("Photo selection error:", error);
      Alert.alert("Error", "Unable to select the photo. Please try again.");
    } finally {
      setIsPickingImage(false);
    }
  }

  function resetForm() {
    setCategory("Pothole");
    setTitle("");
    setDescription("");
    setLga("");
    setCommunity("");
    setLocationDetails("");
    setImageUri(null);
    setImageMimeType("image/jpeg");
  }

  async function handleSubmit() {
    if (
      !title.trim() ||
      !description.trim() ||
      !lga.trim() ||
      !community.trim()
    ) {
      Alert.alert(
        "Missing information",
        "Please enter the report title, description, LGA, and community."
      );
      return;
    }

    if (isSubmitting || isPickingImage) return;

    setIsSubmitting(true);

    let uploadedPhotoPath: string | null = null;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert(
          "Sign in required",
          "Please sign in before submitting a report.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/login"),
            },
          ]
        );
        return;
      }

      if (imageUri) {
        const response = await fetch(imageUri);

        if (!response.ok) {
          throw new Error("Unable to read the selected photo.");
        }

        const fileBuffer = await response.arrayBuffer();

        if (fileBuffer.byteLength > 5 * 1024 * 1024) {
          throw new Error("The photo must not exceed 5 MB.");
        }

        const extension =
          imageMimeType === "image/png"
            ? "png"
            : imageMimeType === "image/webp"
              ? "webp"
              : "jpg";

        const filePath = `${user.id}/${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(filePath, fileBuffer, {
            contentType: imageMimeType,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Photo upload failed: ${uploadError.message}`);
        }

        uploadedPhotoPath = filePath;
      }

      const photoPaths = uploadedPhotoPath
        ? [uploadedPhotoPath]
        : [];

      const { data: report, error: insertError } = await supabase
        .from("reports")
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category,
          state: "Anambra State",
          lga: lga.trim(),
          community: community.trim(),
          location_details: locationDetails.trim() || null,
          photo_urls: photoPaths,
        })
        .select("id, tracking_code")
        .single();

      if (insertError) {
        throw new Error(`Report submission failed: ${insertError.message}`);
      }

      Alert.alert(
        "Report submitted successfully",
        `Your report has been received.\n\nTracking number: ${
          report.tracking_code ?? "Pending"
        }\n\nYou can follow its progress in My Reports.`,
        [
          {
            text: "View My Reports",
            onPress: () => {
              resetForm();
              router.replace("/my-reports");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Report submission error:", error);

      if (uploadedPhotoPath) {
        const { error: cleanupError } = await supabase.storage
          .from(PHOTO_BUCKET)
          .remove([uploadedPhotoPath]);

        if (cleanupError) {
          console.error("Photo cleanup error:", cleanupError.message);
        }
      }

      Alert.alert(
        "Submission failed",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderCategories() {
    return (
      <View style={styles.optionsContainer}>
        {CATEGORIES.map((option) => {
          const active = category === option;

          return (
            <Pressable
              key={option}
              onPress={() => setCategory(option)}
              style={[
                styles.option,
                active && styles.selectedOption,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  active && styles.selectedOptionText,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹  Back</Text>
        </Pressable>

        <Text style={styles.heading}>Report a Community Issue</Text>

        <Text style={styles.subtitle}>
          Help improve Anambra State by reporting an issue in your area.
        </Text>

        <Text style={styles.label}>Issue category *</Text>
        {renderCategories()}

        <Text style={styles.label}>Report title *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Damaged road in my community"
          placeholderTextColor="#929292"
          style={styles.input}
          maxLength={100}
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the issue and how it affects residents..."
          placeholderTextColor="#929292"
          style={[styles.input, styles.multilineInput]}
          multiline
          textAlignVertical="top"
          maxLength={2000}
        />

        <Text style={styles.label}>Local Government Area *</Text>
        <TextInput
          value={lga}
          onChangeText={setLga}
          placeholder="Enter your LGA"
          placeholderTextColor="#929292"
          style={styles.input}
        />

        <Text style={styles.label}>Community *</Text>
        <TextInput
          value={community}
          onChangeText={setCommunity}
          placeholder="Enter your community"
          placeholderTextColor="#929292"
          style={styles.input}
        />

        <Text style={styles.label}>Additional location details</Text>
        <TextInput
          value={locationDetails}
          onChangeText={setLocationDetails}
          placeholder="Street, nearby landmark, or directions"
          placeholderTextColor="#929292"
          style={styles.input}
          maxLength={500}
        />

        <Text style={styles.label}>Add a photo (optional)</Text>

        <Pressable
          onPress={handleChoosePhoto}
          disabled={isPickingImage || isSubmitting}
          style={styles.photoButton}
        >
          {isPickingImage ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.photoButtonText}>
              {imageUri ? "Choose another photo" : "Select a photo"}
            </Text>
          )}
        </Pressable>

        {imageUri && (
          <View style={styles.photoPreviewContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.photoPreview}
              resizeMode="cover"
            />

            <Pressable
              onPress={() => setImageUri(null)}
              disabled={isSubmitting}
            >
              <Text style={styles.removePhoto}>Remove photo</Text>
            </Pressable>
          </View>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || isPickingImage}
          style={[
            styles.submitButton,
            (isSubmitting || isPickingImage) && styles.disabledButton,
          ]}
        >
          {isSubmitting ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                Submitting report...
              </Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </Pressable>

        <Text style={styles.footer}>
          Your report will be saved securely. You can track its progress
          and view updates from My Reports.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 18,
    paddingVertical: 6,
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  heading: {
    fontSize: 25,
    fontWeight: "800",
    color: "#17231C",
    marginBottom: 8,
  },
  subtitle: {
    color: "#68736C",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
  },
  label: {
    color: "#24352A",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 17,
    marginBottom: 9,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDE5DF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#17231C",
    backgroundColor: "#FFFFFF",
  },
  multilineInput: {
    minHeight: 120,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    borderWidth: 1,
    borderColor: "#DDE5DF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#FFFFFF",
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    color: "#3D4B42",
    fontSize: 13,
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  photoButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  photoButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  photoPreviewContainer: {
    marginTop: 12,
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#F1F4F1",
  },
  removePhoto: {
    color: "#B42318",
    fontWeight: "600",
    marginTop: 9,
  },
  submitButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    paddingHorizontal: 16,
  },
  disabledButton: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  footer: {
    color: "#7B857E",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 16,
  },
});
