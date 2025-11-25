export interface MedicalItem {
  ID: number
  name: string
  type: string
  quantity: number
}

export interface MedicalAlertSettings {
  [itemId: number]: number
}

export const DEFAULT_MEDICAL_ALERTS: MedicalAlertSettings = {
  732: 200,
  733: 200,
  734: 200,
  735: 200,
  736: 200,
  737: 200,
  738: 200,
  739: 200,
  1012: 5,
  731: 100,
  361: 1,
  1363: 10,
  203: 10,
  68: 100,
  69: 100,
  70: 100,
  1040: 100,
}

import { getItemFromFallback } from "@/lib/items-fallback"

export const ALL_BLOOD_BAGS = [
  { id: 732, name: "Blood Bag : A+" },
  { id: 733, name: "Blood Bag : A-" },
  { id: 734, name: "Blood Bag : B+" },
  { id: 735, name: "Blood Bag : B-" },
  { id: 736, name: "Blood Bag : AB+" },
  { id: 737, name: "Blood Bag : AB-" },
  { id: 738, name: "Blood Bag : O+" },
  { id: 739, name: "Blood Bag : O-" },
  { id: 1012, name: "Blood Bag : Irradiated" },
].map((item) => {
  const fallback = getItemFromFallback(item.id)
  return { id: item.id, name: fallback?.name || item.name }
})

export const ALL_EMPTY_BLOOD_BAGS = [{ id: 731, name: "Empty Blood Bag" }].map((item) => {
  const fallback = getItemFromFallback(item.id)
  return { id: item.id, name: fallback?.name || item.name }
})

export const ALL_FIRST_AID_KITS = [
  { id: 68, name: "Small First Aid Kit" },
  { id: 69, name: "First Aid Kit" },
  { id: 70, name: "Specialist First Aid Kit" },
  { id: 1040, name: "Specialist Bandage" },
].map((item) => {
  const fallback = getItemFromFallback(item.id)
  return { id: item.id, name: fallback?.name || item.name }
})
