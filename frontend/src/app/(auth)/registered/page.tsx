import { Suspense } from "react";
import { RegisteredScreen } from "@/features/auth/RegisteredScreen";

export default function Page() {
  return (
    <Suspense>
      <RegisteredScreen />
    </Suspense>
  );
}
