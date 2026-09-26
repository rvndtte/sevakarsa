import { Suspense } from "react";
import { VerifyScreen } from "@/features/admin/VerifyScreen";

export default function Page() {
  return (
    <Suspense>
      <VerifyScreen />
    </Suspense>
  );
}
