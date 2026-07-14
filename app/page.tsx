import type { Metadata } from "next";
import CalibrationView from "./CalibrationView";

export const metadata: Metadata = {
  title: "Grandma’s Grocery Trip — Store Calibration",
  description: "Calibrating the Mint grocery-store world before gameplay begins.",
};

export default function Home() {
  return <CalibrationView />;
}
