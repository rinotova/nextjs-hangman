import { type GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { type FormEvent, useRef, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import BirdsContainer from "~/components/BirdsContainer";
import Button from "~/components/Button";
import { HangmanDrawing } from "~/components/HangmanDrawing";
import Headline from "~/components/Headline";
import { LoadingSpinner } from "~/components/Spinner";
import { type RoomData } from "~/types/types";
import { api } from "~/utils/api";

const Room = () => {
  const newWordRef = useRef<HTMLInputElement>(null);
  const letterRef = useRef<HTMLInputElement>(null);
  const [guessLetter, setGuessLetter] = useState("");
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const { roomId } = router.query;
  const theRoomId = roomId as string;
  const trpcUtils = api.useContext();

  useEffect(() => {
    letterRef.current?.focus();
  }, [guessLetter]);

  const { data: room, isLoading: roomIsLoading } =
    api.rooms.getRoomData.useQuery(
      {
        roomId: theRoomId,
      },
      {
        enabled: !!theRoomId,
        refetchInterval: 1000,
      }
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

  function endGame() {
    if (!isEditingGame && room) {
      editGame({
        id: room.id,
        updateData: {
          isGuessed: true,
          wordToGuess: "",
          currentWordGuess: "",
          usedLetters: [],
          previousWord: room.wordToGuess || "",
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
          wordToGuess: newWord.toUpperCase(),
          currentWordGuess: "_".repeat(newWord.length),
          usedLetters: [],
          attempts: 0,
          player1_ID: room.player2_ID || "",
          player2_ID: room.player1_ID,
        },
      });
    }
  }

  function sendGuessLetterHandler(e: FormEvent) {
    e.preventDefault();
    if (!isEditingGame && room && room.wordToGuess && guessLetter) {
      const currentGuessingWord = getGuessingWord() || null;

      if (
        room.wordToGuess.indexOf(guessLetter) !== -1 &&
        currentGuessingWord &&
        currentGuessingWord.indexOf("_") === -1
      ) {
        endGame();
        return;
      }

      if (room.usedLetters.indexOf(guessLetter) !== -1) {
        toast.dismiss();
        toast.success("Letter already used!");
        setGuessLetter("");
        return;
      }

      const currentAttempts = room.attempts || 0;

      const theCurrentWord =
        room.wordToGuess?.indexOf(guessLetter) === -1
          ? room.currentWordGuess
          : currentGuessingWord;

      editGame({
        id: room.id,
        updateData: {
          attempts:
            room.wordToGuess.indexOf(guessLetter) === -1
              ? currentAttempts + 1
              : room.attempts || undefined,
          currentWordGuess: theCurrentWord,
          usedLetters:
            room.usedLetters.indexOf(guessLetter) === -1
              ? [...room.usedLetters, guessLetter]
              : room.usedLetters,
        },
      });
    }
  }

  function getGuessingWord() {
    if (!room || !room.currentWordGuess) {
      return;
    }
    let theGuessingWord = room.wordToGuess;
    let currentWordGuess = room.currentWordGuess;
    if (!theGuessingWord) {
      return;
    }

    const indices = getIndicesOf(guessLetter, theGuessingWord);
    console.log(indices);
    console.log("The guessing word: ", theGuessingWord);

    for (let j = 0; j < indices.length; j++) {
      theGuessingWord = setCharAt(
        currentWordGuess,
        Number(indices[j]),
        guessLetter
      );
      currentWordGuess = theGuessingWord;
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

  if (!room || roomIsLoading || !users || isUsersLoading || !userId) {
    return <div />;
  }

  const isPlayerOne = userId === room.player1_ID;
  const isPlayerTwo = userId === room.player2_ID;
  let playerHasLost;
  let playerHasWon;

  if (isPlayerOne) {
    playerHasLost = !!room.isGuessed;
    playerHasWon = room.attempts !== null && room.attempts > 5;
  }

  if (isPlayerTwo) {
    playerHasLost = room.attempts !== null && room.attempts > 5;
    playerHasWon = !!room.isGuessed;
  }
  const gameHasEnded = playerHasLost || playerHasWon;

  console.log("playerHasLost: ", playerHasLost);
  console.log("playerHasWon: ", playerHasWon);
  return (
    <>
      <BirdsContainer />
      <Headline title="Hangman" />

      <div className="mt-12 flex min-h-[calc(100vh-1rem-120px)] w-full flex-col justify-between gap-6">
        {users?.playerOneUsername && (
          <div className="-mt-5 flex w-full">
            <span className="rounded bg-red-900 px-2.5 py-0.5 text-sm font-medium text-red-300">
              {users.playerOneUsername}
            </span>
          </div>
        )}

        <div className="flex w-full grow flex-col items-center justify-between rounded-lg border border-slate-600 p-4 font-roboto text-white">
          <HangmanDrawing numberOfGuesses={room.attempts || 0} />
          {gameHasEnded && isPlayerTwo ? (
            <div className="flex flex-col items-center justify-center gap-4 ">
              <div className="flex w-full justify-center">
                <h1 className="font-butcher text-4xl tracking-[.3em] text-white">
                  {playerHasLost ? room.wordToGuess : room.previousWord}
                </h1>
              </div>
              {playerHasLost ? (
                <div className=" flex w-full items-center justify-center">
                  <span className="rounded bg-red-900 px-2.5 py-0.5 text-sm font-medium text-red-300">
                    You have lost the game!
                  </span>
                </div>
              ) : (
                <div className=" flex w-full items-center justify-center">
                  <span className="mr-2 rounded bg-green-900 px-2.5 py-0.5 text-sm font-medium text-green-300">
                    <div className="flex gap-3">You have won the game!</div>
                  </span>
                </div>
              )}

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
          ) : null}

          {gameHasEnded && isPlayerOne && (
            <div className="mt-2 flex flex-col items-center justify-center gap-4">
              <div className="flex w-full justify-center">
                <h1 className="font-butcher text-4xl tracking-[.3em] text-white">
                  {room.previousWord || room.wordToGuess}
                </h1>
              </div>
              {playerHasLost ? (
                <h1>You have lost the game!</h1>
              ) : (
                <h1>You have won the game!</h1>
              )}
              <div className=" flex w-full items-center justify-center">
                <span className="mr-2 rounded bg-green-900 px-2.5 py-0.5 text-sm font-medium text-green-300">
                  <div className="flex gap-3">
                    Waiting for a new word
                    <LoadingSpinner />
                  </div>
                </span>
              </div>
            </div>
          )}
        </div>

        {!playerHasLost && (
          <div className="flex w-full justify-center">
            <h1 className="font-butcher text-4xl tracking-[.3em] text-white">
              {room.currentWordGuess}
            </h1>
          </div>
        )}

        {!isPlayerOne && room.wordToGuess && !playerHasLost && (
          <form
            className="mb-3 flex w-full items-center justify-center gap-3"
            onSubmit={sendGuessLetterHandler}
          >
            <input
              ref={letterRef}
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
          <div className="flex w-full justify-end">
            <span className="rounded bg-green-900 px-2.5 py-0.5 text-sm font-medium text-green-300">
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
