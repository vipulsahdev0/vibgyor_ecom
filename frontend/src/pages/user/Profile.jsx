import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

import { getUserProfile } from "../../api/userApi";
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../api/addressApi";

import UserProfileCard from "../../components/users/UserProfileCard";
import AddressCard from "../../components/address/AddressCard";
import AddressForm from "../../components/address/AddressForm";

export default function Profile() {
  const { user, loading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);

  const [profileLoading, setProfileLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const userId = user?.userId ?? user?.id ?? null;

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfileLoading(false);
      return;
    }

    try {
      setProfileLoading(true);
      const data = await getUserProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error("Profile error:", error);
      toast.error(error?.message || "Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  }, [userId]);

  const fetchAddresses = useCallback(async () => {
    if (!userId) {
      setAddressLoading(false);
      return;
    }

    try {
      setAddressLoading(true);
      const data = await getUserAddresses(userId);
      setAddresses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Address error:", error);
      toast.error(error?.message || "Failed to load addresses");
    } finally {
      setAddressLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (loading) return;
    if (!userId) {
      setProfileLoading(false);
      setAddressLoading(false);
      return;
    }

    fetchProfile();
    fetchAddresses();
  }, [loading, userId, fetchProfile, fetchAddresses]);

  const normalizeAddressPayload = (formData) => ({
    fullName: formData.fullName?.trim() || "",
    mobile: formData.mobile?.trim() || "",
    addressLine1: formData.addressLine1?.trim() || "",
    addressLine2: formData.addressLine2?.trim() || "",
    city: formData.city?.trim() || "",
    state: formData.state?.trim() || "",
    country: formData.country?.trim() || "",
    zipCode: formData.zipCode?.trim() || "",
    addressType: formData.addressType || "SHIPPING",
    isDefault: Boolean(formData.isDefault),
  });

  const handleAddAddress = async (formData) => {
    if (loading || !userId) return;

    try {
      setSaving(true);
      await addAddress(userId, normalizeAddressPayload(formData));
      toast.success("Address added");
      setEditingAddress(null);
      await fetchAddresses();
    } catch (error) {
      console.error("Add address error:", error);
      toast.error(error?.message || "Failed to add address");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAddress = async (formData) => {
    const addressId = editingAddress?.id ?? editingAddress?.addressId;
    if (!userId || !addressId) return;

    try {
      setSaving(true);
      await updateAddress(userId, addressId, normalizeAddressPayload(formData));
      toast.success("Address updated");
      setEditingAddress(null);
      await fetchAddresses();
    } catch (error) {
      console.error("Update address error:", error);
      toast.error(error?.message || "Failed to update address");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!userId || !addressId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );
    if (!confirmed) return;

    try {
      await deleteAddress(userId, addressId);
      toast.success("Address deleted");

      if ((editingAddress?.id ?? editingAddress?.addressId) === addressId) {
        setEditingAddress(null);
      }

      await fetchAddresses();
    } catch (error) {
      console.error("Delete address error:", error);
      toast.error(
        error?.message ||
        "Delete failed. Your backend controller may not have DELETE /api/users/{userId}/addresses/{addressId}."
      );
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    if (!userId || !addressId) return;

    try {
      await setDefaultAddress(userId, addressId);
      toast.success("Default address updated");
      await fetchAddresses();
    } catch (error) {
      console.error("Set default address error:", error);
      toast.error(error?.message || "Failed to set default address");
    }
  };

  const defaultAddressId = useMemo(
    () => addresses.find((address) => address.isDefault)?.id ?? null,
    [addresses]
  );

  if (loading || profileLoading) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Loading profile...
        </h1>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          User session not found
        </h1>
        <p className="mt-2 text-slate-500">
          Please login again to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-2 text-slate-500">
          Manage your account and saved addresses.
        </p>
      </div>

      {profile && <UserProfileCard user={profile} />}

      <div>
        <h2 className="mb-6 text-3xl font-bold text-slate-900">
          Saved Addresses
        </h2>

        {addressLoading ? (
          <div className="mb-10 rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">Loading addresses...</p>
          </div>
        ) : addresses.length > 0 ? (
          <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {addresses.map((address) => (
              <AddressCard
                key={address.id ?? address.addressId}
                address={address}
                isDefault={defaultAddressId === (address.id ?? address.addressId)}
                onEdit={setEditingAddress}
                onDelete={handleDeleteAddress}
                onSetDefault={handleSetDefaultAddress}
              />
            ))}
          </div>
        ) : (
          <div className="mb-10 rounded-2xl bg-white p-10 text-center shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900">
              No addresses saved
            </h3>
            <p className="mt-3 text-slate-500">
              Add your first delivery address.
            </p>
          </div>
        )}

        <AddressForm
          initialData={editingAddress}
          onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress}
          loading={saving}
          onCancel={() => setEditingAddress(null)}
        />
      </div>
    </div>
  );
}