import { type GetServerSideProps, type NextPage } from "next";
import { getSession, signIn, useSession } from "next-auth/react";
import BirdsContainer from "~/components/BirdsContainer";

const Home: NextPage = () => {
  const { data: session } = useSession();
  const signInHandler = () => {
    void signIn("google");
  };

  return (
    <div className=" justify-cente flex min-h-screen w-full flex-col items-center justify-center">
      <BirdsContainer isSplashPage={true} />
      <h1 className="font-butcher text-5xl text-slate-300 opacity-50">
        The Hangman
      </h1>
      {!session && (
        <button
          onClick={signInHandler}
          className="mt-8 rounded-full bg-black/10 px-10 py-3 font-semibold text-black no-underline transition hover:bg-black/20"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: "/rooms",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};
