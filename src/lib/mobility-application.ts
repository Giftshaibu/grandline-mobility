import { paths } from "./categories";
import { required, wholeNumber, contactErrors } from "./application-validation";
export const listingTypes = [
  ["hire", "Vehicle hire"],
  ["heavy-duty", "Heavy-duty hire"],
  ["commercial", "Commercial transport"],
  ["logistics", "Logistics"],
  ["bike-operator", "Bike operator"],
] as const;
export type MobilityApplication = {
  type: string;
  businessType: string;
  name: string;
  description: string;
  location: string;
  areas: string;
  title: string;
  category: string;
  make: string;
  model: string;
  year: string;
  passengers: string;
  cargoKg: string;
  operator: string;
  terms: string;
  rate: string;
  unit: string;
  contactName: string;
  phone: string;
  email: string;
};
export function emptyMobilityApplication(): MobilityApplication {
  return {
    type: "",
    businessType: "",
    name: "",
    description: "",
    location: "",
    areas: "",
    title: "",
    category: "",
    make: "",
    model: "",
    year: "",
    passengers: "",
    cargoKg: "",
    operator: "",
    terms: "",
    rate: "",
    unit: "day",
    contactName: "",
    phone: "",
    email: "",
  };
}
export const mobilitySteps = [
  "Listing type",
  "Business/operator details",
  "Offering details",
  "Photos",
  "Contact details",
  "Review",
];
export function offeringCategories(
  type: string,
): readonly (readonly [string, string])[] {
  if (type === "bike-operator")
    return [["motorcycle", "Motorcycle pickup operator"]];
  const categories = paths[type as keyof typeof paths]?.categories ?? [];
  return type === "logistics"
    ? [...categories, ["delivery", "Delivery services"]]
    : categories;
}
export function listingTypeLabel(type: string) {
  return listingTypes.find(([key]) => key === type)?.[1] ?? type;
}
export function offeringCategoryLabel(draft: MobilityApplication) {
  return (
    offeringCategories(draft.type).find(
      ([key]) => key === draft.category,
    )?.[1] ?? draft.category
  );
}
export function changeListingType(
  draft: MobilityApplication,
  type: string,
): MobilityApplication {
  const blank = emptyMobilityApplication();
  return {
    ...blank,
    type,
    businessType: draft.businessType,
    name: draft.name,
    description: draft.description,
    location: draft.location,
    areas: draft.areas,
    contactName: draft.contactName,
    phone: draft.phone,
    email: draft.email,
    category: type === "bike-operator" ? "motorcycle" : "",
    unit: type === "logistics" ? "trip" : "day",
  };
}
export function mobilityErrors(draft: MobilityApplication, step: number) {
  const errors: Record<string, string> = {};
  const check = (key: string, error: string) => {
    if (error) errors[key] = error;
  };
  if (step === 0 && !listingTypes.some(([type]) => type === draft.type))
    errors["type"] = "Choose a listing type.";
  if (step === 1) {
    if (!["company", "individual"].includes(draft.businessType))
      errors["businessType"] = "Choose a company or individual operator.";
    check("name", required(draft.name, "Business or operator name"));
    check(
      "description",
      required(draft.description, "Business description", 10),
    );
    check("location", required(draft.location, "Base location"));
    check("areas", required(draft.areas, "Service areas"));
  }
  if (step === 2) {
    check("title", required(draft.title, "Offering title"));
    if (
      !offeringCategories(draft.type).some(
        ([category]) => category === draft.category,
      )
    )
      errors["category"] = "Choose a valid category.";
    if (draft.type !== "logistics") {
      check("make", required(draft.make, "Vehicle or equipment make"));
      check("model", required(draft.model, "Model"));
      check("year", wholeNumber(draft.year, "Year", true));
      if (
        draft.year &&
        (Number(draft.year) < 1900 ||
          Number(draft.year) > new Date().getFullYear() + 1)
      )
        errors["year"] = "Enter a year from 1900 to next year.";
      if (draft.type === "hire" || draft.type === "commercial")
        check(
          "passengers",
          wholeNumber(draft.passengers, "Passenger capacity", true),
        );
      if (draft.type === "heavy-duty" || draft.type === "commercial")
        check("cargoKg", wholeNumber(draft.cargoKg, "Load capacity", true));
      if (
        draft.type === "heavy-duty" &&
        !["included", "not-included", "confirm"].includes(draft.operator)
      )
        errors["operator"] = "Choose an operator option.";
    }
    check(
      "terms",
      required(
        draft.terms,
        draft.type === "logistics"
          ? "Cargo and service details"
          : "Offering terms",
        10,
      ),
    );
    if (draft.type !== "bike-operator") {
      check("rate", wholeNumber(draft.rate, "Advertised rate"));
      if (draft.rate && !["day", "week", "month", "trip"].includes(draft.unit))
        errors["unit"] = "Choose a rate unit.";
    }
  }
  if (step === 4) return contactErrors(draft);
  return errors;
}
export function mobilityFeeRows(draft: MobilityApplication) {
  if (draft.type === "bike-operator")
    return [{ label: "Motorcycle operators", amount: 10000 }];
  if (draft.type === "hire" && draft.businessType === "company")
    return [{ label: "Car hire companies", amount: 50000 }];
  if (
    (draft.type === "heavy-duty" && draft.category === "lorry") ||
    (draft.type === "commercial" && draft.category === "truck")
  )
    return [{ label: "Lorries / trucks", amount: 25000 }];
  if (draft.type === "logistics" && draft.category === "delivery")
    return [{ label: "Delivery services", amount: 50000 }];
  return [];
}
