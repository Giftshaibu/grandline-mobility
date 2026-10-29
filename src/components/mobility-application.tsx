import { useState } from "react";
import { ApplicationWizard } from "./application-wizard";
import {
  ApplicationPhotos,
  PhotoGallery,
  useApplicationPhotos,
} from "./application-photos";
import {
  ReviewSection,
  ReviewFacts,
  ListingFeeGuide,
} from "./application-fields";
import { MobilityApplicationFields } from "./mobility-application-fields";
import {
  mobilitySteps,
  mobilityErrors,
  mobilityFeeRows,
  emptyMobilityApplication,
  changeListingType,
  listingTypeLabel,
  offeringCategoryLabel,
  type MobilityApplication,
} from "../lib/mobility-application";
import { optionalPrice } from "../lib/application-validation";
export function MobilityApplicationFlow() {
  const [draft, setDraft] = useState(emptyMobilityApplication);
  const photos = useApplicationPhotos();
  const update = (field: keyof MobilityApplication, value: string) => {
    if (field === "type" && value !== draft.type) {
      setDraft((previous) => changeListingType(previous, value));
      photos.setFiles([]);
    } else setDraft((previous) => ({ ...previous, [field]: value }));
  };
  return (
    <ApplicationWizard
      title="List on Grandline Mobility"
      steps={mobilitySteps}
      validateStep={(step) => mobilityErrors(draft, step)}
      onReset={() => {
        setDraft(emptyMobilityApplication());
        photos.setFiles([]);
      }}
      fees={<ListingFeeGuide rows={mobilityFeeRows(draft)} />}
      renderStep={(step) =>
        step === 3 ? (
          <ApplicationPhotos
            files={photos.files}
            previews={photos.previews}
            onChange={photos.setFiles}
          />
        ) : (
          <MobilityApplicationFields
            step={step}
            draft={draft}
            update={update}
          />
        )
      }
      renderReview={(edit) => {
        const offering: [string, string][] = [
          ["Title", draft.title],
          ["Category", offeringCategoryLabel(draft)],
        ];
        if (draft.type !== "logistics") {
          offering.push(
            ["Make", draft.make],
            ["Model", draft.model],
            ["Year", draft.year],
          );
          if (draft.type === "hire" || draft.type === "commercial")
            offering.push(["Passenger capacity", draft.passengers]);
          if (draft.type === "heavy-duty" || draft.type === "commercial")
            offering.push(["Load capacity (kg)", draft.cargoKg]);
          if (draft.type === "heavy-duty")
            offering.push([
              "Operator",
              draft.operator === "included"
                ? "Included"
                : draft.operator === "not-included"
                  ? "Not included"
                  : "To be confirmed",
            ]);
        }
        offering.push([
          draft.type === "logistics"
            ? "Cargo/service details"
            : "Offering terms",
          draft.terms,
        ]);
        if (draft.type !== "bike-operator")
          offering.push([
            "Advertised rate",
            draft.rate
              ? `${optionalPrice(draft.rate)} / ${draft.unit}`
              : "Not supplied",
          ]);
        return (
          <>
            <ReviewSection title="Listing type" step={0} edit={edit}>
              <p>{listingTypeLabel(draft.type)}</p>
            </ReviewSection>
            <ReviewSection
              title="Business/operator details"
              step={1}
              edit={edit}
            >
              <ReviewFacts
                items={[
                  [
                    "Provider type",
                    draft.businessType === "company"
                      ? "Company or business"
                      : "Individual operator",
                  ],
                  ["Name", draft.name],
                  ["Description", draft.description],
                  ["Base location", draft.location],
                  ["Service areas", draft.areas],
                ]}
              />
            </ReviewSection>
            <ReviewSection title="Offering details" step={2} edit={edit}>
              <ReviewFacts items={offering} />
              {draft.type === "bike-operator" && (
                <p>
                  No approval, dispatch eligibility, fare or rider assignment is
                  implied.
                </p>
              )}
            </ReviewSection>
            <ReviewSection title="Photos" step={3} edit={edit}>
              <PhotoGallery previews={photos.previews} />
            </ReviewSection>
            <ReviewSection title="Contact details" step={4} edit={edit}>
              <ReviewFacts
                items={[
                  ["Contact name", draft.contactName],
                  ["Phone", draft.phone],
                  ["Email", draft.email],
                ]}
              />
            </ReviewSection>
          </>
        );
      }}
    />
  );
}
