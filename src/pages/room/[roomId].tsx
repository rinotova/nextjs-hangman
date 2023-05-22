import { type GetSessionParams, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { type FormEvent, useRef } from "react";
import Button from "~/components/Button";
import { LoadingPage, LoadingSpinner } from "~/components/Spinner";
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
  const isPlayerOne = room && userId && userId === room.player1_ID;

  const { mutate: editGame, isLoading: isEditingGame } =
    api.rooms.updateRoom.useMutation();

  const winGameHandler = () => {
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
  };

  const loseGameHandler = () => {
    if (!isEditingGame && room) {
      editGame({
        id: room.id,
        updateData: {
          isGuessed: false,
        },
      });
    }
  };

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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-white">Room</h1>
      <div className="mt-4 flex gap-4">
        <Button onClick={winGameHandler}>Win game</Button>
        <Button onClick={loseGameHandler}>Lose game</Button>
      </div>
      <div className="text-white">
        {isPlayerOne && !room.wordToGuess && (
          <div className="flex flex-col gap-4">
            <h1>You have won the game!</h1>
            <h1>Enter a new word to play again:</h1>
            <form onSubmit={newGameHandler}>
              <input
                ref={newWordRef}
                type="text"
                className="block h-12 w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-center font-butcher text-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Type a new word..."
                minLength={3}
                required
              />
            </form>
          </div>
        )}

        {!isPlayerOne && !room.wordToGuess && (
          <div className="flex flex-col items-center justify-center gap-4">
            <h1>The word has been guessed!</h1>
            <h1>Waiting for the other player to enter a new word</h1>
            <LoadingSpinner />
          </div>
        )}
      </div>
      {isEditingGame && <LoadingPage />}
    </div>
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
