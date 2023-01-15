import Login from "./login";
import { auth } from "@/setup/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import type { AppProps } from "next/app";
import "@/styles/global.css";

export default function App({ Component, pageProps }: AppProps) {
  const [loggedInUser, loading, _error] = useAuthState(auth);

  if (loading) return <div>Loading...</div>;

  if (!loggedInUser) return <Login />;

  if (_error) return <div style={{ color: "red" }}>Error: {_error.message}</div>;

  return <Component {...pageProps} />;
}
