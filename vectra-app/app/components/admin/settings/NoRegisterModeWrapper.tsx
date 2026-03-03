import { getNoRegisterMode } from "@/app/lib/data";
import NoRegisterModeSetting from "./NoRegisterModeSetting";

export default async function NoRegisterModeWrapper() {
  const isNoRegisterActive = await getNoRegisterMode();
  return <NoRegisterModeSetting initialValue={isNoRegisterActive} />;
}
