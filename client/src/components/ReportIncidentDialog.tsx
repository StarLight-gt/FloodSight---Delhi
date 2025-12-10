import { useState } from "react";
import { useForm } from "react-hook-form";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { FormMessage } from "@/components/ui/form";

type IncidentFormValues = {
  zone: string;
  type: "drain" | "citizen";
  locationName: string;
  description: string;
  latitude?: string;
  longitude?: string;
};

const DELHI_ZONES = [
  "South Delhi",
  "Central Delhi",
  "North Delhi",
  "East Delhi",
  "West Delhi",
  "North East Delhi",
  "North West Delhi",
  "South West Delhi",
  "Shahdara",
  "New Delhi",
  "Yamuna Floodplain",
];

export function ReportIncidentDialog() {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const form = useForm<IncidentFormValues>({
    defaultValues: {
      zone: "",
      type: "citizen",
      locationName: "",
      description: "",
      latitude: "",
      longitude: "",
    } as any,
  });

  const mutation = trpc.flood.reportIncident.useMutation({
    onSuccess: async () => {
      await utils.flood.incidents.invalidate();
      setOpen(false);
      form.reset();
    },
  });

  const onSubmit = (values: IncidentFormValues) => {
    const latitude =
      values.latitude && values.latitude.trim() !== ""
        ? Number(values.latitude)
        : undefined;
    const longitude =
      values.longitude && values.longitude.trim() !== ""
        ? Number(values.longitude)
        : undefined;

    mutation.mutate({
      zone: values.zone,
      type: values.type,
      locationName: values.locationName,
      description: values.description,
      latitude: Number.isNaN(latitude) ? undefined : latitude,
      longitude: Number.isNaN(longitude) ? undefined : longitude,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          Report Flood / Waterlogging
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle>Report Flooded Area</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-2"
          >
            <FormField
              control={form.control}
              name="zone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zone / Area</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Delhi zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {DELHI_ZONES.map((z) => (
                          <SelectItem key={z} value={z}>
                            {z}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="citizen">Citizen report</SelectItem>
                        <SelectItem value="drain">IoT / drain sensor</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Minto Bridge, ITO, Yamuna Ghat"
                      {...field}
                    />
                  </FormControl>
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
                      rows={3}
                      placeholder="Briefly describe the flooding or waterlogging you see."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="28.6139" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="77.2090" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full"
              >
                {mutation.isPending ? "Submitting..." : "Submit report"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


