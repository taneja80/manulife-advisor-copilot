import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { FileText, Send, CalendarPlus } from "lucide-react";

interface MeetingDebriefProps {
    isOpen: boolean;
    onClose: () => void;
    clientName?: string;
}

export function MeetingDebrief({ isOpen, onClose, clientName = "Client" }: MeetingDebriefProps) {
    const { toast } = useToast();
    const [notes, setNotes] = useState("");
    const [sendEmail, setSendEmail] = useState(true);
    const [scheduleFollowUp, setScheduleFollowUp] = useState(false);

    const handleSave = () => {
        // In a real app, this would save to the backend CRM
        console.log("Saving meeting notes:", { notes, sendEmail, scheduleFollowUp });

        toast({
            title: "Meeting Logged",
            description: sendEmail
                ? `Notes saved and follow-up email queued for ${clientName}.`
                : "Meeting notes saved to client timeline.",
        });

        onClose();
        setNotes(""); // Reset
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Meeting Debrief</DialogTitle>
                    <DialogDescription>
                        You just exited Client View. Do you want to log this interaction with {clientName}?
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Meeting Notes / Minutes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Discussed portfolio performance. Client concerned about inflation. Agreed to switch to 'Moderate Growth' model..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="h-32"
                        />
                    </div>

                    <div className="flex items-center space-x-2 border p-3 rounded-md bg-muted/20">
                        <Checkbox id="email" checked={sendEmail} onCheckedChange={(c) => setSendEmail(!!c)} />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                                <Send className="w-3 h-3 text-muted-foreground" />
                                Auto-send Summary Email
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Sends a recap of these notes to {clientName} (you can edit before sending).
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 border p-3 rounded-md bg-muted/20">
                        <Checkbox id="followup" checked={scheduleFollowUp} onCheckedChange={(c) => setScheduleFollowUp(!!c)} />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="followup" className="flex items-center gap-2 cursor-pointer">
                                <CalendarPlus className="w-3 h-3 text-muted-foreground" />
                                Schedule Follow-up Task
                            </Label>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose}>Skip</Button>
                    <Button onClick={handleSave} className="bg-[#00A758] hover:bg-[#008a47]">
                        <FileText className="w-4 h-4 mr-2" />
                        Save Log
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
