import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell, Lock, Globe, Database } from 'lucide-react';

export const SettingsPage = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-content tracking-tight">System Settings</h1>
        <p className="text-content-muted mt-1">Configure your application preferences and integrations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Bell className="w-5 h-5 mr-2" /> Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-obsidian rounded-xl border border-border">
            <div>
              <div className="font-medium text-content">Email Alerts</div>
              <div className="text-sm text-content-muted">Receive daily summaries of inspections.</div>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4 bg-obsidian rounded-xl border border-border">
            <div>
              <div className="font-medium text-content">High Severity Violations</div>
              <div className="text-sm text-content-muted">Instant push notifications for critical AI flags.</div>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Lock className="w-5 h-5 mr-2" /> Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-obsidian rounded-xl border border-border">
            <div>
              <div className="font-medium text-content">Two-Factor Authentication (2FA)</div>
              <div className="text-sm text-content-muted">Add an extra layer of security.</div>
            </div>
            <Button variant="secondary">Enable 2FA</Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end pt-4">
        <Button variant="primary">Save Changes</Button>
      </div>
    </div>
  );
};
