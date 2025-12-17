"use client";
import React, { useState, useEffect } from "react";
import { CalendarClock, X } from "lucide-react";
import {
  NotificationFormData,
  EnumItem,
  CreateNotificationPayload,
  Notification,
} from "../types/types";
import { getEnums, createNotification, uploadImage } from "../services/service";
import BasicInformationTab from "./BasicInformationTab";
import DocumentsTab from "./DocumentsTab";
import SetFrequencyTab from "./SetFrequencyTab";
import NotificationPreview from "./NotificationPreview";
import toast from "react-hot-toast";

interface CreateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  editNotification?: Notification | null;
  onSuccess: () => void;
}

const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({
  isOpen,
  onClose,
  token,
  editNotification,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<
    "basic" | "documents" | "frequency"
  >("basic");
  const [loading, setLoading] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [frequencies, setFrequencies] = useState<EnumItem[]>([]);
  const [userGroups, setUserGroups] = useState<EnumItem[]>([]);
  const [daysOfWeek, setDaysOfWeek] = useState<EnumItem[]>([]);

  const [formData, setFormData] = useState<NotificationFormData>({
    title: "",
    message: "",
    targetUserGroup: "",
    targetUserGroupId: "",
    selectedCustomer: null,
    appUri: "",
    imageFile: null,
    imageUrl: "",
    frequencyType: "",
    frequencyTypeId: "",
    startDate: "",
    endDate: "",
    notificationTime: "",
    selectedDays: [],
    customSchedule: {},
  });

  useEffect(() => {
    if (isOpen && token) {
      loadEnums();
    }
  }, [isOpen, token]);

  // Load edit data
  useEffect(() => {
    if (editNotification && isOpen) {
      populateEditData(editNotification);
    }
  }, [editNotification, isOpen]);

  // Generate image preview
  useEffect(() => {
    if (formData.imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(formData.imageFile);
    } else if (formData.imageUrl) {
      setImagePreviewUrl(formData.imageUrl);
    } else {
      setImagePreviewUrl(null);
    }
  }, [formData.imageFile, formData.imageUrl]);

  const loadEnums = async () => {
    try {
      const [freqResponse, userGroupResponse, daysResponse] = await Promise.all(
        [
          getEnums("NOTIFICATION_FREQ", token),
          getEnums("TARGET_USER_GROUP", token),
          getEnums("DAYS_IN_WEEK", token),
        ]
      );

      if (freqResponse.success) {
        setFrequencies(freqResponse.roles);
        // Set default frequency to ONCE
        const onceFreq = freqResponse.roles.find((f) => f.value === "ONCE");
        if (onceFreq && !editNotification) {
          setFormData((prev) => ({
            ...prev,
            frequencyType: onceFreq.value,
            frequencyTypeId: onceFreq.id,
          }));
        }
      }

      if (userGroupResponse.success) {
        setUserGroups(userGroupResponse.roles);
      }

      if (daysResponse.success) {
        setDaysOfWeek(daysResponse.roles);
      }
    } catch (error) {
      console.error("Error loading enums:", error);
      toast.error("Failed to load form options");
    }
  };

  const populateEditData = (notification: Notification) => {
    const customScheduleObj: { [key: string]: string[] } = {};

    if (notification.custom_schedule) {
      notification.custom_schedule.forEach((scheduleItem) => {
        Object.entries(scheduleItem).forEach(([dayId, times]) => {
          customScheduleObj[dayId] = times;
        });
      });
    }

    setFormData({
      title: notification.message_title,
      message: notification.message_body,
      targetUserGroup: notification.targeted_user_group_value,
      targetUserGroupId: notification.targeted_users_id,
      selectedCustomer: null,
      appUri: notification.app_uri,
      imageFile: null,
      imageUrl: notification.image_url,
      frequencyType: notification.frequency_value,
      frequencyTypeId: notification.frequency_type_id,
      startDate: notification.start_date,
      endDate: notification.end_date || "",
      notificationTime: notification.notification_time || "",
      selectedDays: notification.days_selected?.map((d) => d.id) || [],
      customSchedule: customScheduleObj,
    });
  };

  const updateFormData = (data: Partial<NotificationFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleImageUpload = async (file: File) => {
    try {
      setLoading(true);
      const response = await uploadImage(file, token);
      if (response.success && response.url) {
        updateFormData({ imageUrl: response.url });
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to get image URL");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error("Please enter a notification title");
      setActiveTab("basic");
      return false;
    }

    if (!formData.message.trim()) {
      toast.error("Please enter a notification message");
      setActiveTab("basic");
      return false;
    }

    if (!formData.targetUserGroupId && !formData.selectedCustomer) {
      toast.error("Please select target users");
      setActiveTab("basic");
      return false;
    }

    if (!formData.appUri.trim()) {
      toast.error("Please enter a feature URI");
      setActiveTab("documents");
      return false;
    }

    if (!formData.startDate) {
      toast.error("Please select a start date");
      setActiveTab("frequency");
      return false;
    }

    const isCustom = formData.frequencyType === "CUSTOM";
    const isOnce = formData.frequencyType === "ONCE";

    if (isCustom && Object.keys(formData.customSchedule).length === 0) {
      toast.error("Please add time schedules for selected days");
      setActiveTab("frequency");
      return false;
    }

    if (!isCustom && !formData.notificationTime) {
      toast.error("Please select a notification time");
      setActiveTab("frequency");
      return false;
    }

    return true;
  };

  const buildPayload = (): CreateNotificationPayload => {
    const isCustom = formData.frequencyType === "CUSTOM";
    const isUnicast = !!formData.selectedCustomer;

    let customSchedulePayload = null;
    if (isCustom) {
      const scheduleArray = Object.entries(formData.customSchedule).map(
        ([dayId, times]) => ({
          [dayId]: times,
        })
      );
      customSchedulePayload = { schedule: scheduleArray };
    }

    return {
      queue_id: editNotification?.id || null,
      is_enabled: true,
      is_deleted: false,
      notification_type: isUnicast ? "UNICAST" : "BROADCAST",
      customer_id: formData.selectedCustomer?.id || "",
      targeted_users_id: isUnicast ? "" : formData.targetUserGroupId,
      message_title: formData.title,
      message_body: formData.message,
      app_uri: formData.appUri,
      image_url: formData.imageUrl,
      schedule_id: editNotification?.schedule_id || null,
      frequency_type_id: formData.frequencyTypeId,
      notification_time: isCustom ? null : formData.notificationTime,
      start_date: formData.startDate,
      end_date: formData.endDate || null,
      day_id: isCustom ? [] : formData.selectedDays,
      custom_schedule: customSchedulePayload,
    };
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = buildPayload();
      const response = await createNotification(payload, token);

      if (response.success) {
        toast.success(
          `Notification ${
            editNotification ? "updated" : "created"
          } successfully!`
        );
        onSuccess();
        handleClose();
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("Failed to create notification");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      message: "",
      targetUserGroup: "",
      targetUserGroupId: "",
      selectedCustomer: null,
      appUri: "",
      imageFile: null,
      imageUrl: "",
      frequencyType: "ONCE",
      frequencyTypeId: "",
      startDate: "",
      endDate: "",
      notificationTime: "",
      selectedDays: [],
      customSchedule: {},
    });
    setActiveTab("basic");
    setImagePreviewUrl(null);
    onClose();
  };

  const canProceedToNext = (): boolean => {
    if (activeTab === "basic") {
      return (
        formData.title.trim() !== "" &&
        formData.message.trim() !== "" &&
        (formData.targetUserGroupId !== "" ||
          formData.selectedCustomer !== null)
      );
    }
    if (activeTab === "documents") {
      return formData.appUri.trim() !== "";
    }
    return true;
  };

  const handleNext = () => {
    if (activeTab === "basic") {
      setActiveTab("documents");
    } else if (activeTab === "documents") {
      setActiveTab("frequency");
    }
  };

  const handleBack = () => {
    if (activeTab === "frequency") {
      setActiveTab("documents");
    } else if (activeTab === "documents") {
      setActiveTab("basic");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 ">
          <h2 className="text-[18px] font-semibold text-[#161D1F]">
            {editNotification ? "Edit" : "Create"} Push Notification
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#F8F8F8] px-6">
          <button
            onClick={() => setActiveTab("basic")}
            className={`px-6 py-3 text-[10px] rounded-sm font-medium transition-colors relative ${
              activeTab === "basic"
                ? "text-white bg-[#0088B1] border-[#0088B1]"
                : "text-[#899193] hover:text-[#161D1F]"
            }`}
          >
            Basic Information
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-6 py-3 text-[10px] rounded-sm font-medium transition-colors relative ${
              activeTab === "documents"
                ? "text-white bg-[#0088B1] border-[#0088B1]"
                : "text-[#899193] hover:text-[#161D1F]"
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab("frequency")}
            className={`px-6 py-3 text-[10px] rounded-sm font-medium transition-colors relative ${
              activeTab === "frequency"
                ? "text-white bg-[#0088B1] border-[#0088B1]"
                : "text-[#899193] hover:text-[#161D1F]"
            }`}
          >
            Set Frequency
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-6 p-6">
            {/* Form Section */}
            <div className="col-span-2">
              {activeTab === "basic" && (
                <BasicInformationTab
                  formData={formData}
                  updateFormData={updateFormData}
                  userGroups={userGroups}
                  token={token}
                />
              )}

              {activeTab === "documents" && (
                <DocumentsTab
                  formData={formData}
                  updateFormData={updateFormData}
                  onImageUpload={handleImageUpload}
                />
              )}

              {activeTab === "frequency" && (
                <SetFrequencyTab
                  formData={formData}
                  updateFormData={updateFormData}
                  frequencies={frequencies}
                  daysOfWeek={daysOfWeek}
                />
              )}
            </div>

            {/* Preview Section */}
            <div className="col-span-1">
              <NotificationPreview
                formData={formData}
                imagePreviewUrl={imagePreviewUrl}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleBack}
            disabled={activeTab === "basic"}
            className={`px-6 py-2 text-[12px] font-medium rounded-lg transition-colors ${
              activeTab === "basic"
                ? "text-gray-400 cursor-not-allowed"
                : "text-[#161D1F] hover:bg-gray-100"
            }`}
          >
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 text-[12px] font-medium text-[#161D1F] hover:bg-gray-100 rounded-lg transition-colors"
            >
              Reset
            </button>

            {activeTab !== "frequency" ? (
              <button
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className={`px-6 py-2 text-[12px] font-medium rounded-lg transition-colors ${
                  canProceedToNext()
                    ? "bg-[#0088B1] text-white hover:bg-[#006d8f]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 text-[12px] font-medium bg-[#FF8000] text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <CalendarClock className="w-4 h-4 text-white" />
                    Schedule Notification
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNotificationModal;
