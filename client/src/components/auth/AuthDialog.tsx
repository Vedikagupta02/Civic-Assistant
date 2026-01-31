import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AuthModal } from './AuthModal';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-md">
        <AuthModal onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
