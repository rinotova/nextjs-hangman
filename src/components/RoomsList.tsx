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
    <div className="mx-auto mt-12 flex w-full max-w-md items-center justify-center p-2">
      {rooms.map((room) => {
        return (
          <div
            key={room.id}
            className="mb-4 flex w-full items-center justify-between rounded-lg border border-slate-300 p-2 shadow"
          >
            <p className="text-slate-300">{room.username}</p>
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
