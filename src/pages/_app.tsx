import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { Butcherman, Roboto } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import PageLayout from "~/components/PageLayout";
import { Toaster } from "react-hot-toast";

const butcher = Butcherman({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});
const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});
const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <style jsx global>
        {`
          :root {
            --butcher-font: ${butcher.style.fontFamily};
            --roboto-font: ${roboto.style.fontFamily};
          }
        `}
      </style>
      <PageLayout>
        <Toaster position="bottom-center" />
        <Component {...pageProps} />
      </PageLayout>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
