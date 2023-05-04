import Head from "next/head";

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <Head>
        <title>Hangman - The Game</title>
        <meta name="description" content="Hangman - The Game" />
        <meta
          property="og:image"
          itemProp="image"
          content="https://nextjs-hangman-lac.vercel.app/api/og"
        />
        <meta property="og:type" content="website" />
      </Head>

      <div className="mx-auto flex min-h-screen max-w-screen-md flex-col items-center justify-start p-4">
        {children}
      </div>
    </main>
  );
};

export default PageLayout;
