import { site } from "@/lib/content";

/** Full office address, text: "14, Raebareli Rd, …, Lucknow, Uttar Pradesh 226002". */
export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;

/**
 * The office address as a link to the Google Maps listing (content/site.json › mapUrl).
 * `lines`: break after the street. Used everywhere the address appears.
 */
export default function AddressLink({ lines = false, country = false, className = "" }: { lines?: boolean; country?: boolean; className?: string }) {
  const { street, city, region, postalCode, countryLabel } = site.address;
  return (
    <a href={site.mapUrl} target="_blank" rel="noopener noreferrer" className={`underline-offset-2 hover:underline ${className}`}>
      {street}
      {lines ? <br /> : ", "}
      {city}, {region} {postalCode}
      {country && (
        <>
          {lines ? <br /> : ", "}
          {countryLabel}
        </>
      )}
      <span className="sr-only"> (open in Google Maps, new tab)</span>
    </a>
  );
}
