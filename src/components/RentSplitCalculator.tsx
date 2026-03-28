import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function RentSplitCalculator() {
  const [totalRent, setTotalRent] = useState<number>(12000);
  const [people, setPeople] = useState<number>(3);

  const perPersonRent = useMemo(() => {
    if (!people || people <= 0) return 0;
    return Math.round(totalRent / people);
  }, [people, totalRent]);

  return (
    <Card className="border border-border/60 dark:bg-[#1e293b] transition-colors duration-300">
      <CardHeader>
        <CardTitle>Rent Split Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="total-rent">Total Rent (₹)</Label>
          <Input
            id="total-rent"
            type="number"
            min={0}
            value={totalRent}
            onChange={(e) => setTotalRent(Number(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="people-count">Number of People</Label>
          <Input
            id="people-count"
            type="number"
            min={1}
            value={people}
            onChange={(e) => setPeople(Number(e.target.value) || 1)}
          />
        </div>

        <div className="rounded-xl bg-primary/10 dark:bg-slate-900/50 p-4 border border-primary/20">
          <p className="text-sm text-muted-foreground">Per person rent</p>
          <p className="text-2xl font-bold text-primary">₹{perPersonRent.toLocaleString('en-IN')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
