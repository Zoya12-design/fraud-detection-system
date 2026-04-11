import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [autoBlock, setAutoBlock] = useState(true);
  const [threshold, setThreshold] = useState("75");

  const handleSave = () => {
    toast({ title: "Settings saved", description: "Your preferences have been updated." });
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm">Configure fraud detection preferences</p>
        </div>

        <div className="bg-card rounded-lg border p-6 space-y-6">
          <h2 className="font-semibold">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Alerts</Label>
                <p className="text-xs text-muted-foreground">Receive email for high-risk transactions</p>
              </div>
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>SMS Alerts</Label>
                <p className="text-xs text-muted-foreground">Receive SMS for critical fraud alerts</p>
              </div>
              <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6 space-y-6">
          <h2 className="font-semibold">Detection Rules</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Block High Risk</Label>
                <p className="text-xs text-muted-foreground">Automatically block transactions above threshold</p>
              </div>
              <Switch checked={autoBlock} onCheckedChange={setAutoBlock} />
            </div>
            <div className="space-y-2">
              <Label>Risk Score Threshold</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">Transactions scoring above this will be flagged</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6 space-y-6">
          <h2 className="font-semibold">Account</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue="john.doe@company.com" />
            </div>
          </div>
        </div>

        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </AppLayout>
  );
}
