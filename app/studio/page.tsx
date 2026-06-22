import type { Metadata } from "next";
import { StudioTool } from "@/components/studio-tool";

export const metadata: Metadata = {
  title: "Studio",
  description: "Score, diagnose, clarify, and rewrite your prompt.",
};

export default function StudioPage() {
  return <StudioTool />;
}
