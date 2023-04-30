import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { Butcherman } from "@next/font/google";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import PageLayout from "~/components/PageLayout";

const butcher = Butcherman({
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
          }
        `}
      </style>
      <PageLayout>
        <Component {...pageProps} />
      </PageLayout>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
