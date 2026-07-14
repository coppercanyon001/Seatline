import type { Metadata } from "next";
import GrandmasGroceryTrip from "./GrandmasGroceryTrip";

export const metadata: Metadata = {
  title: "Grandma’s Grocery Trip",
  description: "Grab Grandma’s groceries and reach checkout before the store closes.",
};

export default function Home() {
  return <GrandmasGroceryTrip />;
}
