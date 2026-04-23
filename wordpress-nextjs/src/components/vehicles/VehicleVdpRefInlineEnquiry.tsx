"use client";

import { useId } from "react";
import VehicleEnquiryForm, {
  type VehicleEnquiryItemPayload,
} from "./VehicleEnquiryForm";

export default function VehicleVdpRefInlineEnquiry({
  item,
}: {
  item: VehicleEnquiryItemPayload;
}) {
  const id = useId().replace(/:/g, "");
  return <VehicleEnquiryForm idPrefix={`vdp-ref-enq-${id}`} item={item} />;
}
