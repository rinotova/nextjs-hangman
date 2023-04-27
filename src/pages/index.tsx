import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";

const Home: NextPage = () => {
  const { data: session } = useSession();
  const signInHandler = () => {
    void signIn("google");
  };
  return (
    <div>
      <h1>Hello world</h1>
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
