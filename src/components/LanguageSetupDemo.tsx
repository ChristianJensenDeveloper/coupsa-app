import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { LanguageSetupMVP } from './LanguageSetupMVP';
import { Languages, Settings } from 'lucide-react';

export function LanguageSetupDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Languages className="w-4 h-4" />
          Language Setup (MVP Demo)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Language Setup MVP Demo
          </DialogTitle>
        </DialogHeader>
        <div className="p-0">
          <LanguageSetupMVP />
        </div>
      </DialogContent>
    </Dialog>
  );
}