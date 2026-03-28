import { useMemo, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RoomFilters } from '@/components/RoomFilters';
import { RentSplitCalculator } from '@/components/RentSplitCalculator';

interface RoommateProfile {
  id: number;
  name: string;
  budget: number;
  lifestyle: 'Smoker' | 'Non-smoker';
  occupation: 'Student' | 'Job';
  city: string;
  occupancyPreference: number;
}

const roommateProfiles: RoommateProfile[] = [
  { id: 1, name: 'Aarav', budget: 9000, lifestyle: 'Non-smoker', occupation: 'Student', city: 'bengaluru', occupancyPreference: 3 },
  { id: 2, name: 'Sneha', budget: 12000, lifestyle: 'Non-smoker', occupation: 'Job', city: 'pune', occupancyPreference: 2 },
  { id: 3, name: 'Ritvik', budget: 10000, lifestyle: 'Smoker', occupation: 'Student', city: 'hyderabad', occupancyPreference: 4 },
  { id: 4, name: 'Meera', budget: 14000, lifestyle: 'Non-smoker', occupation: 'Student', city: 'chennai', occupancyPreference: 2 },
];

export default function Roommates() {
  const [budget, setBudget] = useState(15000);
  const [city, setCity] = useState('all cities');
  const [occupancy, setOccupancy] = useState('all');

  const filteredProfiles = useMemo(() => {
    return roommateProfiles.filter((profile) => {
      const matchesBudget = profile.budget <= budget;
      const matchesCity = city === 'all cities' || city === profile.city;
      const matchesOccupancy = occupancy === 'all' || profile.occupancyPreference === Number(occupancy);
      return matchesBudget && matchesCity && matchesOccupancy;
    });
  }, [budget, city, occupancy]);

  return (
    <Layout>
      <section className="container mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Roommate Finder</h1>
          <p className="text-muted-foreground">Meet students and professionals who match your budget and lifestyle.</p>
        </div>

        <RoomFilters
          budget={budget}
          city={city}
          occupancy={occupancy}
          onBudgetChange={setBudget}
          onCityChange={setCity}
          onOccupancyChange={setOccupancy}
        />

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} className="dark:bg-[#1e293b] transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">{profile.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><span className="font-medium">Budget:</span> ₹{profile.budget.toLocaleString('en-IN')}</p>
                  <p><span className="font-medium">Lifestyle:</span> {profile.lifestyle}</p>
                  <p><span className="font-medium">Occupation:</span> {profile.occupation}</p>
                  <Badge variant="secondary" className="mt-1">City: {profile.city}</Badge>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Connect</Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <RentSplitCalculator />
        </div>
      </section>
    </Layout>
  );
}
