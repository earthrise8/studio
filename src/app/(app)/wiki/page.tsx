
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  allBuildings,
  cityTiers,
  getBuildingSet,
} from '@/lib/city-data';
import {
  DollarSign,
  Home,
  Info,
  Leaf,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export default function WikiPage() {
  const buildingUnlockTiers = cityTiers.map((tier, index) => {
    const buildingsAtThisTier = getBuildingSet(tier.points);
    const buildingsAtPreviousTier =
      index > 0 ? getBuildingSet(cityTiers[index - 1].points) : [];

    const newUnlocks = buildingsAtThisTier.filter(
      (b) => !buildingsAtPreviousTier.some((pb) => pb.emoji === b.emoji)
    );

    return {
      ...tier,
      unlocks: newUnlocks,
    };
  });

  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="font-headline text-3xl font-bold">Fitropolis Wiki</h2>
      <p className="text-muted-foreground">
        Discover the buildings you can unlock as your city grows.
      </p>

      <div className="space-y-8">
        {buildingUnlockTiers.map((tier) => (
          <Card key={tier.name}>
            <CardHeader>
              <CardTitle className="font-headline">
                {tier.name} (
                {tier.next ? `${tier.points} - ${tier.next - 1}` : `${tier.points}+`}{' '}
                Points)
              </CardTitle>
              <CardDescription>
                New buildings available at this city size.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tier.unlocks.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {tier.unlocks.map((building) => (
                    <Card
                      key={building.name}
                      className="flex flex-col"
                    >
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <span className="text-5xl">{building.emoji}</span>
                          <div>
                            <CardTitle className="text-xl">
                              {building.name}
                            </CardTitle>
                            <CardDescription>
                              Cost: ${building.cost.toLocaleString()}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-2 text-xs text-muted-foreground">
                        {building.isResidential && (
                          <div className="flex items-center gap-2">
                            <Home className="h-3 w-3" />
                            <span>
                              Residential: Pop. {building.defaultPopulation}-
                              {building.maxPopulation}
                            </span>
                          </div>
                        )}
                        {building.revenueMultiplier && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3" />
                            <span>
                              Commercial: Earns revenue based on population.
                            </span>
                          </div>
                        )}
                        {building.isFarmland && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3" />
                            <span>
                              Special Commercial: Generates income in large plots.
                            </span>
                          </div>
                        )}
                        {building.isPublicService && (
                          <div className="flex items-start gap-2 text-yellow-600">
                            <ShieldCheck className="h-3 w-3 mt-0.5" />
                            <span>
                              Public Service: Costs $
                              {building.maintenanceCostPerCitizen} per citizen. Increases rating by +{building.ratingBonus} in a {building.ratingRange}-tile radius.
                            </span>
                          </div>
                        )}
                        {building.ratingBonus && !building.isPublicService && (
                          <div className="flex items-start gap-2 text-green-500">
                            <TrendingUp className="h-3 w-3 mt-0.5" />
                            <span>
                              Amenity: Increases rating by +{building.ratingBonus}{' '}
                              in a {building.ratingRange}-tile radius.
                            </span>
                          </div>
                        )}
                        {building.ratingPenalty && (
                          <div className="flex items-start gap-2 text-red-500">
                            <TrendingDown className="h-3 w-3 mt-0.5" />
                            <span>
                              Nuisance: Decreases rating by{' '}
                              {building.ratingPenalty} in a {building.ratingRange}
                              -tile radius.
                            </span>
                          </div>
                        )}
                        {(building.ecoBonus || building.ecoPenalty) && (
                            <div className={`flex items-center gap-2 ${building.ecoBonus ? 'text-green-500' : 'text-red-500'}`}>
                                <Leaf className="h-3 w-3" />
                                <span>Eco Score: {building.ecoBonus ? `+${building.ecoBonus}` : `-${building.ecoPenalty}`}</span>
                            </div>
                        )}
                        {!building.isResidential &&
                          !building.revenueMultiplier &&
                          !building.isPublicService &&
                          !building.ratingBonus &&
                          !building.ratingPenalty &&
                          !building.isFarmland &&
                           building.name !== 'Road' &&
                          building.name !== 'Remove' &&
                          !building.ecoBonus &&
                          !building.ecoPenalty && (
                            <div className="flex items-center gap-2">
                              <Info className="h-3 w-3" />
                              <span>Decorative or special-purpose tile.</span>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No new buildings are unlocked at this level.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
