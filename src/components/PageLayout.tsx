import Head from "next/head";

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <Head>
        <title>Hangman - The Game</title>
        <meta name="description" content="Hangman - The Game" />
      </Head>

      <div className="mx-auto flex min-h-screen max-w-screen-md flex-col items-center justify-start">
        {children}
      </div>
    </main>
  );
};

export default PageLayout;
