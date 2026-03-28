import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface RoomFiltersProps {
  budget: number;
  city: string;
  occupancy: string;
  onBudgetChange: (budget: number) => void;
  onCityChange: (city: string) => void;
  onOccupancyChange: (occupancy: string) => void;
}

const cities = ['All Cities', 'Bengaluru', 'Mumbai', 'Pune', 'Hyderabad', 'Chennai', 'Delhi'];

export function RoomFilters({
  budget,
  city,
  occupancy,
  onBudgetChange,
  onCityChange,
  onOccupancyChange,
}: RoomFiltersProps) {
  return (
    <div className="bg-card dark:bg-[#1e293b] border border-border rounded-2xl p-5 transition-colors duration-300 space-y-5">
      <div className="space-y-2">
        <Label>Budget Range: ₹{budget.toLocaleString('en-IN')}/month</Label>
        <Slider
          value={[budget]}
          onValueChange={([value]) => onBudgetChange(value)}
          min={2000}
          max={40000}
          step={500}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>City</Label>
          <Select value={city} onValueChange={onCityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((option) => (
                <SelectItem key={option} value={option.toLowerCase()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Occupancy</Label>
          <Select value={occupancy} onValueChange={onOccupancyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select occupancy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="2">2 People</SelectItem>
              <SelectItem value="3">3 People</SelectItem>
              <SelectItem value="4">4 People</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
