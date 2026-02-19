import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans p-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Access Denied
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Your email is not authorized to access My Digital Scoop.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Only pre-registered users can sign in. If you believe this is an
            error, please contact your school administrator.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button asChild className="w-full" size="lg">
            <Link href="/">Return Home</Link>
          </Button>
          <p className="text-xs text-center text-muted-foreground/60">
            My Digital Scoop &bull; Internal School Network
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
