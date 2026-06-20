import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminBanner() {
  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(true);

  const checkBanner = () => {
    const isEnabled = localStorage.getItem('admin_banner_enabled') === 'true';
    const bannerText = localStorage.getItem('admin_banner_text') || '';
    setEnabled(isEnabled);
    setText(bannerText);
    if (isEnabled) setVisible(true);
  };

  useEffect(() => {
    checkBanner();
    // Listen for custom event when admin updates settings
    window.addEventListener('admin_settings_changed', checkBanner);
    return () => window.removeEventListener('admin_settings_changed', checkBanner);
  }, []);

  if (!enabled || !visible || !text) return null;

  return (
    <div className="w-full bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between text-sm font-medium z-50">
      <div className="flex-1 text-center truncate">{text}</div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 shrink-0 text-primary-foreground hover:bg-black/20 rounded-full" 
        onClick={() => setVisible(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}