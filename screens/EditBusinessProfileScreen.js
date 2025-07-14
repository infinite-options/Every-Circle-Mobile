import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Dropdown } from "react-native-element-dropdown";
import axios from "axios";
import MiniCard from "../components/MiniCard";
import BottomNavBar from "../components/BottomNavBar";
import ProductCard from "../components/ProductCard";

const BusinessProfileAPI = "https://ioec2ecaspm.infiniteoptions.com/api/v1/businessinfo";

export default function EditBusinessProfileScreen({ route, navigation }) {
  console.log("Edit Button Pressed: EditBusinessProfileScreen", route.params.services);
  const { business } = route.params || {};
  const [businessUID, setBusinessUID] = useState(business?.business_uid || "");

  const [formData, setFormData] = useState({
    name: business?.business_name || "",
    location: business?.business_address_line_1 || "",
    addressLine2: business?.business_address_line_2 || "",
    city: business?.business_city || "",
    state: business?.business_state || "",
    country: business?.business_country || "",
    zip: business?.business_zip_code || "",
    phone: business?.business_phone_number || "",
    email: business?.business_email || "",
    category: business?.business_category || "",
    tagline: business?.tagline || "",
    shortBio: business?.business_short_bio || "",
    businessRole: business?.business_role || "",
    einNumber: business?.business_ein_number || "",
    website: business?.business_website || "",
    customTags: Array.isArray(business?.custom_tags) ? business.custom_tags : [],
    images: Array.isArray(business?.images) ? business.images : [],
    socialLinks: {
      facebook: business?.facebook || "",
      instagram: business?.instagram || "",
      linkedin: business?.linkedin || "",
      youtube: business?.youtube || "",
    },
    emailIsPublic: business?.email_is_public === "1",
    phoneIsPublic: business?.phone_is_public === "1",
    taglineIsPublic: business?.tagline_is_public === "1",
    shortBioIsPublic: business?.short_bio_is_public === "1",
  });

  const [customTagInput, setCustomTagInput] = useState("");

  const businessRoles = [
    { label: 'Owner', value: 'owner' },
    { label: 'Employee', value: 'employee' },
    { label: 'Partner', value: 'partner' },
    { label: 'Admin', value: 'admin' },
    { label: 'Other', value: 'other' },
  ];

  const toggleVisibility = (fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const handleSave = async () => {
    console.log("Save Button Pressed: handleSave");
    if (!formData.name.trim() || !businessUID.trim()) {
      Alert.alert("Error", "Business name and ID are required.");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("business_uid", businessUID);
      payload.append("business_name", formData.name);
      payload.append("business_address_line_1", formData.location);
      payload.append("business_address_line_2", formData.addressLine2);
      payload.append("business_city", formData.city);
      payload.append("business_state", formData.state);
      payload.append("business_country", formData.country);
      payload.append("business_zip_code", formData.zip);
      payload.append("business_phone_number", formData.phone);
      payload.append("business_email_id", formData.email);
      payload.append("business_category_id", formData.category);
      payload.append("business_short_bio", formData.shortBio);
      payload.append("business_tag_line", formData.tagline);
      payload.append("business_role", formData.businessRole);
      payload.append("business_ein_number", formData.einNumber);
      payload.append("business_website", formData.website);
      payload.append("custom_tags", JSON.stringify(formData.customTags));
      
      // Separate Google and user-uploaded images
      const googleImages = formData.images || [];
      const userImages = formData.images || [];

      // Append Google images as URLs
      payload.append('business_google_photos', JSON.stringify(googleImages));

      // Append user-uploaded images as files and collect their filenames
      const userImageFilenames = [];
      userImages.forEach((imageUri, index) => {
        if (imageUri && (imageUri.startsWith('file://') || imageUri.startsWith('content://'))) {
          const uriParts = imageUri.split('.');
          const fileType = uriParts[uriParts.length - 1];
          const fileName = `business_image_${index}.${fileType}`;
          userImageFilenames.push(fileName);
          payload.append(
            `image_${index}`,
            {
              uri: imageUri,
              type: `image/${fileType}`,
              name: fileName,
            }
          );
        }
      });
      // Send the filenames as business_images_url
      payload.append('business_images_url', JSON.stringify(userImageFilenames));
      
      payload.append("social_links", JSON.stringify(formData.socialLinks));
      payload.append("business_email_id_is_public", formData.emailIsPublic ? "1" : "0");
      payload.append("business_phone_number_is_public", formData.phoneIsPublic ? "1" : "0");
      payload.append("business_tag_line_is_public", formData.taglineIsPublic ? "1" : "0");
      payload.append("business_short_bio_is_public", formData.shortBioIsPublic ? "1" : "0");

      const cleanLinks = {};
      ["facebook", "instagram", "linkedin", "youtube"].forEach((platform) => {
        if (formData.socialLinks[platform]) {
          cleanLinks[platform] = formData.socialLinks[platform];
        }
      });
      
      const fullServiceSchema = (service, idx) => {
        // Create base schema without bs_uid
        const baseSchema = {
          bs_service_name: service.bs_service_name || '',
          bs_service_desc: service.bs_service_desc || '',
          bs_notes: service.bs_notes || '',
          bs_sku: service.bs_sku || '',
          bs_bounty: service.bs_bounty || '',
          bs_bounty_currency: service.bs_bounty_currency || 'USD',
          bs_is_taxable: typeof service.bs_is_taxable === 'undefined' ? 1 : service.bs_is_taxable,
          bs_tax_rate: service.bs_tax_rate || '0',
          bs_discount_allowed: typeof service.bs_discount_allowed === 'undefined' ? 1 : service.bs_discount_allowed,
          bs_refund_policy: service.bs_refund_policy || '',
          bs_return_window_days: service.bs_return_window_days || '0',
          bs_display_order: typeof service.bs_display_order === 'undefined' ? idx + 1 : service.bs_display_order,
          bs_tags: service.bs_tags || '',
          bs_duration_minutes: service.bs_duration_minutes || '',
          bs_cost: service.bs_cost || '',
          bs_cost_currency: service.bs_cost_currency || 'USD',
          bs_is_visible: typeof service.bs_is_visible === 'undefined' ? 1 : service.bs_is_visible,
          bs_status: service.bs_status || 'active',
          bs_image_key: service.bs_image_key || '',
        };

        // Only include bs_uid if it exists and is not empty
        if (service.bs_uid && service.bs_uid.trim() !== '') {
          return {
            ...baseSchema,
            bs_uid: service.bs_uid
          };
        }

        return baseSchema;
      };

      const servicesToSend = services.map(fullServiceSchema);
      console.log("Services being sent to backend:", servicesToSend.map(s => ({ 
        name: s.bs_service_name, 
        bs_uid: s.bs_uid || 'not included' 
      })));
      payload.append("business_services", JSON.stringify(servicesToSend));
      
      console.log("FormData to be submitted:");
      for (let pair of payload.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      // console.log("Before API Call:", payload);
      console.log("Business Endpoint PUT:", `${BusinessProfileAPI}`);
      
      const response = await axios.put(`${BusinessProfileAPI}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        Alert.alert("Success", "Business profile updated.");
        navigation.navigate("BusinessProfile", { business_uid: businessUID });
      } else {
        Alert.alert("Error", "Update failed. Try again.");
      }
    } catch (error) {
      // Handle 413 Payload Too Large
      if (error.response && error.response.status === 413) {
        Alert.alert("File Too Large", `One or more images were too large to upload (total size: ${(newTotal / 1024).toFixed(1)} KB). Please select images under 2MB.`);
        return;
      }
      console.error("Save error:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const addCustomTag = () => {
    if (customTagInput.trim() && !(formData.customTags || []).includes(customTagInput.trim())) {
      const updatedTags = [...(formData.customTags || []), customTagInput.trim()];
      setFormData({ ...formData, customTags: updatedTags });
      setCustomTagInput("");
    }
  };

  const removeCustomTag = (tagToRemove) => {
    const updatedTags = (formData.customTags || []).filter(tag => tag !== tagToRemove);
    setFormData({ ...formData, customTags: updatedTags });
  };

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    if (!result.canceled) {
      // Calculate total size of current images (if any have fileSize info)
      let currentTotal = 0;
      // If images are local files, we can't get their size here, so we only check new ones
      // If you want to enforce stricter checks, you could store fileSize in state for each image

      // Calculate total size of new images
      let newTotal = 0;
      let newImages = [];
      for (const asset of result.assets) {
        if (asset.fileSize) {
          newTotal += asset.fileSize;
        }
        newImages.push(asset.uri);
      }
      // 2MB = 2 * 1024 * 1024 = 2,097,152 bytes
      const MAX_SIZE = 2 * 1024 * 1024;
      if (newTotal > MAX_SIZE) {
        Alert.alert('File not selectable', `Total image size (${(newTotal / 1024).toFixed(1)} KB) will exceed the 2MB upload limit.`);
        return;
      }
      const currentImages = formData.images || [];
      setFormData({ ...formData, images: [...currentImages, ...newImages] });
    }
  };

  const removeImage = (indexToRemove) => {
    const updatedImages = (formData.images || []).filter((_, index) => index !== indexToRemove);
    setFormData({ ...formData, images: updatedImages });
  };

  const renderField = (label, value, key, placeholder, visibilityKey = null) => (
    <View style={styles.fieldContainer}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {visibilityKey && (
          <TouchableOpacity onPress={() => toggleVisibility(visibilityKey)}>
            <Text style={{ color: formData[visibilityKey] ? "green" : "red" }}>{formData[visibilityKey] ? "Public" : "Private"}</Text>
          </TouchableOpacity>
        )}
      </View>
      <TextInput style={styles.input} value={value} placeholder={placeholder || label} onChangeText={(text) => setFormData({ ...formData, [key]: text })} />
    </View>
  );

  const renderSocialField = (label, platform) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={formData.socialLinks[platform]}
        placeholder={`Enter ${platform} link`}
        onChangeText={(text) =>
          setFormData({
            ...formData,
            socialLinks: { ...formData.socialLinks, [platform]: text },
          })
        }
      />
    </View>
  );

  const previewBusiness = {
    business_name: formData.name,
    tagline: formData.tagline,
    business_short_bio: formData.shortBio,
    business_phone_number: formData.phone,
    business_email: formData.email,
  };

  const renderCustomTagsSection = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>Custom Tags</Text>
      <View style={styles.tagInputContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 10, marginBottom: 0 }]}
          value={customTagInput}
          placeholder="Add a custom tag"
          onChangeText={setCustomTagInput}
        />
        <TouchableOpacity style={styles.addTagButton} onPress={addCustomTag}>
          <Text style={styles.addTagButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tagsContainer}>
        {(formData.customTags || []).map((tag, index) => (
          <View key={index} style={styles.tagChip}>
            <Text style={styles.tagText}>{tag}</Text>
            <TouchableOpacity onPress={() => removeCustomTag(tag)}>
              <Text style={styles.removeTagText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderImagesSection = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>Business Images</Text>
      <TouchableOpacity style={styles.addImageButton} onPress={handleImagePick}>
        <Text style={styles.addImageButtonText}>+ Add Images</Text>
      </TouchableOpacity>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
        <View style={styles.imageRow}>
          {(formData.images || []).map((imageUri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: imageUri }} style={styles.businessImage} resizeMode='cover' />
              <TouchableOpacity 
                style={styles.deleteIcon}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderBusinessRoleField = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>Business Role</Text>
      <Dropdown
        style={styles.input}
        data={businessRoles}
        labelField="label"
        valueField="value"
        placeholder="Select your role"
        value={formData.businessRole}
        onChange={item => setFormData({ ...formData, businessRole: item.value })}
        containerStyle={{ borderRadius: 10 }}
      />
    </View>
  );

  const [services, setServices] = useState(() => {
    // Initialize services with proper bs_uid preservation
    const initialServices = business?.business_services || business?.services || [];
    console.log("Initial services with bs_uid:", initialServices.map(s => ({ name: s.bs_service_name, bs_uid: s.bs_uid })));
    return initialServices.map(service => ({
      ...defaultService,
      ...service,
      bs_uid: service.bs_uid || '' // Ensure bs_uid is preserved
    }));
  });

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingServiceIndex, setEditingServiceIndex] = useState(null);

  const defaultService = {
    bs_uid: '',
    bs_service_name: '',
    bs_service_desc: '',
    bs_notes: '',
    bs_sku: '',
    bs_bounty: '',
    bs_bounty_currency: 'USD',
    bs_is_taxable: 1,
    bs_tax_rate: '0',
    bs_discount_allowed: 1,
    bs_refund_policy: '',
    bs_return_window_days: '0',
    bs_display_order: 1,
    bs_tags: '',
    bs_duration_minutes: '',
    bs_cost: '',
    bs_cost_currency: 'USD',
    bs_is_visible: 1,
    bs_status: 'active',
    bs_image_key: '',
  };

  const [serviceForm, setServiceForm] = useState({ ...defaultService });

  const handleServiceChange = (field, value) => {
    setServiceForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddService = () => {
    if (!serviceForm.bs_service_name.trim()) {
      Alert.alert('Validation', 'Product or Service name is required.');
      return;
    }

    if (editingServiceIndex !== null) {
      // Update existing service - preserve the bs_uid
      const updatedServices = [...services];
      const existingService = updatedServices[editingServiceIndex];
      console.log("Editing existing service with bs_uid:", existingService.bs_uid);
      updatedServices[editingServiceIndex] = { 
        ...serviceForm,
        bs_uid: existingService.bs_uid // Preserve the original bs_uid
      };
      setServices(updatedServices);
    } else {
      // Add new service - explicitly set bs_uid to empty string
      console.log("Adding new service - no bs_uid");
      setServices(prev => [...prev, { 
        ...defaultService, 
        ...serviceForm,
        bs_uid: '' // Explicitly set empty bs_uid for new services
      }]);
    }

    // Reset form and state
    setServiceForm({ ...defaultService });
    setShowServiceForm(false);
    setEditingServiceIndex(null);
  };

  const handleEditService = (service, index) => {
    console.log("Editing service with bs_uid:", service.bs_uid);
    // When editing, make sure to include the bs_uid in the form
    setServiceForm({
      ...defaultService,
      ...service,
      bs_uid: service.bs_uid || '' // Ensure bs_uid is preserved, default to empty string if missing
    });
    setEditingServiceIndex(index);
    setShowServiceForm(true);
  };

  const handleCancelEdit = () => {
    setServiceForm({ ...defaultService });
    setShowServiceForm(false);
    setEditingServiceIndex(null);
  };

  return (
    <View style={styles.pageContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.header}>Edit Business Profile</Text>

        {renderField("Business Name", formData.name, "name")}
        {renderField("Location", formData.location, "location")}
        {renderField("Address Line 2", formData.addressLine2, "addressLine2")}
        {renderField("City", formData.city, "city")}
        {renderField("State", formData.state, "state")}
        {renderField("Country", formData.country, "country")}
        {renderField("Zip Code", formData.zip, "zip")}
        {renderField("Phone Number", formData.phone, "phone", "", "phoneIsPublic")}
        {renderField("Email", formData.email, "email", "", "emailIsPublic")}
        {renderField("Business Category", formData.category, "category")}
        {renderField("Tag Line", formData.tagline, "tagline", "", "taglineIsPublic")}
        {renderField("Short Bio", formData.shortBio, "shortBio", "", "shortBioIsPublic")}
        {renderBusinessRoleField()}
        {renderField("EIN Number", formData.einNumber, "einNumber")}
        {renderField("Website", formData.website, "website")}
        {renderCustomTagsSection()}

        <View style={styles.previewSection}>
          <Text style={styles.label}>MiniCard Preview:</Text>
          <MiniCard business={previewBusiness} />
        </View>

        <Text style={styles.label}>Social Links</Text>
        {renderSocialField("Facebook", "facebook")}
        {renderSocialField("Instagram", "instagram")}
        {renderSocialField("LinkedIn", "linkedin")}
        {renderSocialField("YouTube", "youtube")}

        {renderImagesSection()}

        {/* Products & Services Section */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Products & Services</Text>
          {services.length === 0 && <Text style={{ color: '#888', textAlign: 'center' }}>No products or services added yet.</Text>}
          {services.map((service, idx) => (
            <ProductCard 
              key={idx} 
              service={service} 
              onEdit={() => handleEditService(service, idx)} 
              showEditButton={true}
            />
          ))}
          {showServiceForm ? (
            <View style={{ backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, marginTop: 10 }}>
              <Text style={styles.formTitle}>{editingServiceIndex !== null ? 'Edit Product/Service' : 'Add New Product/Service'}</Text>
              <TextInput 
                style={styles.input} 
                value={serviceForm.bs_service_name} 
                onChangeText={t => handleServiceChange('bs_service_name', t)} 
                placeholder="Product or Service Name" 
              />
              <TextInput 
                style={styles.input} 
                value={serviceForm.bs_service_desc} 
                onChangeText={t => handleServiceChange('bs_service_desc', t)} 
                placeholder="Description" 
              />
              <TextInput 
                style={styles.input} 
                value={serviceForm.bs_cost} 
                onChangeText={t => handleServiceChange('bs_cost', t)} 
                placeholder="Cost (e.g. 25.00)" 
                keyboardType="decimal-pad" 
              />
              <TextInput 
                style={styles.input} 
                value={serviceForm.bs_cost_currency} 
                onChangeText={t => handleServiceChange('bs_cost_currency', t)} 
                placeholder="Currency (e.g. USD)" 
              />
              <TextInput 
                style={styles.input} 
                value={serviceForm.bs_bounty} 
                onChangeText={t => handleServiceChange('bs_bounty', t)} 
                placeholder="Bounty (e.g. 10.00)" 
                keyboardType="decimal-pad" 
              />
              <TextInput 
                style={styles.input} 
                value={serviceForm.bs_bounty_currency} 
                onChangeText={t => handleServiceChange('bs_bounty_currency', t)} 
                placeholder="Bounty Currency (e.g. USD)" 
              />
              <View style={styles.formButtons}>
                <TouchableOpacity 
                  style={[styles.formButton, styles.cancelButton]} 
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.formButton, styles.addButton]} 
                  onPress={handleAddService}
                >
                  <Text style={styles.addButtonText}>
                    {editingServiceIndex !== null ? 'Update' : 'Add'} Product/Service
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.addTagButton, { marginTop: 10 }]} 
              onPress={() => {
                setServiceForm({ ...defaultService });
                setEditingServiceIndex(null);
                setShowServiceForm(true);
              }}
            >
              <Text style={styles.addTagButtonText}>+ Add Product/Service</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 120 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  fieldContainer: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5 },
  saveButton: {
    backgroundColor: "#00C721",
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  previewSection: {
    marginVertical: 20,
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
  },
  tagInputContainer: { flexDirection: "row", alignItems: "center" },
  addTagButton: {
    backgroundColor: "#00C721",
    padding: 10,
    borderRadius: 5,
  },
  addTagButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  tagChip: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  tagText: {
    fontSize: 14,
    marginRight: 5,
  },
  removeTagText: {
    color: "red",
    fontSize: 18,
    fontWeight: "bold",
  },
  imageScroll: {
    marginTop: 10,
    height: 120,
  },
  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 10,
    backgroundColor: "#fff",
    position: "relative",
  },
  businessImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  deleteIcon: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  deleteText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  addImageButton: {
    backgroundColor: "#00C721",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  addImageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  formButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  addButton: {
    backgroundColor: '#00C721',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
