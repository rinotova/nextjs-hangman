import { type GetSessionParams, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { type FormEvent, useRef, useState } from "react";
import BirdsContainer from "~/components/BirdsContainer";
import Button from "~/components/Button";
import Headline from "~/components/Headline";
import { LoadingSpinner } from "~/components/Spinner";
import { api } from "~/utils/api";

const Room = () => {
  const newWordRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const { roomId } = router.query;
  const theRoomId = roomId as string;

  const { data: room, isLoading: roomIsLoading } =
    api.rooms.getRoomData.useQuery(
      {
        roomId: theRoomId,
      },
      { enabled: !!theRoomId, refetchInterval: 1000 }
    );

  const { data: users } = api.users.getUsernamesForRoom.useQuery(
    {
      playerOneId: room?.player1_ID,
      playerTwoId: room?.player2_ID,
    },
    {
      enabled: !!room,
      refetchOnWindowFocus: false,
      refetchInterval:
        userId && room && room.player1_ID === userId && !room.player2_ID
          ? 1000
          : 0,
    }
  );

  const { mutate: editGame, isLoading: isEditingGame } =
    api.rooms.updateRoom.useMutation();

  const [currentWordGuess] = useState(
    room && room.currentWordGuess ? room.currentWordGuess : ""
  );
  if (currentWordGuess && currentWordGuess === room?.wordToGuess) {
    winGameHandler();
  }

  function winGameHandler() {
    if (!isEditingGame && room) {
      editGame({
        id: room.id,
        updateData: {
          isGuessed: true,
          wordToGuess: "",
          attempts: 0,
          player1_ID: userId,
          player2_ID: room.player1_ID,
        },
      });
    }
  }

  function newGameHandler(e: FormEvent) {
    e.preventDefault();
    if (
      !isEditingGame &&
      room &&
      newWordRef.current &&
      newWordRef.current.value.length > 2
    ) {
      editGame({
        id: room.id,
        updateData: {
          isGuessed: false,
          wordToGuess: newWordRef.current.value,
        },
      });
    }
  }

  if (!room && !roomIsLoading) {
    void router.push("/");
    return;
  }

  if (!room || roomIsLoading) {
    return <div />;
  }

  const isPlayerOne = room && userId && userId === room.player1_ID;

  return (
    <>
      <BirdsContainer />
      <Headline title="Hangman" />

      <div className="mt-12 flex min-h-[calc(100vh-1rem-120px)] w-full flex-col justify-between gap-6">
        {/* <Button onClick={winGameHandler}>Win game</Button> */}
        {users?.playerOneUsername && (
          <div className="-mt-5 flex w-full">
            <span className="mr-2 rounded bg-red-900 px-2.5 py-0.5 text-sm font-medium text-red-300">
              {users.playerOneUsername}
            </span>
          </div>
        )}
        <div className="text-white">
          {isPlayerOne && !room.wordToGuess && (
            <div className="flex flex-col items-center justify-center gap-4">
              <h1>You have won the game!</h1>
              <h1>Enter a new word to play again:</h1>
              <form onSubmit={newGameHandler}>
                <input
                  ref={newWordRef}
                  type="text"
                  className="block h-12 w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-center font-butcher text-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Type a word..."
                  required
                  minLength={3}
                />
                <Button type="submit">Go</Button>
              </form>
            </div>
          )}

          {!isPlayerOne && !room.wordToGuess && (
            <div className="flex flex-col items-center justify-center gap-4">
              <h1>The word has been guessed!</h1>
              <h1>Waiting for the other player to enter a new word</h1>
              <LoadingSpinner size={48} />
            </div>
          )}
        </div>

        {users?.playerTwoUsername && (
          <div className="-mt-5 flex w-full justify-end">
            <span className="mr-2 rounded bg-green-900 px-2.5 py-0.5 text-sm font-medium text-green-300">
              {users.playerTwoUsername}
            </span>
          </div>
        )}

        {users && !users.playerTwoUsername && (
          <>
            <div className="-mt-5 flex w-full justify-end">
              <span className="mr-2 rounded bg-green-900 px-2.5 py-0.5 text-sm font-medium text-green-300">
                <div className="flex gap-3">
                  Waiting for your next victim
                  <LoadingSpinner />
                </div>
              </span>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Room;

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
