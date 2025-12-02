import React, { useState } from "react";
import { X, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { CustomerService } from "../services/customerService";

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    birthday: "",
    gender: "Male",
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleReset = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      birthday: "",
      gender: "Male",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.phone_number ||
      !formData.birthday ||
      !formData.gender
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const response = await CustomerService.createCustomer(formData);

      if (response.success) {
        toast.success("Customer created successfully!");
        handleReset();
        onClose();
        onSuccess();
      } else {
        toast.error(response.message || "Failed to create customer");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create customer"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-semibold text-[#161D1F]">
              Create New Customer
            </h2>
            <p className="text-sm text-[#899193] mt-1">
              Enter the customer details to create a new account.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#899193] hover:text-[#161D1F]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#161D1F] mb-2">
                <span className="text-red-500">*</span> First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="John"
                className="w-full px-4 py-3 text-[#161D1F] border border-[#E5E8E9] rounded-lg focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#161D1F] mb-2">
                <span className="text-red-500">*</span> Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full px-4 py-3 border text-[#161D1F] border-[#E5E8E9] rounded-lg focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#161D1F] mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john.doe@example.com"
              className="w-full px-4 py-3 border text-[#161D1F] border-[#E5E8E9] rounded-lg focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#161D1F] mb-2">
              <span className="text-red-500">*</span> Phone Number
            </label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className="w-full px-4 py-3 border text-[#161D1F] border-[#E5E8E9] rounded-lg focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#161D1F] mb-2">
                <span className="text-red-500">*</span> Date of Birth
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-[#161D1F] border-[#E5E8E9] rounded-lg focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#161D1F] mb-2">
                <span className="text-red-500">*</span> Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border text-[#161D1F] border-[#E5E8E9] rounded-lg focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1] text-sm appearance-none bg-white"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 text-sm font-medium text-[#161D1F] border border-[#E5E8E9] rounded-lg hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-sm font-medium text-white bg-[#0088B1] rounded-lg hover:bg-[#006f8e] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create New Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomerModal;
