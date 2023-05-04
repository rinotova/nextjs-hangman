import { type NextPage } from "next";
import { type GetSessionParams, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { type FormEvent, useRef, useState } from "react";
import BirdsContainer from "~/components/BirdsContainer";
import Button from "~/components/Button";
import Headline from "~/components/Headline";
import RoomsList from "~/components/RoomsList";
import { LoadingSpinner } from "~/components/Spinner";
import { api } from "~/utils/api";

const Rooms: NextPage = () => {
  const router = useRouter();
  const [word, setWord] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const { mutate: createRoom, isLoading: isSubmittingRoom } =
    api.rooms.createRoom.useMutation({
      onSuccess: ({ roomId }) => {
        void router.push(`/room/${roomId}`);
      },
      onError: () => {
        // Show toast error
      },
    });

  function createRoomHandler(e: FormEvent) {
    e.preventDefault();
    if (!isSubmittingRoom && word.length > 2) {
      createRoom({ wordToGuess: word });
    }
  }
  return (
    <>
      <BirdsContainer />
      <Headline title="Rooms" />
      <div className="flex w-full flex-col">
        <div className="mt-12 flex w-full items-start justify-center gap-6">
          <form onSubmit={(e) => createRoomHandler(e)}>
            <div className="relative flex gap-2">
              <Button
                onClick={() => setIsCreatingRoom((state) => !state)}
                type={isCreatingRoom ? "button" : "submit"}
              >
                {isCreatingRoom ? "Cancel" : "Create Room"}
              </Button>
              {isCreatingRoom && (
                <>
                  <input
                    onChange={(e) => setWord(e.target.value)}
                    value={word}
                    type="text"
                    className="block h-12 w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-center font-butcher text-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Type a word..."
                    required
                  />
                  <Button type="submit" disabled={word.length < 3}>
                    {isSubmittingRoom ? <LoadingSpinner /> : "Go"}
                  </Button>
                </>
              )}
            </div>
          </form>
        </div>
        <RoomsList />
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
