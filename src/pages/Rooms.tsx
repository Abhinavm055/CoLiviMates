import { useMemo, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RoomFilters } from '@/components/RoomFilters';

interface Room {
  id: number;
  rent: number;
  location: string;
  city: string;
  totalPeople: number;
  availableSlots: number;
}

const rooms: Room[] = [
  { id: 1, rent: 18000, location: 'Koramangala', city: 'bengaluru', totalPeople: 3, availableSlots: 1 },
  { id: 2, rent: 24000, location: 'Viman Nagar', city: 'pune', totalPeople: 4, availableSlots: 2 },
  { id: 3, rent: 15000, location: 'Guindy', city: 'chennai', totalPeople: 2, availableSlots: 1 },
  { id: 4, rent: 22000, location: 'Hinjewadi', city: 'pune', totalPeople: 3, availableSlots: 1 },
  { id: 5, rent: 20000, location: 'Madhapur', city: 'hyderabad', totalPeople: 4, availableSlots: 1 },
];

export default function Rooms() {
  const [budget, setBudget] = useState(25000);
  const [city, setCity] = useState('all cities');
  const [occupancy, setOccupancy] = useState('all');

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesBudget = room.rent <= budget;
      const matchesCity = city === 'all cities' || room.city === city;
      const matchesOccupancy = occupancy === 'all' || room.totalPeople === Number(occupancy);
      return matchesBudget && matchesCity && matchesOccupancy;
    });
  }, [budget, city, occupancy]);

  return (
    <Layout>
      <section className="container mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Room Listings</h1>
          <p className="text-muted-foreground">Budget-friendly options for students dealing with city rent pressure.</p>
        </div>

        <RoomFilters
          budget={budget}
          city={city}
          occupancy={occupancy}
          onBudgetChange={setBudget}
          onCityChange={setCity}
          onOccupancyChange={setOccupancy}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="dark:bg-[#1e293b] transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-xl">₹{room.rent.toLocaleString('en-IN')} / month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="font-medium">Location:</span> {room.location}</p>
                <p><span className="font-medium">Total people:</span> {room.totalPeople}</p>
                <p><span className="font-medium">Available slots:</span> {room.availableSlots}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Join Room</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  );
}
