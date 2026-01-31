import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateFireStoreIssue } from "@/hooks/use-firestore-issues";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Camera, MapPin } from "lucide-react";
import { LocationDetector } from "@/components/map/LocationDetector";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { geocodeArea, isValidCoordinates } from "@/lib/geocoding";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledCategory?: string;
  prefilledDescription?: string;
}

const formSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(5, "Location is required"),
  affectedCount: z.number().min(1, "Affected count must be at least 1"),
});

export function ReportModal({ 
  open, 
  onOpenChange, 
  prefilledCategory, 
  prefilledDescription 
}: ReportModalProps) {
  const createIssue = useCreateFireStoreIssue();
  const { user } = useAuth();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<string>("");
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "General",
      description: "",
      location: "",
      affectedCount: 1,
    },
  });

  // Update form values when prefilled data changes
  useEffect(() => {
    if (prefilledCategory) {
      form.setValue("category", prefilledCategory);
    }
    if (prefilledDescription) {
      form.setValue("description", prefilledDescription);
    }
  }, [prefilledCategory, prefilledDescription, form]);

  const handleUserLocationDetected = (location: { lat: number; lng: number; address: string }) => {
    setDetectedLocation(location.address);
    form.setValue("location", location.address);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      setIsAuthDialogOpen(true);
      return;
    }

    try {
      // Geocode the location string to get coordinates
      const geocodedLocation = await geocodeArea(values.location);
      
      let issueData: any = {
        description: values.description,
        category: values.category,
        location: values.location,
        status: "Pending",
        affectedCount: values.affectedCount,
        updates: [{
          status: "Pending",
          date: new Date().toISOString(),
          comment: "Issue reported"
        }]
      };

      // Only add coordinates if geocoding was successful and coordinates are valid
      if (geocodedLocation.success && isValidCoordinates(geocodedLocation.lat, geocodedLocation.lng)) {
        issueData.lat = geocodedLocation.lat;
        issueData.lng = geocodedLocation.lng;
      } else {
        console.warn('Geocoding failed or invalid coordinates for location:', values.location);
        // Issue will be created without coordinates (marker won't show on map)
      }

      createIssue.mutate(issueData, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          setPhotoPreview(null);
        }
      });
    } catch (error) {
      console.error('Error creating issue:', error);
      // Still create the issue even if geocoding fails
      createIssue.mutate({
        description: values.description,
        category: values.category,
        location: values.location,
        status: "Pending",
        affectedCount: values.affectedCount,
        updates: [{
          status: "Pending",
          date: new Date().toISOString(),
          comment: "Issue reported"
        }]
      }, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          setPhotoPreview(null);
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-primary">Report an Issue</DialogTitle>
          <DialogDescription>
            Submit details for the relevant department.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Mock Photo Upload */}
            <div className="space-y-2">
              <FormLabel>Evidence Photo</FormLabel>
              <div 
                className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer relative overflow-hidden h-32"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">Click to upload photo</span>
                  </>
                )}
                <input 
                  id="photo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoUpload}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly className="bg-muted font-medium" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <div className="space-y-2">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input {...field} className="pl-9" placeholder="Enter location or detect automatically..." />
                    </div>
                    <LocationDetector 
                      onLocationDetected={handleUserLocationDetected}
                      disabled={createIssue.isPending}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Describe the issue in detail..." 
                      className="resize-none min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createIssue.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              >
                {createIssue.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
      
      <AuthDialog 
        isOpen={isAuthDialogOpen} 
        onClose={() => setIsAuthDialogOpen(false)} 
      />
    </Dialog>
  );
}
