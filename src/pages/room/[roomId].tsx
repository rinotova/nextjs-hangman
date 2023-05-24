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
  const [guessLetter, setGuessLetter] = useState("");
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

  const {
    mutate: editGame,
    mutateAsync: asyncEditGame,
    isLoading: isEditingGame,
  } = api.rooms.updateRoom.useMutation();

  if (
    room &&
    room.currentWordGuess &&
    room.wordToGuess &&
    room.currentWordGuess === room.wordToGuess
  ) {
    void winGameHandler();
    return;
  }

  async function winGameHandler() {
    if (!isEditingGame && room) {
      await asyncEditGame({
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
      setGuessLetter("");
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

  async function sendLetter() {
    if (!isEditingGame && room && guessLetter) {
      const guessingWord = getGuessingWord();

      if (guessingWord && guessingWord.indexOf("_") === -1) {
        void winGameHandler();
        return;
      }

      await asyncEditGame({
        id: room.id,
        updateData: {
          attempts: room.attempts ? room.attempts + 1 : 1,
          lastAttemptTimestamp: new Date().getTime(),
          currentWordGuess: guessingWord || room.currentWordGuess,
        },
      });
      setGuessLetter("");
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

  if (!room || roomIsLoading) {
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

        {!isPlayerOne && (
          <div className="flex w-full">
            <form onSubmit={sendGuessLetterHandler}>
              <input
                type="text"
                onChange={(e) => setGuessLetter(e.target.value.toUpperCase())}
                value={guessLetter}
                className="block h-12 w-32 rounded-lg border border-gray-600 bg-gray-700 p-2 text-center font-butcher text-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Type..."
                required
                minLength={1}
                maxLength={1}
              />
              <Button type="submit">Send</Button>
            </form>
          </div>
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
