export function required(value: string, label: string, min = 1) {
  return value.trim().length < min
    ? `${label} ${min > 1 ? `must have at least ${min} characters` : "is required"}.`
    : "";
}
export function wholeNumber(value: string, label: string, positive = false) {
  return value !== "" &&
    (!/^\d+$/.test(value) ||
      !Number.isSafeInteger(Number(value)) ||
      (positive && Number(value) < 1))
    ? `${label} must be a ${positive ? "positive" : "nonnegative"} whole number.`
    : "";
}
export function contactErrors(contact: {
  contactName: string;
  phone: string;
  email: string;
}) {
  const errors: Record<string, string> = {};
  if (!contact.contactName.trim())
    errors["contactName"] = "Contact name is required.";
  if (
    !/^\+?[\d ()-]{7,30}$/.test(contact.phone.trim()) ||
    contact.phone.replace(/\D/g, "").length < 7
  )
    errors["phone"] = "Enter a contact number with at least seven digits.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim()))
    errors["email"] = "Enter a valid email address.";
  return errors;
}
export function optionalPrice(value: string) {
  return value ? `MK${Number(value).toLocaleString("en-MW")}` : "Not supplied";
}
