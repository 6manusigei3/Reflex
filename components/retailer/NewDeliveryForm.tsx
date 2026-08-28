"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  apiRequest,
  getErrorMessage,
  type ApiDelivery,
} from "@/lib/api";

type DeliveryFormData = {
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  deliveryAddress: string;
  itemDescription: string;
  deliveryNotes: string;
  priority: "normal" | "high" | "urgent";
};

const initialForm: DeliveryFormData = {
  customerName: "",
  customerPhone: "",
  pickupLocation: "",
  deliveryAddress: "",
  itemDescription: "",
  deliveryNotes: "",
  priority: "normal",
};

export default function NewDeliveryForm() {
  const [form, setForm] = useState<DeliveryFormData>(initialForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof DeliveryFormData, string>>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [createdDelivery, setCreatedDelivery] = useState<ApiDelivery | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function updateField(
    field: keyof DeliveryFormData,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    }
  }

  function validateForm() {
    const newErrors: Partial<
      Record<keyof DeliveryFormData, string>
    > = {};

    if (!form.customerName.trim()) {
      newErrors.customerName =
        "Customer name is required.";
    }

    if (!form.customerPhone.trim()) {
      newErrors.customerPhone =
        "Customer phone number is required.";
    } else if (
      !/^(\+254|254|0)?[17]\d{8}$/.test(
        form.customerPhone.replace(/\s/g, "")
      )
    ) {
      newErrors.customerPhone =
        "Enter a valid Kenyan phone number.";
    }

    if (!form.pickupLocation.trim()) {
      newErrors.pickupLocation =
        "Pickup location is required.";
    }

    if (!form.deliveryAddress.trim()) {
      newErrors.deliveryAddress =
        "Delivery address is required.";
    }

    if (!form.itemDescription.trim()) {
      newErrors.itemDescription =
        "Item description is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const delivery = await apiRequest<ApiDelivery>("/deliveries", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setCreatedDelivery(delivery);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setErrors({});
    setSubmitted(false);
    setCreatedDelivery(null);
    setSubmitError("");
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
          ✓
        </div>

        <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
          Delivery request created
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Delivery {createdDelivery?.id} is now pending and visible to the
          dispatcher for rider assignment.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <SummaryItem
              label="Customer"
              value={form.customerName}
            />

            <SummaryItem
              label="Phone"
              value={form.customerPhone}
            />

            <SummaryItem
              label="Pickup"
              value={form.pickupLocation}
            />

            <SummaryItem
              label="Destination"
              value={form.deliveryAddress}
            />

            <SummaryItem
              label="Priority"
              value={
                form.priority.charAt(0).toUpperCase() +
                form.priority.slice(1)
              }
            />

            <SummaryItem
              label="Item"
              value={form.itemDescription}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Create Another
          </button>

          <Link
            href="/retailer"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
    >
      <div className="space-y-6">
        
        <FormSection
          title="Customer information"
          description="Who is receiving this delivery?"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label="Customer name"
              required
              error={errors.customerName}
            >
              <input
                type="text"
                value={form.customerName}
                onChange={(event) =>
                  updateField(
                    "customerName",
                    event.target.value
                  )
                }
                placeholder="e.g. Grace Wanjiku"
                className={inputClasses(
                  !!errors.customerName
                )}
              />
            </FormField>

            <FormField
              label="Phone number"
              required
              error={errors.customerPhone}
            >
              <input
                type="tel"
                value={form.customerPhone}
                onChange={(event) =>
                  updateField(
                    "customerPhone",
                    event.target.value
                  )
                }
                placeholder="e.g. 0712 345 678"
                className={inputClasses(
                  !!errors.customerPhone
                )}
              />
            </FormField>
          </div>
        </FormSection>

    
        <FormSection
          title="Delivery route"
          description="Where should the rider collect and deliver the package?"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label="Pickup location"
              required
              error={errors.pickupLocation}
            >
              <input
                type="text"
                value={form.pickupLocation}
                onChange={(event) =>
                  updateField(
                    "pickupLocation",
                    event.target.value
                  )
                }
                placeholder="e.g. Westlands, Nairobi"
                className={inputClasses(
                  !!errors.pickupLocation
                )}
              />
            </FormField>

            <FormField
              label="Delivery address"
              required
              error={errors.deliveryAddress}
            >
              <input
                type="text"
                value={form.deliveryAddress}
                onChange={(event) =>
                  updateField(
                    "deliveryAddress",
                    event.target.value
                  )
                }
                placeholder="e.g. Kilimani, Nairobi"
                className={inputClasses(
                  !!errors.deliveryAddress
                )}
              />
            </FormField>
          </div>
        </FormSection>

       
        <FormSection
          title="Package details"
          description="Add enough information for the dispatcher and rider to understand the delivery."
        >
          <div className="space-y-5">
            <FormField
              label="Item description"
              required
              error={errors.itemDescription}
            >
              <textarea
                rows={4}
                value={form.itemDescription}
                onChange={(event) =>
                  updateField(
                    "itemDescription",
                    event.target.value
                  )
                }
                placeholder="e.g. HP laptop charger, sealed in a small package"
                className={`${inputClasses(
                  !!errors.itemDescription
                )} h-auto py-3`}
              />
            </FormField>

            <FormField label="Delivery notes">
              <textarea
                rows={3}
                value={form.deliveryNotes}
                onChange={(event) =>
                  updateField(
                    "deliveryNotes",
                    event.target.value
                  )
                }
                placeholder="Optional instructions for the rider..."
                className={`${inputClasses(false)} h-auto py-3`}
              />
            </FormField>
          </div>
        </FormSection>
      </div>

      {/* Summary */}
      <aside>
        <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">
            Delivery summary
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Review the information before creating the request.
          </p>

          <div className="mt-5">
            <label
              htmlFor="priority"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Priority
            </label>

            <select
              id="priority"
              value={form.priority}
              onChange={(event) =>
                updateField(
                  "priority",
                    event.target.value as DeliveryFormData["priority"]
                )
              }
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="normal">
                Normal
                </option>
              <option value="high">
                High
              </option>
              <option value="urgent">
                Urgent
              </option>
            </select>
          </div>

          <div className="my-5 border-t border-slate-100" />

          <div className="space-y-4">
            <PreviewItem
              label="Customer"
              value={form.customerName}
              placeholder="Not entered"
            />

            <PreviewItem
              label="Pickup"
              value={form.pickupLocation}
              placeholder="Not entered"
            />

            <PreviewItem
              label="Destination"
              value={form.deliveryAddress}
              placeholder="Not entered"
            />

            <PreviewItem
              label="Item"
              value={form.itemDescription}
              placeholder="Not entered"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-wait disabled:opacity-70"
          >
            {submitting ? "Creating request…" : "Create Delivery Request"}
          </button>

          {submitError && (
            <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
              {submitError}
            </p>
          )}

          <Link
            href="/retailer"
            className="mt-3 flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            Cancel
          </Link>

          <p className="mt-4 text-center text-xs leading-5 text-slate-400">
            New requests will initially have a Pending
            status until a dispatcher assigns a rider.
          </p>
        </div>
      </aside>
    </form>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-950">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function FormField({
  label,
  required = false,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}

      {error && (
        <span className="mt-2 block text-xs font-medium text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

function PreviewItem({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 break-words text-sm ${
          value
            ? "font-medium text-slate-800"
            : "italic text-slate-400"
        }`}
      >
        {value || placeholder}
      </p>
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

function inputClasses(error: boolean) {
  return `
    h-12 w-full rounded-xl border bg-white px-4
    text-base text-slate-900 outline-none transition
    placeholder:text-slate-400
    ${
      error
        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
        : "border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
    }
  `;
}
