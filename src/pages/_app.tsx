import "@/styles/global.css";
import { auth, firestore } from "@/setup/firebase";
import { CLoading } from "@/components";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  const [loggedInUser, loading, _error] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    const setUserInDb = async () => {
      try {
        await setDoc(
          doc(firestore, "users", `${loggedInUser?.uid}`),
          {
            uid: loggedInUser?.uid,
            email: loggedInUser?.email,
            lastSeen: serverTimestamp(),
            photoURL: loggedInUser?.photoURL,
          },
          { merge: true }, // just update what is changed
        );
      } catch (error) {
        console.log("ERROR SETTING USER INFO IN DB", error);
      }
    };

    if (loggedInUser) {
      setUserInDb();
    }
  }, [loggedInUser]);

  if (loading) return <CLoading />;

  if (!loggedInUser && router.pathname !== "/login") {
    router.push("/login");
  }

  if (_error) return <div style={{ color: "red" }}>Error: {_error.message}</div>;

  return <Component {...pageProps} />;
}
