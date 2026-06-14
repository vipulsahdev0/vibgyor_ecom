import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MapPin, Plus, Loader2, UserCircle, RefreshCw } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { getUserProfile } from "../../api/userApi";
import {
  getUserAddresses, addAddress, updateAddress,
  deleteAddress, setDefaultAddress, getAddressById
} from "../../api/addressApi";
import UserProfileCard from "../../components/users/UserProfileCard";
import AddressCard from "../../components/address/AddressCard";
import AddressForm from "../../components/address/AddressForm";

// ── Skeleton helpers ──────────────────────────────────────────────────────
function SkeletonBlock({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />
  );
}

function ProfileSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-48" />
          <SkeletonBlock className="h-3 w-64" />
          <SkeletonBlock className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}

function AddressSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="h-3 w-56" />
          <SkeletonBlock className="h-3 w-48" />
          <div className="flex gap-2 pt-1">
            <SkeletonBlock className="h-8 w-16 rounded-lg" />
            <SkeletonBlock className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── normalizer (unchanged) ────────────────────────────────────────────────
function normalizeAddressPayload(formData) {
  return {
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
  };
}

export default function Profile() {
  const { user, loading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [profileLoading, setProfileLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const userId = user?.userId ?? user?.id ?? null;

  // ── Fetchers ──────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    if (!userId) { setProfileLoading(false); return; }
    try {
      setProfileLoading(true);
      setProfile(await getUserProfile(userId));
    } catch (err) {
      console.error("Profile error:", err);
      toast.error(err?.message || "Failed to load profile");
    } finally { setProfileLoading(false); }
  }, [userId]);

  const fetchAddresses = useCallback(async () => {
    if (!userId) { setAddressLoading(false); return; }
    try {
      setAddressLoading(true);
      const data = await getUserAddresses(userId);
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Address error:", err);
      toast.error(err?.message || "Failed to load addresses");
    } finally { setAddressLoading(false); }
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

  // ── Handlers (all logic unchanged) ───────────────────────────────────
  const handleAddAddress = async (formData) => {
    if (loading || !userId) return;
    try {
      setSaving(true);
      await addAddress(userId, normalizeAddressPayload(formData));
      toast.success("Address added");
      setEditingAddress(null);
      setShowForm(false);
      await fetchAddresses();
    } catch (err) {
      console.error("Add address error:", err);
      toast.error(err?.message || "Failed to add address");
    } finally { setSaving(false); }
  };

  const handleUpdateAddress = async (formData) => {
    const addressId = editingAddress?.id ?? editingAddress?.addressId;
    if (!userId || !addressId) return;
    try {
      setSaving(true);
      await updateAddress(userId, addressId, normalizeAddressPayload(formData));
      toast.success("Address updated");
      setEditingAddress(null);
      setShowForm(false);
      await fetchAddresses();
    } catch (err) {
      console.error("Update address error:", err);
      toast.error(err?.message || "Failed to update address");
    } finally { setSaving(false); }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!userId || !addressId) return;
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteAddress(userId, addressId);
      toast.success("Address deleted");
      if ((editingAddress?.id ?? editingAddress?.addressId) === addressId) {
        setEditingAddress(null);
        setShowForm(false);
      }
      await fetchAddresses();
    } catch (err) {
      console.error("Delete address error:", err);
      toast.error(err?.message || "Delete failed. Check DELETE /api/users/{userId}/addresses/{addressId}.");
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    if (!userId || !addressId) return;
    try {
      await setDefaultAddress(userId, addressId);
      toast.success("Default address updated");
      await fetchAddresses();
    } catch (err) {
      console.error("Set default error:", err);
      toast.error(err?.message || "Failed to set default address");
    }
  };

  const handleEdit = async (address) => {
    try {
      const addressId = address?.id ?? address?.addressId;

      const fullAddress = await getAddressById(
        user.userId,
        addressId
      );

      setEditingAddress(fullAddress);
      setShowForm(true);

    } catch (err) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
        "Unable to load address"
      );
    }
  };

  const handleCancelForm = () => {
    setEditingAddress(null);
    setShowForm(false);
  };

  const defaultAddressId = useMemo(
    () => addresses.find((a) => a.isDefault)?.id ?? null,
    [addresses]
  );

  // ── Loading / error states ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
        <p className="text-sm font-medium text-slate-600">Loading profile…</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        <UserCircle className="h-12 w-12 text-slate-300" />
        <h2 className="text-lg font-semibold text-slate-800">Session not found</h2>
        <p className="text-sm text-slate-500">Please log in again to continue.</p>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────
  return (
    <div className="space-y-10">

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your account and saved addresses.</p>
        </div>
        <button
          onClick={() => { fetchProfile(); fetchAddresses(); }}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95"
          title="Refresh"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* ── Profile card ──────────────────────────────────────────────── */}
      {profileLoading ? <ProfileSkeleton /> : profile && <UserProfileCard user={profile} />}

      {/* ── Addresses section ─────────────────────────────────────────── */}
      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Saved Addresses</h2>
            {!addressLoading && addresses.length > 0 && (
              <p className="mt-0.5 text-xs text-slate-400">
                {addresses.length} address{addresses.length !== 1 ? "es" : ""} saved
              </p>
            )}
          </div>
          {!showForm && (
            <button
              onClick={() => { setEditingAddress(null); setShowForm(true); }}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
            >
              <Plus className="h-4 w-4" /> Add Address
            </button>
          )}
        </div>

        {/* Address grid / skeleton / empty */}
        {addressLoading ? (
          <AddressSkeleton />
        ) : addresses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {addresses.map((address) => {
              const addrId = address.id ?? address.addressId;
              return (
                <AddressCard
                  key={addrId}
                  address={address}
                  isDefault={defaultAddressId === addrId}
                  onEdit={handleEdit}
                  onDelete={handleDeleteAddress}
                  onSetDefault={handleSetDefaultAddress}
                />
              );
            })}
          </div>
        ) : !showForm ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">No addresses saved</h3>
              <p className="mt-1 text-sm text-slate-500">Add your first delivery address to get started.</p>
            </div>
            <button
              onClick={() => { setEditingAddress(null); setShowForm(true); }}
              className="mt-1 flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95"
            >
              <Plus className="h-4 w-4" /> Add Address
            </button>
          </div>
        ) : null}

        {/* Address form (add / edit) */}
        {showForm && (
          <div id="address-form" className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                onClick={handleCancelForm}
                className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
            <AddressForm
              initialData={editingAddress}
              onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress}
              loading={saving}
              onCancel={handleCancelForm}
            />
          </div>
        )}
      </section>
    </div>
  );
}