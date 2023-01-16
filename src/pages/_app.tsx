import { auth } from "@/setup/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import type { AppProps } from "next/app";
import "@/styles/global.css";

export default function App({ Component, pageProps }: AppProps) {
  const [loggedInUser, loading, _error] = useAuthState(auth);
  const router = useRouter();

  if (loading) return <div>Loading...</div>;

  if (!loggedInUser && router.pathname !== "/login") {
    router.push("/login");
  }

  if (_error) return <div style={{ color: "red" }}>Error: {_error.message}</div>;

  return <Component {...pageProps} />;
}
