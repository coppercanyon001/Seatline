import type { Metadata } from "next";
import WorldCupFinal from "./WorldCupFinal";

export const metadata: Metadata = {
  title: "Final Whistle: Spain vs Argentina",
  description: "Lead Spain against Argentina in an original 3D arcade football final.",
};

export default function Home() {
  return <WorldCupFinal />;
}
