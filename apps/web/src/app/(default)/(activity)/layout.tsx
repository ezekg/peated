import Button from "@peated/web/components/button";
import PriceChanges, {
  PriceChangesSkeleton,
} from "@peated/web/components/priceChanges";
import Tabs, { TabItem } from "@peated/web/components/tabs";
import { getCurrentUser } from "@peated/web/lib/auth.server";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import NewBottles, { NewBottlesSkeleton } from "./newBottles";
// import { PriceChanges, PriceChangesSkeleton } from "./content";

export default async function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <>
      <div className="flex w-full">
        <div className="flex-1 overflow-hidden lg:w-8/12">
          <Tabs fullWidth border>
            {user && (
              <TabItem as={Link} href="/activity/friends" controlled>
                Friends
              </TabItem>
            )}
            <TabItem as={Link} href="/" controlled>
              Global
            </TabItem>
            {/* <TabItem href="/activity/local" controlled>
          Local
        </TabItem> */}
          </Tabs>
          {children}
        </div>
        <div className="ml-4 hidden w-4/12 lg:block">
          {!user && (
            <div className="flex flex-col items-center rounded p-4 ring-1 ring-inset ring-slate-800">
              <p className="text-light mb-4 text-sm">
                Create a profile to record tastings, track your favorite
                bottles, and more.
              </p>
              <Button color="primary" href="/login" size="small">
                Sign Up or Login
              </Button>
            </div>
          )}
          <div>
            <Tabs fullWidth>
              <TabItem active>Newest Bottles</TabItem>
            </Tabs>

            <Suspense fallback={<NewBottlesSkeleton />}>
              <NewBottles />
            </Suspense>

            <Tabs fullWidth>
              <TabItem active>Market Prices</TabItem>
            </Tabs>
            <Suspense fallback={<PriceChangesSkeleton />}>
              <PriceChanges />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
