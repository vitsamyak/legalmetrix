import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { ShieldAlert, FileText, Settings, Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/Toast';

export const NotificationsPage = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Rule Update', desc: 'Rule 6(1)(a) amendment published. Please review the updated compliance requirements.', time: '2 hours ago', read: false, type: 'rule' },
    { id: 2, title: 'Inspection Alert', desc: 'High risk violation flagged in recent scan of "Packaged Food" product.', time: '5 hours ago', read: false, type: 'alert' },
    { id: 3, title: 'System Maintenance', desc: 'Scheduled downtime on Sunday 2AM for system upgrades and database optimization.', time: '1 day ago', read: true, type: 'system' },
    { id: 4, title: 'Weekly Report Ready', desc: 'Your compliance summary for the week is ready to download.', time: '2 days ago', read: true, type: 'rule' },
    { id: 5, title: 'Account Security', desc: 'New login detected from a different IP address.', time: '3 days ago', read: true, type: 'alert' },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'success');
  };

  const clearAll = () => {
    setNotifications([]);
    showToast('Notifications cleared', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-content tracking-tight flex items-center gap-3">
            <Bell className="w-6 h-6 text-primary" /> Notifications
          </h1>
          <p className="text-content-muted mt-1">Manage your system alerts and compliance updates.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={markAllAsRead} disabled={unreadCount === 0} className="flex items-center gap-2">
            <Check className="w-4 h-4" /> Mark all read
          </Button>
          <Button variant="danger" onClick={clearAll} disabled={notifications.length === 0} className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Clear all
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="bg-obsidian border-white/5">
            <CardContent className="p-12 text-center text-content-muted flex flex-col items-center">
              <Bell className="w-12 h-12 opacity-20 mb-4" />
              <p className="text-lg">You're all caught up!</p>
              <p className="text-sm">No new notifications right now.</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notif) => (
            <Card key={notif.id} className={`transition-all ${notif.read ? 'bg-obsidian border-white/5 opacity-80' : 'bg-[#0F172A] border-primary/20 shadow-[0_0_30px_-10px_rgba(99,102,241,0.2)]'}`}>
              <CardContent className="p-5 flex gap-4">
                <div className={`mt-1 flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border ${
                  notif.type === 'alert' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                  notif.type === 'rule' ? 'bg-primary/10 border-primary/20 text-primary' :
                  'bg-slate-500/10 border-slate-500/20 text-slate-400'
                }`}>
                  {notif.type === 'alert' ? <ShieldAlert className="w-6 h-6" /> :
                   notif.type === 'rule' ? <FileText className="w-6 h-6" /> :
                   <Settings className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-lg font-bold flex items-center gap-2 ${notif.read ? 'text-white/80' : 'text-white'}`}>
                      {notif.title}
                      {!notif.read && <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] uppercase tracking-wider">New</span>}
                    </h4>
                    <span className="text-sm font-medium text-content-muted whitespace-nowrap ml-2">{notif.time}</span>
                  </div>
                  <p className="text-base text-content-muted leading-relaxed mt-1">{notif.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
