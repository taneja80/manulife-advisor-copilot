import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Send, FileText, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { formatPHP, getFundById, type Goal, type GoalFundAllocation } from "@/lib/mockData";

interface TradeEmailPreviewProps {
    open: boolean;
    onClose: () => void;
    onSend: (email: string, personalNote: string) => Promise<void>;
    clientName: string;
    goal: Goal;
    funds: GoalFundAllocation[];
    isSending: boolean;
}

export function TradeEmailPreview({
    open,
    onClose,
    onSend,
    clientName,
    goal,
    funds,
    isSending,
}: TradeEmailPreviewProps) {
    const [clientEmail, setClientEmail] = useState("");
    const [personalNote, setPersonalNote] = useState("");
    const [sent, setSent] = useState(false);

    const firstName = clientName.split(" ")[0];
    const totalInvested = goal.portfolio.totalInvested;

    const handleSend = async () => {
        if (!clientEmail.trim()) return;
        await onSend(clientEmail, personalNote);
        setSent(true);
    };

    const handleClose = () => {
        setSent(false);
        setClientEmail("");
        setPersonalNote("");
        onClose();
    };

    if (sent) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[480px]">
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-[#00A758]" />
                        </div>
                        <h3 className="text-lg font-bold">Trade Instructions Sent!</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            An email has been sent to <span className="font-medium text-foreground">{clientEmail}</span> with
                            the portfolio allocation details for <span className="font-medium text-foreground">{goal.name}</span>.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            The client will need to fund their account and confirm the trade to proceed.
                        </p>
                        <Button onClick={handleClose} className="mt-2 bg-[#00A758] hover:bg-[#008a47]">
                            Done
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-[#00A758]" />
                        Send Trade Instructions
                    </DialogTitle>
                    <DialogDescription>
                        Review the email before sending to {clientName}
                    </DialogDescription>
                </DialogHeader>

                {/* Recipient */}
                <div className="space-y-2">
                    <Label htmlFor="client-email-trade">Client Email</Label>
                    <Input
                        id="client-email-trade"
                        type="email"
                        placeholder="e.g., juan@email.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        data-testid="input-trade-email"
                    />
                </div>

                <Separator />

                {/* Email Preview */}
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="font-medium uppercase tracking-wide">Email Preview</span>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                        <p><span className="font-medium">From:</span> Advisor via Manulife Co-Pilot</p>
                        <p><span className="font-medium">To:</span> {clientEmail || "(enter email above)"}</p>
                        <p>
                            <span className="font-medium">Subject:</span>{" "}
                            <span className="text-foreground">
                                Action Required: Review Portfolio for {goal.name}
                            </span>
                        </p>
                    </div>

                    <Separator />

                    <div className="space-y-3 text-sm">
                        <p>Dear {firstName},</p>

                        <p>
                            Following our discussion, I've prepared a portfolio allocation for your
                            <span className="font-semibold"> {goal.name} </span>
                            goal. Please review the details below and fund your account to proceed.
                        </p>

                        {/* Portfolio Summary Table */}
                        <div className="rounded-md border overflow-hidden">
                            <div className="bg-[#00A758]/10 px-3 py-2 border-b">
                                <p className="text-xs font-bold text-[#00A758]">
                                    Portfolio Allocation — {goal.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                    Total: {formatPHP(totalInvested)} · Target: {goal.targetDate}
                                </p>
                            </div>
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left px-3 py-1.5 font-medium">Fund</th>
                                        <th className="text-right px-3 py-1.5 font-medium">Weight</th>
                                        <th className="text-right px-3 py-1.5 font-medium">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {funds.map((f) => {
                                        const fund = getFundById(f.fundId);
                                        return (
                                            <tr key={f.fundId} className="border-b last:border-0">
                                                <td className="px-3 py-1.5">
                                                    <span className="font-medium">{fund?.name || f.fundId}</span>
                                                    {fund && (
                                                        <span className="text-muted-foreground ml-1">
                                                            ({fund.category})
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-right px-3 py-1.5 font-medium">
                                                    {f.weight}%
                                                </td>
                                                <td className="text-right px-3 py-1.5">
                                                    {formatPHP(Math.round((f.weight / 100) * totalInvested))}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <p>
                            To proceed, please log in to your Manulife account, fund the account with the
                            required amount, and confirm the trade execution.
                        </p>

                        {/* Compliance Disclaimer */}
                        <div className="flex items-start gap-2 p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed">
                                <strong>Important:</strong> Past performance is not indicative of future results.
                                Investment values may go down as well as up. Please ensure you have read
                                and understood the fund prospectus before proceeding. This email does not constitute
                                investment advice.
                            </p>
                        </div>

                        <p className="text-muted-foreground text-xs">
                            Best regards,<br />
                            Your Manulife Advisory Team
                        </p>
                    </div>
                </div>

                {/* Personal Note */}
                <div className="space-y-2">
                    <Label htmlFor="personal-note" className="text-xs">Add a Personal Note (Optional)</Label>
                    <Textarea
                        id="personal-note"
                        placeholder={`e.g., "Hi ${firstName}, it was great meeting today. Looking forward to getting this started!"`}
                        value={personalNote}
                        onChange={(e) => setPersonalNote(e.target.value)}
                        className="h-16 text-sm resize-none"
                        data-testid="input-personal-note"
                    />
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={handleClose} className="sm:mr-auto">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={!clientEmail.trim() || isSending}
                        className="bg-[#00A758] hover:bg-[#008a47] gap-2"
                        data-testid="button-send-trade-email"
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Send to {firstName}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
