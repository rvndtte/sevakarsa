import { ProblemWizardScreen } from "@/features/desa/ProblemWizardScreen";

export default async function Page({ params }: PageProps<"/desa/problems/[id]/edit">) {
  const { id } = await params;
  return <ProblemWizardScreen problemId={id} />;
}
