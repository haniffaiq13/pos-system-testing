// Admin Tools Page - system management tools

import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Ticket, DollarSign, AlertTriangle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function Tools() {
  const { toast } = useToast();

  const resetMutation = useMutation({
    mutationFn: () => api.resetStorage(),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        title: "Storage Reset",
        description: "All data has been reset to seed state",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Admin Tools</h1>

        <div className="space-y-6">
          <Card className="rounded-2xl border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                These actions cannot be undone. Use with caution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-xl border border-destructive/20">
                <div>
                  <h3 className="font-semibold">Reset All Storage</h3>
                  <p className="text-sm text-muted-foreground">
                    Reset all data to initial seed state
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => resetMutation.mutate()}
                  disabled={resetMutation.isPending}
                  className="rounded-xl"
                  data-testid="button-reset-storage"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Storage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
