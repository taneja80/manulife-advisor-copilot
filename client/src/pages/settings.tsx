import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
    User,
    Shield,
    Bell,
    Palette,
    Globe,
    Info,
} from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold" data-testid="text-settings-title">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Configure your advisor preferences and application settings
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0, duration: 0.3 }}>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#00A758]/10">
                                    <User className="w-4 h-4 text-[#00A758]" />
                                </div>
                                Advisor Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Name</span>
                                <span className="text-sm font-medium">Advisor User</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Role</span>
                                <Badge variant="outline" className="text-xs">Financial Advisor</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Region</span>
                                <span className="text-sm font-medium">Philippines</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">License</span>
                                <Badge className="text-xs bg-[#00A758] border-[#00A758]">Active</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.3 }}>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#0C7143]/10">
                                    <Shield className="w-4 h-4 text-[#0C7143]" />
                                </div>
                                Risk Defaults
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Default Risk Profile</span>
                                <Badge variant="outline" className="text-xs">Moderate</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Drift Tolerance</span>
                                <span className="text-sm font-medium">±5%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Rebalance Frequency</span>
                                <span className="text-sm font-medium">Quarterly</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Auto-DCA</span>
                                <Badge variant="outline" className="text-xs text-[#00A758] border-[#00A758]">Enabled</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#F59E0B]/10">
                                    <Bell className="w-4 h-4 text-[#F59E0B]" />
                                </div>
                                Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Goal Alerts</span>
                                <Badge variant="outline" className="text-xs text-[#00A758] border-[#00A758]">On</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Drift Alerts</span>
                                <Badge variant="outline" className="text-xs text-[#00A758] border-[#00A758]">On</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Market Updates</span>
                                <Badge variant="outline" className="text-xs text-muted-foreground">Off</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Client Birthdays</span>
                                <Badge variant="outline" className="text-xs text-[#00A758] border-[#00A758]">On</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#2E86AB]/10">
                                    <Globe className="w-4 h-4 text-[#2E86AB]" />
                                </div>
                                Regional Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Currency</span>
                                <span className="text-sm font-medium">₱ PHP</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Inflation Rate</span>
                                <span className="text-sm font-medium">5.3% (BSP)</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Benchmark</span>
                                <span className="text-sm font-medium">PSEi</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Date Format</span>
                                <span className="text-sm font-medium">DD/MM/YYYY</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                                <Info className="w-4 h-4 text-muted-foreground" />
                            </div>
                            About
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Version</span>
                            <span className="text-sm font-medium">1.0.0</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Build</span>
                            <span className="text-sm font-medium">2026.02.12</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Platform</span>
                            <span className="text-sm font-medium">Manulife Philippines</span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
