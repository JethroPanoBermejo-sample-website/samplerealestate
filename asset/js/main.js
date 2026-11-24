"use strict";

const homes = {
  solana: {
    description: "The ground floor opens to a covered terrace and front garden. Upstairs are three bedrooms, with a fourth room on the ground floor that can serve as a guest room or office. The 310 m² lot includes two covered parking spaces.",
    photos: [
      { file: "solana-exterior.webp", label: "Front garden and exterior", alt: "Two-storey house and planted front garden at dusk" },
      { file: "solana-living.webp", label: "Living room and garden outlook", alt: "Living room with timber ceiling and sliding doors to the planted courtyard" }
    ]
  },
  alder: {
    description: "Windows on two sides bring daylight into the living and dining area. The main bedroom has its own bathroom, and the kitchen has space for a four-seat table. One parking space is included in the asking price.",
    photos: [
      { file: "alder-living.webp", label: "Corner living room", alt: "Living room beside two windows looking over Pasig" },
      { file: "alder-kitchen.webp", label: "Kitchen and dining area", alt: "Pale timber kitchen cabinets and a dining table for four" }
    ]
  },
  sienna: {
    description: "The home sits on an 81 m² lot with a gated space for one car. The living room and kitchen are on the ground floor, and the top floor pairs the third bedroom with a separate study.",
    photos: [
      { file: "sienna-exterior.webp", label: "Street entrance and carport", alt: "Three-storey sand-colored townhome with a street-facing gate" },
      { file: "sienna-stairs.webp", label: "Living area and stairs", alt: "Warm timber staircase beside the townhome living area" }
    ]
  }
};

const searchForm = document.querySelector("#property-search");
const queryInput = document.querySelector("#query");
const listingGrid = document.querySelector("#property-grid");
const listings = Array.from(listingGrid.querySelectorAll(".listing"));
const resultCount = document.querySelector("#result-count");
const clearFilters = document.querySelector("#clear-filters");
const emptyState = document.querySelector("#empty-state");

function filterListings() {
  const values = new FormData(searchForm);
  const searchTerms = values.get("query").trim().toLowerCase().split(/\s+/).filter(Boolean);
  const location = values.get("location");
  const type = values.get("type");
  const budget = Number(values.get("budget"));
  let visibleCount = 0;

  for (const listing of listings) {
    const matchesText = searchTerms.every(term => listing.textContent.toLowerCase().includes(term));
    const matchesLocation = !location || listing.dataset.location === location;
    const matchesType = !type || listing.dataset.type === type;
    const matchesBudget = !budget || Number(listing.dataset.price) <= budget;
    const visible = matchesText && matchesLocation && matchesType && matchesBudget;

    listing.hidden = !visible;
    if (visible) visibleCount += 1;
  }

  const countLabel = visibleCount === 1 ? "1 property" : `${visibleCount} properties`;
  if (resultCount.textContent !== countLabel) resultCount.textContent = countLabel;
  emptyState.hidden = visibleCount !== 0;
  clearFilters.disabled = !(searchTerms.length || location || type || budget);
}

searchForm.addEventListener("input", filterListings);
searchForm.addEventListener("change", filterListings);
searchForm.addEventListener("submit", event => event.preventDefault());
clearFilters.addEventListener("click", () => {
  searchForm.reset();
  filterListings();
  queryInput.focus();
});

const dialog = document.querySelector("#property-dialog");
const detailTitle = document.querySelector("#detail-title");
const detailPanel = document.querySelector("#property-detail");
const inquiryPanel = document.querySelector("#inquiry-panel");
const inquiryTitle = document.querySelector("#inquiry-title");
const inquiryButton = document.querySelector("#open-inquiry");
const viewingForm = document.querySelector("#viewing-form");
const viewingTime = document.querySelector("#viewing-time");
const confirmation = document.querySelector("#viewing-confirmation");
const photo = document.querySelector("#tour-photo");
const photoCaption = document.querySelector("#photo-caption");
let activeHome;
let activePhoto = 0;
let activeTrigger;

function renderPhoto() {
  const currentPhoto = activeHome.photos[activePhoto];

  photo.src = `asset/images/${currentPhoto.file}`;
  photo.alt = currentPhoto.alt;
  photoCaption.textContent = `Photo ${activePhoto + 1} of ${activeHome.photos.length} · ${currentPhoto.label}`;
}

function movePhoto(step) {
  const photoCount = activeHome.photos.length;
  activePhoto = (activePhoto + step + photoCount) % photoCount;
  renderPhoto();
}

function showProperty(listing, trigger) {
  activeTrigger = trigger;
  activeHome = homes[listing.dataset.property];
  activePhoto = 0;

  detailTitle.textContent = listing.querySelector("h3").textContent;
  document.querySelector("#detail-location").textContent = listing.querySelector(".listing-heading p").textContent;
  document.querySelector("#detail-price").textContent = listing.querySelector(".price").textContent;
  document.querySelector("#detail-specs").textContent = listing.querySelector(".specs").textContent;
  document.querySelector("#detail-summary").textContent = activeHome.description;
  renderPhoto();

  inquiryPanel.hidden = true;
  viewingForm.hidden = false;
  confirmation.hidden = true;
  detailPanel.hidden = false;
  dialog.showModal();
  dialog.scrollTop = 0;
  detailTitle.focus();
}

listingGrid.addEventListener("click", event => {
  const trigger = event.target.closest(".listing-action");
  if (trigger) showProperty(trigger.closest(".listing"), trigger);
});

document.querySelector("#prev-photo").addEventListener("click", () => movePhoto(-1));
document.querySelector("#next-photo").addEventListener("click", () => movePhoto(1));
document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
document.querySelector("#finish-inquiry").addEventListener("click", () => dialog.close());

dialog.addEventListener("close", () => {
  viewingForm.reset();
  activeTrigger?.focus();
});

inquiryButton.addEventListener("click", () => {
  detailPanel.hidden = true;
  viewingForm.hidden = false;
  confirmation.hidden = true;
  inquiryPanel.hidden = false;
  dialog.scrollTop = 0;
  inquiryTitle.focus();
});

document.querySelector("#back-to-detail").addEventListener("click", () => {
  inquiryPanel.hidden = true;
  detailPanel.hidden = false;
  inquiryButton.focus();
});

viewingForm.addEventListener("submit", event => {
  event.preventDefault();
  document.querySelector("#confirmation-time").textContent = `${detailTitle.textContent} · ${viewingTime.value}`;
  viewingForm.reset();
  viewingForm.hidden = true;
  confirmation.hidden = false;
  document.querySelector("#confirmation-title").focus();
});

searchForm.hidden = false;
document.querySelector("#results-bar").hidden = false;
for (const listing of listings) listing.querySelector(".listing-action").hidden = false;
filterListings();
