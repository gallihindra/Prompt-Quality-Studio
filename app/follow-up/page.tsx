import type { Metadata } from "next";
import { FollowUpBuilder } from "@/components/follow-up-builder";

export const metadata: Metadata = {
  title: "Follow-up Prompt Builder",
  description:
    "Turn a generic or incomplete AI answer into a clearer next instruction.",
};

export default function FollowUpPage() {
  return <FollowUpBuilder />;
}
