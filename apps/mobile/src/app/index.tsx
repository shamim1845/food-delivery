import { useAuth } from "@/context/auth-context";
import { Redirect } from "expo-router";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/login" />;
}
