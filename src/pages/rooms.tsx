import { type NextPage } from "next";
import { type GetSessionParams, getSession } from "next-auth/react";
import { useRef, useState } from "react";
import BirdsContainer from "~/components/BirdsContainer";
import Button from "~/components/Button";
import Headline from "~/components/Headline";

const Rooms: NextPage = () => {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [word, setWord] = useState("");
  const wordRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <BirdsContainer />
      <Headline title="Rooms" />
      <div className="mt-12 flex min-h-screen w-full items-start justify-center gap-6">
        <form>
          <div className="relative flex gap-2">
            <Button onClick={() => setIsCreatingRoom((state) => !state)}>
              {isCreatingRoom ? "Cancel" : "Create Room"}
            </Button>
            {isCreatingRoom && (
              <>
                <input
                  onChange={(e) => setWord(e.target.value)}
                  value={word}
                  ref={wordRef}
                  type="text"
                  className="block h-12 w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-center font-butcher text-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Type a word..."
                  required
                />
                <Button
                  type="submit"
                  disabled={
                    !(wordRef.current && wordRef.current.value.length > 2)
                  }
                >
                  Go
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default Rooms;

export const getServerSideProps = async (
  context: GetSessionParams | undefined
) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
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
