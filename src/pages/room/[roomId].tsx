import { type GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { type FormEvent, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import BirdsContainer from "~/components/BirdsContainer";
import Button from "~/components/Button";
import Headline from "~/components/Headline";
import { LoadingSpinner } from "~/components/Spinner";
import { prisma } from "~/server/db";
import { type RoomData } from "~/types/types";
import { api } from "~/utils/api";

const Room = ({ isPlayerTwo }: { isPlayerTwo: boolean }) => {
  const newWordRef = useRef<HTMLInputElement>(null);
  const [guessLetter, setGuessLetter] = useState("");
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const { roomId } = router.query;
  const theRoomId = roomId as string;
  const trpcUtils = api.useContext();

  const { data: room, isLoading: roomIsLoading } =
    api.rooms.getRoomData.useQuery(
      {
        roomId: theRoomId,
      },
      { enabled: !!theRoomId, refetchInterval: isPlayerTwo ? 0 : 1000 }
    );

  const { data: users, isLoading: isUsersLoading } =
    api.users.getUsernamesForRoom.useQuery(
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
    api.rooms.updateRoom.useMutation({
      onMutate: async ({ updateData }) => {
        if (!room || !updateData.currentWordGuess) {
          return;
        }
        const optimisticCurrentWordGuess = updateData.currentWordGuess || null;
        const optimisticAttempts = updateData.attempts || null;
        const optimisticLastAttemptTimestamp =
          updateData.lastAttemptTimestamp || null;
        // Cancel any outgoing refetches so they don't overwrite our optimistic update.
        await trpcUtils.rooms.getRoomData.cancel();

        // Snapshot of the previous value
        const previousRoomData = trpcUtils.rooms.getRoomData.getData({
          roomId: room?.id,
        });

        // Optimistically update to the new value
        trpcUtils.rooms.getRoomData.setData({ roomId: room?.id }, (prev) => {
          const optimisticRoomData: RoomData = {
            ...room,
            attempts: optimisticAttempts,
            lastAttemptTimestamp: optimisticLastAttemptTimestamp,
            currentWordGuess: optimisticCurrentWordGuess,
          };
          if (!prev) {
            return optimisticRoomData;
          }
          return optimisticRoomData;
        });
        return { previousRoomData };
      },
      onError: (err, updatedRoom, context) => {
        toast.dismiss();
        toast.error(err.message);
        if (!room) {
          void trpcUtils.rooms.getRoomData.invalidate();
          return;
        }
        trpcUtils.rooms.getRoomData.setData(
          { roomId: room?.id },
          () => context?.previousRoomData
        );
      },
      onSettled: () => {
        setGuessLetter("");
        void trpcUtils.rooms.getRoomData.invalidate();
      },
    });

  if (
    room &&
    room.currentWordGuess &&
    room.wordToGuess &&
    room.currentWordGuess === room.wordToGuess
  ) {
    winGameHandler();
    return;
  }

  function winGameHandler() {
    if (!isEditingGame && room) {
      editGame({
        id: room.id,
        updateData: {
          isGuessed: true,
          wordToGuess: "",
          currentWordGuess: "",
          attempts: 0,
          player1_ID: userId,
          player2_ID: room.player1_ID,
        },
      });
    }
  }

  function newGameHandler(e: FormEvent) {
    e.preventDefault();
    const newWord = newWordRef.current?.value;
    if (!isEditingGame && room && newWord && newWord.length > 2) {
      if (newWord.indexOf(" ") !== -1) {
        toast.dismiss();
        toast.error("Only one word per game.");
        return;
      }

      editGame({
        id: room.id,
        updateData: {
          isGuessed: false,
          wordToGuess: newWord,
          currentWordGuess: "_".repeat(newWord.length),
        },
      });
    }
  }

  function sendLetter() {
    if (!isEditingGame && room && guessLetter) {
      const currentGuessingWord = getGuessingWord() || null;

      if (currentGuessingWord && currentGuessingWord.indexOf("_") === -1) {
        winGameHandler();
        return;
      }

      editGame({
        id: room.id,
        updateData: {
          attempts: room.attempts ? room.attempts + 1 : 1,
          lastAttemptTimestamp: new Date().getTime(),
          currentWordGuess: currentGuessingWord || room.currentWordGuess,
        },
      });
    }
  }

  function sendGuessLetterHandler(e: FormEvent) {
    e.preventDefault();
    void sendLetter();
  }

  function getGuessingWord() {
    if (!room || !room.currentWordGuess) {
      return;
    }
    let theGuessingWord = room.wordToGuess;

    if (!theGuessingWord) {
      return;
    }
    const indices = getIndicesOf(guessLetter, theGuessingWord);
    console.log(indices);
    console.log("The guessing word: ", theGuessingWord);

    if (indices.length === 0) {
      return;
    }
    for (let j = 0; j < indices.length; j++) {
      theGuessingWord = setCharAt(
        room.currentWordGuess,
        Number(indices[j]),
        guessLetter
      );
    }
    console.log(theGuessingWord);
    return theGuessingWord;
  }

  function setCharAt(str: string, index: number, chr: string) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
  }

  function getIndicesOf(searchStr: string, str: string): number[] {
    const searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
      return [];
    }
    let startIndex = 0;
    let index;
    const indices = [];
    str = str.toLowerCase();
    searchStr = searchStr.toLowerCase();
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
      indices.push(index);
      startIndex = index + searchStrLen;
    }
    return indices;
  }

  if (!room && !roomIsLoading) {
    void router.push("/");
    return;
  }

  if (!room || roomIsLoading || !users || isUsersLoading) {
    return <div />;
  }

  const isPlayerOne = room && userId && userId === room.player1_ID;

  return (
    <>
      <BirdsContainer />
      <Headline title="Hangman" />

      <div className="mt-12 flex min-h-[calc(100vh-1rem-120px)] w-full flex-col justify-between gap-6">
        {users?.playerOneUsername && (
          <div className="-mt-5 flex w-full">
            <span className="mr-2 rounded bg-red-900 px-2.5 py-0.5 text-sm font-medium text-red-300">
              {users.playerOneUsername}
            </span>
          </div>
        )}

        <div className="flex w-full grow items-center justify-center bg-slate-200">
          {isPlayerOne && !room.wordToGuess && (
            <div className="flex flex-col items-center justify-center gap-4 text-white">
              <h1>You have won the game!</h1>
              <h1>Enter a new word to play again:</h1>
              <form
                className="flex w-full items-center justify-center gap-3"
                onSubmit={newGameHandler}
              >
                <input
                  ref={newWordRef}
                  type="text"
                  className="block h-12 w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-center font-butcher text-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Type a word..."
                  required
                  disabled={isEditingGame}
                  minLength={3}
                />
                <Button disabled={isEditingGame} type="submit">
                  Go
                </Button>
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

        <div className="flex w-full justify-center">
          <h1 className="font-butcher text-4xl tracking-[.3em] text-white">
            {room.currentWordGuess}
          </h1>
        </div>

        {!isPlayerOne && (
          <form
            className="mb-3 flex w-full items-center justify-center gap-3"
            onSubmit={sendGuessLetterHandler}
          >
            <input
              type="text"
              onChange={(e) => setGuessLetter(e.target.value.toUpperCase())}
              value={guessLetter}
              className="block h-12 w-32 rounded-lg border border-gray-600 bg-gray-700 p-2 text-center font-butcher text-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Type..."
              required
              minLength={1}
              maxLength={1}
              disabled={isEditingGame}
            />
            <Button disabled={isEditingGame} type="submit">
              {isEditingGame ? <LoadingSpinner /> : "↑"}
            </Button>
          </form>
        )}

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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const roomId = context.params?.roomId;
  if (typeof roomId !== "string") throw new Error("no room id");
  const theRoom = await prisma.room.findUnique({
    where: {
      id: roomId,
    },
  });

  if (!session || !theRoom) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const isPlayerTwo =
    theRoom.player2_ID && session.user?.id === theRoom.player2_ID;

  return {
    props: {
      session,
      isPlayerTwo,
    },
  };
};
