import React from "react";
import Button from "./Button";
import { api } from "~/utils/api";
import { useRouter } from "next/router";

function RoomsList() {
  const router = useRouter();
  const { data: rooms, isLoading: roomsLoading } =
    api.rooms.getAllRooms.useQuery();

  function joinRoom(roomId: string) {
    void router.push(`/room/${roomId}`);
  }

  if (!rooms || roomsLoading) {
    return <div />;
  }

  return (
    <div className="mx-auto mt-12 flex w-full max-w-md flex-col items-center justify-center">
      {rooms.map((room) => {
        return (
          <div
            key={room.id}
            className="mb-4 flex w-full items-center justify-between rounded-lg  border border-dashed border-slate-600 bg-gray-900 p-2"
          >
            <span className="mr-2 rounded bg-green-900 px-2.5 py-0.5 text-sm font-medium text-green-300">
              {room.username}
            </span>

            {!room.isFull && (
              <Button onClick={() => joinRoom(room.id)}>Join</Button>
            )}
            {room.isFull && <Button disabled={true}>Full</Button>}
          </div>
        );
      })}
    </div>
  );
}

export default RoomsList;
