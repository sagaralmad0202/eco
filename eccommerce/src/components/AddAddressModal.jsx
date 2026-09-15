import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import addressApi from "../services/addressApi";

export default function AddAddressModal({
  isOpen,
  onClose,
  onSuccess,
  defaultValues = null,
}) {
  const [form, setForm] = useState({
    fullName: defaultValues?.fullName || "",
    phone: defaultValues?.phone || "",
    line1: defaultValues?.line1 || "",
    line2: defaultValues?.line2 || "",
    city: defaultValues?.city || "",
    state: defaultValues?.state || "",
    postalCode: defaultValues?.postalCode || "",
    country: defaultValues?.country || "IN",
    type: defaultValues?.type || "SHIPPING",
    isDefault: defaultValues?.isDefault ?? false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Close on Escape key and lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, isSubmitting]);

  // Reset form when modal opens with fresh data if provided
  useEffect(() => {
    if (isOpen) {
      setForm({
        fullName: defaultValues?.fullName || "",
        phone: defaultValues?.phone || "",
        line1: defaultValues?.line1 || "",
        line2: defaultValues?.line2 || "",
        city: defaultValues?.city || "",
        state: defaultValues?.state || "",
        postalCode: defaultValues?.postalCode || "",
        country: defaultValues?.country || "IN",
        type: defaultValues?.type || "SHIPPING",
        isDefault: defaultValues?.isDefault ?? false,
      });
      setErrors({});
      setServerError(null);
    }
  }, [isOpen, defaultValues]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    const val = inputType === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (serverError) setServerError(null);
  };

  const validate = () => {
    const newErrors = {};
    const fullName = form.fullName.trim();
    const phone = form.phone.replace(/\D/g, "").slice(-10);
    const line1 = form.line1.trim();
    const city = form.city.trim();
    const state = form.state.trim();
    const postalCode = form.postalCode.trim();

    if (!fullName || fullName.length < 2) {
      newErrors.fullName = "Enter the recipient's full name (at least 2 characters).";
    } else if (fullName.length > 100) {
      newErrors.fullName = "Full name cannot exceed 100 characters.";
    }

    if (!phone) {
      newErrors.phone = "Enter a phone number for delivery updates.";
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number starting with 6-9.";
    }

    if (!line1 || line1.length < 5) {
      newErrors.line1 = "Enter the street address (at least 5 characters).";
    } else if (line1.length > 200) {
      newErrors.line1 = "Address line 1 cannot exceed 200 characters.";
    }

    if (form.line2 && form.line2.length > 200) {
      newErrors.line2 = "Address line 2 cannot exceed 200 characters.";
    }

    if (!city || city.length < 2) {
      newErrors.city = "Enter the city name (at least 2 characters).";
    } else if (city.length > 100) {
      newErrors.city = "City cannot exceed 100 characters.";
    }

    if (!state || state.length < 2) {
      newErrors.state = "Enter the state/province name.";
    } else if (state.length > 100) {
      newErrors.state = "State cannot exceed 100 characters.";
    }

    if (!postalCode) {
      newErrors.postalCode = "Enter the 6-digit PIN / postal code.";
    } else if (!/^[1-9]\d{5}$/.test(postalCode)) {
      newErrors.postalCode = "Enter a valid 6-digit Indian PIN code (cannot start with 0).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    const payload = {
      type: form.type || "SHIPPING",
      fullName: form.fullName.trim(),
      phone: form.phone.replace(/\D/g, "").slice(-10),
      line1: form.line1.trim(),
      ...(form.line2?.trim() ? { line2: form.line2.trim() } : {}),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      country: form.country || "IN",
      isDefault: Boolean(form.isDefault),
    };

    try {
      const response = await addressApi.create(payload);
      const createdAddress = response.data;
      toast.success("Shipping address added successfully!");
      if (onSuccess) {
        onSuccess(createdAddress);
      }
      onClose();
    } catch (err) {
      console.error("Failed to add address:", err);
      const message =
        err?.message ||
        err?.response?.data?.message ||
        "Could not add the shipping address. Please verify your details and try again.";
      setServerError(message);
      toast.error(message);

      // Map backend validation field errors if any
      if (Array.isArray(err?.fieldErrors)) {
        const fieldMap = {};
        err.fieldErrors.forEach(({ field, message: errMsg }) => {
          fieldMap[field] = errMsg;
        });
        setErrors((prev) => ({ ...prev, ...fieldMap }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/45 backdrop-blur-xs dark:bg-black/65 transition-opacity"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div className="fixed inset-0 z-[10000] w-screen overflow-y-auto p-3 sm:p-6 flex items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-address-title"
          className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl ring-1 ring-neutral-950/10 dark:bg-neutral-900 dark:ring-white/10 transition-all text-left max-h-[92vh] flex flex-col overflow-hidden"
          style={{ fontFamily: 'Poppins, "Poppins Fallback", sans-serif' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Fixed at top */}
          <div className="px-6 sm:px-8 pt-6 pb-4 shrink-0 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between gap-4">
            <div className="pr-2">
              <h2
                id="add-address-title"
                className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white"
              >
                Add New Shipping Address
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Enter your delivery address details below. Fields marked with{" "}
                <span className="text-red-500 font-semibold">*</span> are required.
              </p>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close modal"
              className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body - Scrollable with hidden-scrollbar */}
          <div className="px-6 sm:px-8 py-5 flex-1 overflow-y-auto hidden-scrollbar">
            {/* Server Error Alert Banner */}
            {serverError ? (
              <div className="mb-4 rounded-2xl bg-red-50 p-3.5 border border-red-200 dark:bg-red-950/40 dark:border-red-800/60 text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-start gap-2.5">
                <svg
                  className="w-4 h-4 shrink-0 mt-0.5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{serverError}</span>
              </div>
            ) : null}

            {/* Address Form */}
            <form id="add-address-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {/* Full Name */}
                <div className="sm:col-span-1">
                  <label
                    htmlFor="modal-full-name"
                    className="block text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="modal-full-name"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Recipient's name"
                      autoComplete="name"
                      disabled={isSubmitting}
                      aria-invalid={Boolean(errors.fullName)}
                      className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2 text-sm text-neutral-900 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500 disabled:opacity-60"
                    />
                    {errors.fullName ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.fullName}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Phone Number */}
                <div className="sm:col-span-1">
                  <label
                    htmlFor="modal-phone"
                    className="block text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs sm:text-sm font-medium text-neutral-400 dark:text-neutral-500 pointer-events-none select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        id="modal-phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        maxLength={10}
                        inputMode="tel"
                        autoComplete="tel"
                        disabled={isSubmitting}
                        aria-invalid={Boolean(errors.phone)}
                        className="block w-full rounded-full border border-neutral-200/80 bg-white pl-12 pr-4 py-2 text-sm text-neutral-900 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500 disabled:opacity-60"
                      />
                    </div>
                    {errors.phone ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.phone}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Address Line 1 */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="modal-line1"
                    className="block text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200"
                  >
                    Street Address / House No. / Road <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="modal-line1"
                      name="line1"
                      value={form.line1}
                      onChange={handleChange}
                      placeholder="House / Flat / Block No., Street, Area"
                      autoComplete="street-address"
                      disabled={isSubmitting}
                      aria-invalid={Boolean(errors.line1)}
                      className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2 text-sm text-neutral-900 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500 disabled:opacity-60"
                    />
                    {errors.line1 ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.line1}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Address Line 2 */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="modal-line2"
                    className="block text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200"
                  >
                    Apartment, Suite, Unit, Landmark (optional)
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="modal-line2"
                      name="line2"
                      value={form.line2}
                      onChange={handleChange}
                      placeholder="e.g. Near City Park, Apt 4B"
                      disabled={isSubmitting}
                      aria-invalid={Boolean(errors.line2)}
                      className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2 text-sm text-neutral-900 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500 disabled:opacity-60"
                    />
                    {errors.line2 ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.line2}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="modal-city"
                    className="block text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200"
                  >
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="modal-city"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="e.g. Kalaburagi"
                      autoComplete="address-level2"
                      disabled={isSubmitting}
                      aria-invalid={Boolean(errors.city)}
                      className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2 text-sm text-neutral-900 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500 disabled:opacity-60"
                    />
                    {errors.city ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.city}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* State / Province */}
                <div>
                  <label
                    htmlFor="modal-state"
                    className="block text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200"
                  >
                    State / Province <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="modal-state"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="e.g. Karnataka"
                      autoComplete="address-level1"
                      disabled={isSubmitting}
                      aria-invalid={Boolean(errors.state)}
                      className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2 text-sm text-neutral-900 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500 disabled:opacity-60"
                    />
                    {errors.state ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.state}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* PIN Code */}
                <div>
                  <label
                    htmlFor="modal-postal-code"
                    className="block text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200"
                  >
                    PIN Code / Postal Code <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="modal-postal-code"
                      name="postalCode"
                      value={form.postalCode}
                      onChange={handleChange}
                      placeholder="e.g. 585101"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      disabled={isSubmitting}
                      aria-invalid={Boolean(errors.postalCode)}
                      className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2 text-sm text-neutral-900 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500 disabled:opacity-60"
                    />
                    {errors.postalCode ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.postalCode}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label
                    htmlFor="modal-country"
                    className="block text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200"
                  >
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <select
                      id="modal-country"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="block w-full rounded-full border border-neutral-200/80 bg-white px-4 py-2 text-sm text-neutral-900 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-500 dark:focus:ring-blue-500 appearance-none pr-10 disabled:opacity-60"
                    >
                      <option value="IN">India</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg
                        className="h-4 w-4 text-neutral-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Set as default address checkbox */}
              <div className="pt-1.5 flex items-center gap-x-2.5">
                <input
                  id="modal-is-default"
                  name="isDefault"
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border border-neutral-300 bg-white text-neutral-900 focus:ring-neutral-900 accent-neutral-900 cursor-pointer dark:border-neutral-700 dark:bg-neutral-900"
                />
                <label
                  htmlFor="modal-is-default"
                  className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer select-none"
                >
                  Set as default shipping address
                </label>
              </div>
            </form>
          </div>

          {/* Footer - Fixed at bottom, always fully visible */}
          <div className="px-6 sm:px-8 py-4 shrink-0 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 bg-transparent px-6 py-2.5 text-sm font-medium text-neutral-900 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="add-address-form"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 dark:bg-white px-7 py-2.5 text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-neutral-900"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Saving address…</span>
                </>
              ) : (
                <span>Save Address</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
